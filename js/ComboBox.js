// Copyright 2013-2016, University of Colorado Boulder

/**
 * Scenery-based combo box. Composed of a button and a list of items.
 * The list of items is displayed when the button is pressed, and dismissed an item is selected
 * or the user clicks outside the list.  The list can be displayed either above or below the button.
 *
 * An item in the combo box has 2 properties: {Node} node, {*} value.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Emitter = require( 'AXON/Emitter' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var sun = require( 'SUN/sun' );
  var Vector2 = require( 'DOT/Vector2' );
  var Tandem = require( 'TANDEM/Tandem' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Path = require( 'SCENERY/nodes/Path' );

  // phet-io modules
  var TComboBox = require( 'SUN/TComboBox' );
  var TComboBoxItemNode = require( 'SUN/TComboBoxItemNode' );
  var TObject = require( 'ifphetio!PHET_IO/types/TObject' );

  /**
   * @param {*[]} items - see ComboBox.createItem
   * @param {Property} property
   * @param {Node} listParent node that will be used as the list's parent, use this to ensuring that the list is in front of everything else
   * @param {Object} [options] object with optional properties
   * @constructor
   */
  function ComboBox( items, property, listParent, options ) {

    var self = this;

    // Register for tandem if possible.
    // Allow running with phetioValidateTandems=false though
    var type = property.phetioValueType;
    if ( phet.phetio && phet.phetio.queryParameters && !phet.phetio.queryParameters.phetioValidateTandems && !type ) {
      type = TObject;
    }

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
      itemYMargin: 6,
      itemHighlightFill: 'rgb(245,245,245)',
      itemHighlightStroke: null,
      itemHighlightLineWidth: 1,

      // tandem
      tandem: Tandem.tandemRequired(),
      phetioType: TComboBox( type )
    }, options );

    // validate option values
    assert && assert( options.disabledOpacity > 0 && options.disabledOpacity < 1, 'invalid disabledOpacity: ' + options.disabledOpacity );

    Node.call( self );

    this.enabledProperty = options.enabledProperty; // @public

    this.startedCallbacksForComboBoxDismissedEmitter = new Emitter();
    this.endedCallbacksForComboBoxDismissedEmitter = new Emitter();
    this.startedCallbacksForComboBoxPopupShownEmitter = new Emitter();
    this.endedCallbacksForComboBoxPopupShownEmitter = new Emitter();

    // optional label
    if ( options.labelNode !== null ) {
      self.addChild( options.labelNode );
    }

    // determine uniform dimensions for button and list items
    var itemWidth = 0;
    var itemHeight = 0;
    for ( var i = 0; i < items.length; i++ ) {
      var item = items[ i ];
      if ( item.node.width > itemWidth ) { itemWidth = item.node.width; }
      if ( item.node.height > itemHeight ) { itemHeight = item.node.height; }
    }
    itemWidth += ( 2 * options.itemXMargin );
    itemHeight += ( 2 * options.itemYMargin );

    // button, will be set to correct value when property observer is registered
    var buttonNode = new ButtonNode( new ComboBoxItemNode( items[ 0 ], itemWidth, itemHeight, options.itemXMargin, {
      tandem: options.tandem.createTandem( 'buttonNode' ).createTandem( 'itemNode' ),
      phetioValueType: property.phetioValueType
    } ), options );
    self.addChild( buttonNode );

    // list
    var listWidth = itemWidth + ( 2 * options.buttonXMargin );
    var listHeight = ( items.length * itemHeight ) + ( 2 * options.listYMargin );
    var listNode = new Rectangle( 0, 0, listWidth, listHeight, options.listCornerRadius, options.listCornerRadius,
      { fill: options.listFill, stroke: options.listStroke, lineWidth: options.listLineWidth, visible: false } );
    listParent.addChild( listNode );

    //TODO move these to ComboBoxItemNode
    // how to highlight an item in the list
    var highlightItem = function( itemNode ) {
      itemNode.fill = options.itemHighlightFill;
      itemNode.stroke = options.itemHighlightStroke;
    };
    var unhighlightItem = function( itemNode ) {
      itemNode.fill = null;
      itemNode.stroke = null;
    };

    // listener that we'll attach to each item in the list
    var itemListener = {
      enter: function( event ) {
        highlightItem( event.currentTarget );
      },
      exit: function( event ) {
        unhighlightItem( event.currentTarget );
      },
      down: function( event ) {
        event.abort(); // prevent click-to-dismiss on the list
      },
      up: function( event ) {

        event.currentTarget.startedCallbacksForItemFiredEmitter.emit1( event.currentTarget.item.value );

        unhighlightItem( event.currentTarget );
        listNode.visible = false; // close the list, do this before changing property value, in case it's expensive
        self.getUniqueTrail().rootNode().removeInputListener( clickToDismissListener ); // remove the click-to-dismiss listener
        event.abort(); // prevent nodes (eg, controls) behind the list from receiving the event
        property.value = event.currentTarget.item.value; // set the property

        event.currentTarget.endedCallbacksForItemFiredEmitter.emit1( event.currentTarget.item.value );

      }
    };

    // populate list with items
    for ( var j = 0; j < items.length; j++ ) {

      var itemNodeOptions = items[ j ].options || {};

      // Create tandems for each ComboBoxItemNode
      var itemNodeTandem = null;

      // We don't want assert if running in phet brand
      if ( phet.chipper.brand === 'phet-io' && phet.phetio && phet.phetio.queryParameters
           && phet.phetio.queryParameters.phetioValidateTandems ) {
        assert && assert( itemNodeOptions.tandemName, 'For instrumented ComboBoxes, ItemNodes must have a tandemName' );
      }
      itemNodeTandem = options.tandem.createTandem( itemNodeOptions.tandemName || ('comboBoxItemNode' + j) );
      itemNodeOptions.tandem = itemNodeTandem;
      itemNodeOptions.phetioValueType = property.phetioValueType;

      // Create the list item node itself
      var itemNode = new ComboBoxItemNode( items[ j ], itemWidth, itemHeight, options.itemXMargin, itemNodeOptions );

      // add item to list
      listNode.addChild( itemNode );
      itemNode.left = options.buttonXMargin;
      itemNode.top = options.listYMargin + ( j * itemHeight );

      // item interactivity
      itemNode.cursor = 'pointer';
      itemNode.addInputListener( itemListener );
    }

    //TODO handle scale and rotation
    // Handles the coordinate transform required to make the list pop up near the button.
    var moveList = function() {
      var pButtonGlobal;
      var pButtonLocal;
      if ( options.listPosition === 'above' ) {
        pButtonGlobal = self.localToGlobalPoint( new Vector2( buttonNode.left, buttonNode.top ) );
        pButtonLocal = listParent.globalToLocalPoint( pButtonGlobal );
        listNode.left = pButtonLocal.x;
        listNode.bottom = pButtonLocal.y;
      }
      else {
        pButtonGlobal = self.localToGlobalPoint( new Vector2( buttonNode.left, buttonNode.bottom ) );
        pButtonLocal = listParent.globalToLocalPoint( pButtonGlobal );
        listNode.left = pButtonLocal.x;
        listNode.top = pButtonLocal.y;
      }
    };

    /**
     * Because clickToDismissListener is added to the scene, it receives the 'down' event that
     * buttonNode received to register the listener. This is because scenery propagates events
     * up the event trail, and the scene is further up the trail than the button.  This flag
     * is used to ignore the first 'down' event, which is the one that the button received.
     * If we don't do this, then we never see the list because it is immediately popped down.
     * This behavior is may change, and is being discussed in scenery#58.
     */
    var enableClickToDismissListener;
    var sceneNode; // store the node that clickToDismissListener is added to, because the scene may change, see sun#14

    // listener for 'click outside to dismiss'
    var clickToDismissListener = {
      down: function() {
        if ( enableClickToDismissListener ) {

          self.startedCallbacksForComboBoxDismissedEmitter.emit();

          sceneNode.removeInputListener( clickToDismissListener );
          listNode.visible = false;

          self.endedCallbacksForComboBoxDismissedEmitter.emit();
        }
        else {
          enableClickToDismissListener = true;
        }
      }
    };

    // button interactivity
    buttonNode.cursor = 'pointer';
    buttonNode.addInputListener(
      {
        down: function() {
          if ( !listNode.visible ) {
            self.startedCallbacksForComboBoxPopupShownEmitter.emit();

            moveList();
            listNode.moveToFront();
            listNode.visible = true;
            enableClickToDismissListener = false;
            sceneNode = self.getUniqueTrail().rootNode();
            sceneNode.addInputListener( clickToDismissListener );

            self.endedCallbacksForComboBoxPopupShownEmitter.emit();
          }
        }
      } );

    // layout
    if ( options.labelNode ) {
      buttonNode.left = options.labelNode.right + options.labelXSpacing;
      buttonNode.centerY = options.labelNode.centerY;
    }

    // when property changes, update button
    var propertyObserver = function( value ) {
      // TODO brute force search, better way?
      var item = null;
      for ( var i = 0; i < items.length; i++ ) {
        if ( items[ i ].value === value ) {
          item = items[ i ];
        }
      }
      assert && assert( item !== null );
      buttonNode.setItemNode( new ComboBoxItemNode( item, itemWidth, itemHeight, options.itemXMargin, {
        tandem: options.tandem.createTandem( 'buttonNode', { enabled: false } ),
        phetioValueType: property.phetioValueType
      } ) );
    };
    property.link( propertyObserver );

    this.mutate( options );

    // enable/disable the combo box
    var enabledObserver = function( enabled ) {
      self.pickable = enabled;
      self.opacity = enabled ? 1.0 : options.disabledOpacity;
    };
    this.enabledProperty.link( enabledObserver );

    // @private called by dispose
    this.disposeComboBox = function() {
      self.enabledProperty.unlink( enabledObserver );

      // Unregister itemNode tandems as well
      for ( var i = 0; i < listNode.children.length; i++ ) {
        listNode.children[ i ].dispose();
      }
      buttonNode.dispose();
      property.unlink( propertyObserver );
    };
  }

  sun.register( 'ComboBox', ComboBox );

  inherit( Node, ComboBox, {

    // @public - Provide dispose() on the prototype for ease of subclassing.
    dispose: function() {
      this.disposeComboBox();
      Node.prototype.dispose.call( this );
    },

    // @public
    setEnabled: function( enabled ) { this.enabledProperty.value = enabled; },
    set enabled( value ) { this.setEnabled( value ); },

    // @public
    getEnabled: function() { return this.enabledProperty.value; },
    get enabled() { return this.getEnabled(); }
  } );

  /**
   * Creates a combo box item.
   * This exists primarily to document the structure of an item.
   * @param {Node} node
   * @param {*} value
   * @param {Object} [options] For PhET-iO instrumented simulations, the following must be supplied:
   *                             tandemName: {string} - the suffix applied to button tandems
   *                             phetioValueType: {function} - the wrapper type, such as TSolute
   *                           No other options are supported.
   * @returns {object}
   * @public
   */
  ComboBox.createItem = function( node, value, options ) {
    return { node: node, value: value, options: options };
  };

  /**
   * The button that is clicked to show the list of items.
   * @param {Node} itemNode
   * @param {Object} [options]
   * @constructor
   */
  function ButtonNode( itemNode, options ) {

    options = _.extend( {
      tandem: Tandem.tandemRequired(), // For PhET-iO instrumented simulations, this must be supplied

      // these options are passed in from ComboBox options
      listPosition: 'below',
      buttonFill: 'white',
      buttonStroke: 'black',
      buttonLineWidth: 1,
      buttonCornerRadius: 8,
      buttonXMargin: 10,
      buttonYMargin: 4

    }, options );

    Node.call( this );

    // up or down arrow
    var arrow = new Path( null, {
      fill: 'black',
      tandem: options.tandem.createTandem( 'arrow' )
    } );
    var arrowWidth = 0.5 * itemNode.height;
    var arrowHeight = arrowWidth * Math.sqrt( 3 ) / 2; // height of equilateral triangle
    if ( options.listPosition === 'above' ) {
      arrow.shape = new Shape().moveTo( 0, arrowHeight ).lineTo( arrowWidth / 2, 0 ).lineTo( arrowWidth, arrowHeight ).close(); // up arrow
    }
    else {
      arrow.shape = new Shape().moveTo( 0, 0 ).lineTo( arrowWidth, 0 ).lineTo( arrowWidth / 2, arrowHeight ).close(); // down arrow
    }

    // button background
    var width = itemNode.width + ( 4 * options.buttonXMargin ) + arrow.width;
    var height = itemNode.height + ( 2 * options.buttonYMargin );
    var background = new Rectangle( 0, 0, width, height, options.buttonCornerRadius, options.buttonCornerRadius,
      { fill: options.buttonFill, stroke: options.buttonStroke, lineWidth: options.buttonLineWidth } );

    // vertical separator to left of arrow
    var separator = new Line( 0, 0, 0, height, {
      stroke: 'black',
      lineWidth: options.buttonLineWidth,
      tandem: options.tandem.createTandem( 'separator' )
    } );

    // itemNode's parent
    var itemNodeParent = new Node();

    // rendering order
    this.addChild( background );
    this.addChild( arrow );
    this.addChild( separator );
    this.addChild( itemNodeParent );

    // @private
    this.setItemNode = function( itemNode ) {
      itemNodeParent.removeAllChildren();
      itemNodeParent.addChild( itemNode );
      itemNode.left = options.buttonXMargin;
      itemNode.top = options.buttonYMargin;
    };
    this.setItemNode( itemNode );

    // layout
    separator.left = itemNode.right + options.buttonXMargin;
    separator.top = background.top;
    arrow.left = separator.right + options.buttonXMargin;
    arrow.centerY = background.centerY;

    this.disposeButtonNode = function() {
      options.tandem.createTandem( 'separator' ).removeInstance( separator );
      options.tandem.createTandem( 'arrow' ).removeInstance( arrow );
      itemNode.dispose();
    };
  }

  sun.register( 'ComboBox.ButtonNode', ButtonNode );

  inherit( Node, ButtonNode, {
    dispose: function() {
      this.disposeButtonNode();
      Node.prototype.dispose.call( this );
    }
  } );

  /**
   * A wrapper around the combo box item, adds margins, etc.
   * @param {Object} item - see ComboBox.createItem
   * @param {number} width
   * @param {number} height
   * @param {number} xMargin
   * @param {Object} [options]
   * @constructor
   * @private
   */
  function ComboBoxItemNode( item, width, height, xMargin, options ) {

    options = _.extend( {
      tandem: Tandem.tandemRequired(),
      phetioValueType: null // Must be supplied for PhET-iO instrumented simulations
    }, options );

    Rectangle.call( this, 0, 0, width, height, {
      tandem: options.tandem.createSupertypeTandem()
    } );

    this.item = item;
    this.addChild( item.node );
    item.node.pickable = false; // hits will occur on the rectangle
    item.node.x = xMargin;
    item.node.centerY = height / 2;

    this.startedCallbacksForItemFiredEmitter = new Emitter();
    this.endedCallbacksForItemFiredEmitter = new Emitter();

    options.tandem.addInstance( this, TComboBoxItemNode( options.phetioValueType ) );
  }

  sun.register( 'ComboBox.ItemNode', ComboBoxItemNode );

  inherit( Rectangle, ComboBoxItemNode );

  return ComboBox;
} );