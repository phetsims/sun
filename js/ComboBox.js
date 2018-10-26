// Copyright 2013-2017, University of Colorado Boulder

/**
 * Scenery-based combo box. Composed of a button and a list of items.
 * The list of items is displayed when the button is pressed, and dismissed an item is selected
 * or the user clicks outside the list.  The list can be displayed either above or below the button.
 *
 * An item in the combo box has 2 properties: {Node} node, {*} value.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const ComboBoxIO = require( 'SUN/ComboBoxIO' );
  const Emitter = require( 'AXON/Emitter' );
  const EmitterIO = require( 'AXON/EmitterIO' );
  const inherit = require( 'PHET_CORE/inherit' );
  const InstanceRegistry = require( 'PHET_CORE/documentation/InstanceRegistry' );
  const Line = require( 'SCENERY/nodes/Line' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Property = require( 'AXON/Property' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Shape = require( 'KITE/Shape' );
  const sun = require( 'SUN/sun' );
  const Tandem = require( 'TANDEM/Tandem' );
  const Vector2 = require( 'DOT/Vector2' );
  const VoidIO = require( 'TANDEM/types/VoidIO' );

  /**
   * @param {*[]} items - see ComboBox.createItem
   * @param {Property} property
   * @param {Node} listParent node that will be used as the list's parent, use this to ensuring that the list is in front of everything else
   * @param {Object} [options] object with optional properties
   * @constructor
   */
  function ComboBox( items, property, listParent, options ) {

    options = _.extend( {

      labelNode: null, // optional label, placed to the left of the combo box
      labelXSpacing: 10, // horizontal space between label and combo box
      enabledProperty: new Property( true ),
      disabledOpacity: 0.5, // {number} opacity used to make the control look disabled

      // button
      buttonFill: 'white',
      buttonStroke: 'black',
      buttonLineWidth: 1,
      buttonCornerRadius: 8,
      buttonXMargin: 10,
      buttonYMargin: 4,

      // list
      listPosition: 'below', // where the list is positioned relative to the button, either 'below' or 'above'
      listYMargin: 4,
      listFill: 'white',
      listStroke: 'black',
      listLineWidth: 1,
      listCornerRadius: 5,

      // items
      itemXMargin: 6,
      itemYMargin: 6, // Vertical margin applied to the top and bottom of each item in the popup list.
      itemHighlightFill: 'rgb(245,245,245)',
      itemHighlightStroke: null,
      itemHighlightLineWidth: 1,

      // phet-io
      tandem: Tandem.required,
      phetioType: ComboBoxIO,
      phetioEventType: 'user'
    }, options );

    // validate option values
    assert && assert( options.disabledOpacity > 0 && options.disabledOpacity < 1, 'invalid disabledOpacity: ' + options.disabledOpacity );

    Node.call( this );

    this.enabledProperty = options.enabledProperty; // @public
    this.listPosition = options.listPosition; // @private

    // optional label
    if ( options.labelNode !== null ) {
      this.addChild( options.labelNode );
    }

    //TODO https://github.com/phetsims/scenery/issues/58
    /**
     * @private
     * Because clickToDismissListener is added to the scene, it receives the 'down' event that
     * buttonNode received to register the listener. This is because scenery propagates events
     * up the event trail, and the scene is further up the trail than the button.  This flag
     * is used to ignore the first 'down' event, which is the one that the button received.
     * If we don't do this, then we never see the list because it is immediately popped down.
     * This behavior may change, and is being discussed in scenery#58.
     */
    this.enableClickToDismissListener = false;

    // @private the display that clickToDismissListener is added to, because the scene may change, see sun#14
    this.display = null;

    // @private listener for 'click outside to dismiss'
    this.clickToDismissListener = {
      down: this.hideList.bind( this )
    };

    // determine uniform dimensions for button and list items (including margins)
    const itemWidth = Math.max.apply( Math, _.map( items, 'node.width' ) ) + 2 * options.itemXMargin;
    const itemHeight = Math.max.apply( Math, _.map( items, 'node.height' ) ) + 2 * options.itemYMargin;

    const listWidth = itemWidth + ( 2 * options.buttonXMargin );
    const listHeight = ( items.length * itemHeight ) + ( 2 * options.listYMargin );

    // @private the popup list
    this.listNode = new Rectangle( 0, 0, listWidth, listHeight, {
      cornerRadius: options.listCornerRadius,
      fill: options.listFill,
      stroke: options.listStroke,
      lineWidth: options.listLineWidth,
      visible: false
      // Not instrumented for PhET-iO because the list's location isn't valid until it has been popped up.
      // See https://github.com/phetsims/phet-io/issues/1102
    } );
    listParent.addChild( this.listNode );
    this.listParent = listParent; // @private

    //TODO move these to ComboBoxItemNode
    // how to highlight an item in the list
    const highlightItem = itemNode => {
      itemNode.fill = options.itemHighlightFill;
      itemNode.stroke = options.itemHighlightStroke;
    };
    const unhighlightItem = itemNode => {
      itemNode.fill = null;
      itemNode.stroke = null;
    };

    // TODO: It seems it would be better to use FireListener on each ComboBoxItemNode, see https://github.com/phetsims/sun/issues/405
    const firedEmitter = new Emitter( {
      tandem: options.tandem.createTandem( 'firedEmitter' ),
      phetioType: EmitterIO( [ { name: 'event', type: VoidIO } ] ), // TODO: Should this be EventIO or DOMEventIO?
      listener: ( event ) => {
        const selectedItemNode = event.currentTarget; // {ComboBoxItemNode}

        unhighlightItem( selectedItemNode );
        this.listNode.visible = false; // close the list, do this before changing property value, in case it's expensive
        this.display.removeInputListener( this.clickToDismissListener ); // remove the click-to-dismiss listener
        event.abort(); // prevent nodes (eg, controls) behind the list from receiving the event
        property.value = selectedItemNode.item.value; // set the property
      }
    } );

    // listener that we'll attach to each item in the list
    const itemListener = {
      enter( event ) {
        highlightItem( event.currentTarget );
      },
      exit( event ) {
        unhighlightItem( event.currentTarget );
      },
      down( event ) {
        event.abort(); // prevent click-to-dismiss on the list
      },
      up( event ) {
        firedEmitter.emit1( event );
      }
    };

    // populate list with items
    items.forEach( ( item, index ) => {
      const itemNodeOptions = _.extend( {
        left: options.buttonXMargin,
        top: options.listYMargin + ( index * itemHeight ),
        cursor: 'pointer',
        inputListeners: [ itemListener ]
      }, item.options );

      // For 'phet-io' brand, the tandems for items must be provided.  For other brands, the tandems are not required
      // and are filled in with substitutes so the tandems are still defined.
      if ( Tandem.validationEnabled() ) {
        assert && assert( itemNodeOptions.tandemName, 'For instrumented ComboBoxes, ItemNodes must have a tandemName' );
      }
      itemNodeOptions.tandem = options.tandem.createTandem( itemNodeOptions.tandemName || 'comboBoxItemNode' );

      // Create the list item node itself
      this.listNode.addChild( new ComboBoxItemNode( item, itemWidth, itemHeight, options.itemXMargin, itemNodeOptions ) );
    } );

    // @private button, will be set to correct value when property observer is registered
    this.buttonNode = new ButtonNode( new ComboBoxItemNode( items[ 0 ], itemWidth, itemHeight, options.itemXMargin ), options );
    this.addChild( this.buttonNode );

    // button interactivity
    this.buttonNode.cursor = 'pointer';
    this.buttonNode.addInputListener( {
      down: this.showList.bind( this )
    } );

    // layout
    if ( options.labelNode ) {
      this.buttonNode.left = options.labelNode.right + options.labelXSpacing;
      this.buttonNode.centerY = options.labelNode.centerY;
    }

    // when property changes, update button
    const propertyObserver = value => {
      const item = _.find( items, item => {
        return item.value === value;
      } );
      this.buttonNode.setItemNode( new ComboBoxItemNode( item, itemWidth, itemHeight, options.itemXMargin ) );
    };
    property.link( propertyObserver );

    this.mutate( options );

    // enable/disable the combo box
    const enabledObserver = enabled => {
      this.pickable = enabled;
      this.opacity = enabled ? 1.0 : options.disabledOpacity;
    };
    this.enabledProperty.link( enabledObserver );

    // @private called by dispose
    this.disposeComboBox = () => {

      if ( property.hasListener( propertyObserver ) ) {
        property.unlink( propertyObserver );
      }
      if ( this.enabledProperty.hasListener( enabledObserver ) ) {
        this.enabledProperty.unlink( enabledObserver );
      }

      // Unregister itemNode tandems as well
      for ( let i = 0; i < this.listNode.children.length; i++ ) {
        this.listNode.children[ i ].dispose();
      }

      this.buttonNode.dispose();
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'ComboBox', this );
  }

  sun.register( 'ComboBox', ComboBox );

  inherit( Node, ComboBox, {

    // @public - Provide dispose() on the prototype for ease of subclassing.
    dispose() {
      this.disposeComboBox();
      Node.prototype.dispose.call( this );
    },

    // @public
    setEnabled( enabled ) { this.enabledProperty.value = enabled; },
    set enabled( value ) { this.setEnabled( value ); },

    // @public
    getEnabled() { return this.enabledProperty.value; },
    get enabled() { return this.getEnabled(); },

    /**
     * Shows the combo box list
     * @public
     */
    showList() {
      if ( !this.listNode.visible ) {
        this.phetioStartEvent( 'popupShown' );

        this.moveList();
        this.listNode.moveToFront();
        this.listNode.visible = true;
        this.enableClickToDismissListener = false;
        this.display = this.getUniqueTrail().rootNode().getRootedDisplays()[ 0 ];
        this.display.addInputListener( this.clickToDismissListener );

        this.phetioEndEvent();
      }
    },

    /**
     * Hides the combo box list
     * @public
     */
    hideList() {
      if ( this.enableClickToDismissListener ) {

        this.phetioStartEvent( 'popupHidden' );

        if ( this.display && this.display.hasInputListener( this.clickToDismissListener ) ) {
          this.display.removeInputListener( this.clickToDismissListener );
        }
        this.listNode.visible = false;

        this.phetioEndEvent();
      }
      else {
        this.enableClickToDismissListener = true;
      }
    },

    //TODO handle scale and rotation
    /**
     * Handles the coordinate transform required to make the list pop up near the button.
     * @private
     */
    moveList() {
      let pButtonGlobal;
      let pButtonLocal;
      if ( this.listPosition === 'above' ) {
        pButtonGlobal = this.localToGlobalPoint( new Vector2( this.buttonNode.left, this.buttonNode.top ) );
        pButtonLocal = this.listParent.globalToLocalPoint( pButtonGlobal );
        this.listNode.left = pButtonLocal.x;
        this.listNode.bottom = pButtonLocal.y;
      }
      else {
        pButtonGlobal = this.localToGlobalPoint( new Vector2( this.buttonNode.left, this.buttonNode.bottom ) );
        pButtonLocal = this.listParent.globalToLocalPoint( pButtonGlobal );
        this.listNode.left = pButtonLocal.x;
        this.listNode.top = pButtonLocal.y;
      }
    }
  } );

  /**
   * Creates a combo box item.
   * This exists primarily to document the structure of an item.
   * @param {Node} node
   * @param {*} value
   * @param {Object} [options] For PhET-iO instrumented simulations, the following must be supplied:
   *                             tandemName: {string} - the suffix applied to button tandems
   *                           No other options are supported.
   * @returns {object}
   * @public
   */
  ComboBox.createItem = ( node, value, options ) => {
    return { node: node, value: value, options: options };
  };

  /**
   * The button that is clicked to show the list of items.
   * @param {Node} itemNode
   * @param {Object} [options]
   * @private
   */
  class ButtonNode extends Node {
    constructor( itemNode, options ) {

      options = _.extend( {
        tandem: Tandem.required, // For PhET-iO instrumented simulations, this must be supplied

        // these options are passed in from ComboBox options
        listPosition: 'below',
        buttonFill: 'white',
        buttonStroke: 'black',
        buttonLineWidth: 1,
        buttonCornerRadius: 8,
        buttonXMargin: 10,
        buttonYMargin: 4

      }, options );

      super();

      // up or down arrow
      const arrow = new Path( null, {
        fill: 'black',
        tandem: options.tandem.createTandem( 'arrow' )
      } );
      const arrowWidth = 0.5 * itemNode.height;
      const arrowHeight = arrowWidth * Math.sqrt( 3 ) / 2; // height of equilateral triangle
      if ( options.listPosition === 'above' ) {
        arrow.shape = new Shape().moveTo( 0, arrowHeight ).lineTo( arrowWidth / 2, 0 ).lineTo( arrowWidth, arrowHeight ).close(); // up arrow
      }
      else {
        arrow.shape = new Shape().moveTo( 0, 0 ).lineTo( arrowWidth, 0 ).lineTo( arrowWidth / 2, arrowHeight ).close(); // down arrow
      }

      // button background
      const width = itemNode.width + ( 4 * options.buttonXMargin ) + arrow.width;
      const height = itemNode.height + ( 2 * options.buttonYMargin );
      const background = new Rectangle( 0, 0, width, height, {
        cornerRadius: options.buttonCornerRadius,
        fill: options.buttonFill,
        stroke: options.buttonStroke,
        lineWidth: options.buttonLineWidth
      } );

      // vertical separator to left of arrow
      const separator = new Line( 0, 0, 0, height, {
        stroke: 'black',
        lineWidth: options.buttonLineWidth,
        tandem: options.tandem.createTandem( 'separator' )
      } );

      // parent for the selected item node
      const selectedItemParent = new Node( {
        tandem: options.tandem.createTandem( 'selectedItemParent' )
      } );

      // rendering order
      this.addChild( background );
      this.addChild( arrow );
      this.addChild( separator );
      this.addChild( selectedItemParent );

      // @private
      this.setItemNode = ( itemNode ) => {
        // Dispose any existing item, see https://github.com/phetsims/sun/issues/299
        while ( selectedItemParent.children.length ) {
          const lastNode = selectedItemParent.children[ 0 ];
          selectedItemParent.removeChild( lastNode );
          lastNode.dispose();
        }
        selectedItemParent.addChild( itemNode );
        itemNode.left = options.buttonXMargin;
        itemNode.top = options.buttonYMargin;
      };
      this.setItemNode( itemNode );

      // layout
      separator.left = itemNode.right + options.buttonXMargin;
      separator.top = background.top;
      arrow.left = separator.right + options.buttonXMargin;
      arrow.centerY = background.centerY;

      this.disposeButtonNode = () => {
        separator.dispose();
        arrow.dispose();
        selectedItemParent.dispose();
        options.tandem.createTandem( 'separator' ).removeInstance( separator );
        options.tandem.createTandem( 'arrow' ).removeInstance( arrow );
        options.tandem.createTandem( 'selectedItemParent' ).removeInstance( selectedItemParent );
        itemNode.dispose();
      };
    }

    /**
     * @public
     * @override
     */
    dispose() {
      this.disposeButtonNode();
      super.dispose();
    }
  }

  sun.register( 'ComboBox.ButtonNode', ButtonNode );

  /**
   * A wrapper around the combo box item, adds margins, etc.
   * @param {Object} item - see ComboBox.createItem
   * @param {number} width
   * @param {number} height
   * @param {number} xMargin
   * @param {Object} [options]
   * @private
   */
  class ComboBoxItemNode extends Rectangle {
    constructor( item, width, height, xMargin, options ) {

      // @private {Node} - Holds our item.node, and positions it in the correct location. We don't want to mutate the
      //                   item's node itself.
      let itemWrapper = new Node( {
        children: [ item.node ],
        pickable: false,
        x: xMargin,
        centerY: height / 2
      } );

      options = _.extend( {
        tandem: Tandem.required,
        children: [ itemWrapper ]
      }, options );

      super( 0, 0, width, height, options );

      this.item = item;
      this.itemWrapper = itemWrapper;
    }

    /**
     * Disposes the item.
     * @public
     * @override
     */
    dispose() {
      this.itemWrapper.dispose();
      super.dispose();
    }
  }

  sun.register( 'ComboBox.ItemNode', ComboBoxItemNode );

  return ComboBox;
} );