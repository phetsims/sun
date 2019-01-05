// Copyright 2013-2018, University of Colorado Boulder

/**
 * Scenery-based combo box. Composed of a button and a list of items.
 * The list of items is displayed when the button is pressed, and dismissed when an item is selected
 * or the user clicks outside the list.  The list can be displayed either above or below the button.
 *
 * See createItem for information about items in a combo box.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );
  const ComboBoxIO = require( 'SUN/ComboBoxIO' );
  const Emitter = require( 'AXON/Emitter' );
  const EmitterIO = require( 'AXON/EmitterIO' );
  const inherit = require( 'PHET_CORE/inherit' );
  const InstanceRegistry = require( 'PHET_CORE/documentation/InstanceRegistry' );
  const KeyboardUtil = require( 'SCENERY/accessibility/KeyboardUtil' );
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

  // const
  const LIST_POSITION_VALUES = [ 'above', 'below' ];
  const ALIGN_VALUES = [ 'left', 'right', 'center' ];
  const BUTTON_NODE_DEFAULT_OPTIONS = {

    // used by ComboBox and ButtonNode
    listPosition: 'below', // {string} where the list is positioned relative to the button, see LIST_POSITION_VALUES
    align: 'left', // {string} alignment of items on the button and in the list, see ALIGN_VALUES

    // used exclusively by ButtonNode
    buttonFill: 'white',
    buttonStroke: 'black',
    buttonLineWidth: 1,
    buttonCornerRadius: 8,
    buttonXMargin: 10,
    buttonYMargin: 4,

    // a11y - used exclusively by ButtonNode
    a11yButtonLabel: '' // {string} accessible label for the button that opens this combobox
  };
  const BUTTON_NODE_KEYS = _.keys( BUTTON_NODE_DEFAULT_OPTIONS );

  // Default options used when an item is created via ComboBox.createItem
  const DEFAULT_ITEM_OPTIONS = {
    tandemName: 'itemNode', // {string} the default tandem name for all ItemNodes
    a11yLabel: null // {string} the label for each item in the combo box
  };

  /**
   * @param {*[]} items - must be created using ComboBox.createItem
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

      // list
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

    }, BUTTON_NODE_DEFAULT_OPTIONS, options );

    // validate option values
    assert && assert( options.disabledOpacity > 0 && options.disabledOpacity < 1,
      'invalid disabledOpacity: ' + options.disabledOpacity );
    assert && assert( LIST_POSITION_VALUES.includes( options.listPosition ),
      'invalid listPosition: ' + options.listPosition );
    assert && assert( ALIGN_VALUES.includes( options.align ),
      'invalid align: ' + options.align );

    // Note: ComboBox cannot use ES6 class until its subtypes do
    Node.call( this );

    this.items = items; // @private
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
    // TODO sun#314 handle this logic for a11y too, perhaps on by monitoring the focusout event on the display's root PDOM element
    this.clickToDismissListener = {
      down: this.hideListFromClick.bind( this )
    };

    // determine uniform dimensions for button and list items (including margins)
    const itemWidth = Math.max.apply( Math, _.map( items, 'node.width' ) ) + 2 * options.itemXMargin;
    const itemHeight = Math.max.apply( Math, _.map( items, 'node.height' ) ) + 2 * options.itemYMargin;

    const listWidth = itemWidth + ( 2 * options.buttonXMargin );
    const listHeight = ( items.length * itemHeight ) + ( 2 * options.listYMargin );

    //TODO #430 factor out ListNode inner class, to handle all list responsibilities
    // @private the popup list
    this.listNode = new Rectangle( 0, 0, listWidth, listHeight, {
      cornerRadius: options.listCornerRadius,
      fill: options.listFill,
      stroke: options.listStroke,
      lineWidth: options.listLineWidth,
      visible: false,
      // Not instrumented for PhET-iO because the list's location isn't valid until it has been popped up.
      // See https://github.com/phetsims/phet-io/issues/1102

      // a11y
      tagName: 'ul',
      ariaRole: 'listbox',
      groupFocusHighlight: true,
      focusable: true
    } );
    listParent.addChild( this.listNode );
    this.listParent = listParent; // @private

    // Highlights an item in the list
    const highlightItem = itemNodeWrapper => {
      assert && assert( itemNodeWrapper instanceof Rectangle, 'invalid itemNodeWrapper: ' + itemNodeWrapper );
      itemNodeWrapper.fill = options.itemHighlightFill;
      itemNodeWrapper.stroke = options.itemHighlightStroke;
    };

    // Un-highlights an item in the list
    const unhighlightItem = itemNodeWrapper => {
      assert && assert( itemNodeWrapper instanceof Rectangle, 'invalid itemNodeWrapper: ' + itemNodeWrapper );
      itemNodeWrapper.fill = null;
      itemNodeWrapper.stroke = null;
    };

    // TODO sun#405 It seems it would be better to use FireListener on each ItemNode
    const firedEmitter = new Emitter( {
      tandem: options.tandem.createTandem( 'firedEmitter' ),
      phetioType: EmitterIO( [ { name: 'event', type: VoidIO } ] ), // TODO sun#405 Should this be EventIO or DOMEventIO?
      listener: event => {
        const itemNodeWrapper = event.currentTarget; // {Rectangle}

        unhighlightItem( itemNodeWrapper );

        // a11y - keep this PDOM attribute in sync
        this.updateActiveDescendant( itemNodeWrapper );

        this.hideList();
        event.abort(); // prevent nodes (eg, controls) behind the list from receiving the event

        //TODO #430 this is brittle, should be handled better when we factor out ListNode
        const itemNode = itemNodeWrapper.children[ 0 ];
        assert && assert( itemNode instanceof ItemNode, 'expected the wrapper child to be ItemNode' );
        property.value = itemNode.item.value;
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
        firedEmitter.emit1( event ); //TODO #405 emit1 is deprecated
      }
    };

    // guard against the enter key triggering a keydown on a selected item AND then a click event on the button once
    // focus moves over there.
    let fromA11yEnterKey = false;

    // @private populate list with items
    this.itemNodes = [];
    items.forEach( ( item, index ) => {

      assert && assert( item.node instanceof Node && item.value !== undefined && item.options,
        'malformed item - did you create items using ComboBox.createItem?' );

      // Create the list item node
      const itemNode = new ItemNode( item, itemWidth, itemHeight, options.itemXMargin, {
        tandem: options.tandem.createTandem( item.options.tandemName )
      } );
      this.itemNodes.push( itemNode );

      // ItemNodes are shared between the list and button, so parent the itemNode with a Rectangle that we can highlight.
      const itemNodeWrapper = new Rectangle( 0, 0, itemNode.width, itemNode.height, {
        children: [ itemNode ],
        inputListeners: [ itemListener ],
        align: options.align,
        left: options.buttonXMargin,
        top: options.listYMargin + ( index * itemHeight ),
        cursor: 'pointer'
      } );
      this.listNode.addChild( itemNodeWrapper );

      //TODO sun#314 a11yClickListener should not be assigned here, it should be set via options or a setter method
      // a11y - select the property and close on a click event from assistive technology, must be removed in disposal
      // of combobox item. Keep track of it on the itemNode for disposal.
      itemNode.a11yClickListener = itemNode.addInputListener( {
        keydown: event => {
          if ( KeyboardUtil.KEY_ENTER === event.domEvent.keyCode || KeyboardUtil.KEY_SPACE === event.domEvent.keyCode ) {
            fromA11yEnterKey = KeyboardUtil.KEY_ENTER === event.domEvent.keyCode; // only for the enter key
            property.value = item.value;
            this.hideList();
            this.buttonNode.focus();

            // a11y - keep this PDOM attribute in sync
            this.updateActiveDescendant( itemNode );
          }
        }
      } );
    } );

    // @private {ItemNode} - a11y
    // tracks which item node has focus to make it easy to focus next/previous item after keydown
    this.focusedItem = null;

    // keep track of the input listener for removal
    const handleKeyDown = this.listNode.addInputListener( {
      keydown: event => {
        var domEvent = event.domEvent;
        if ( domEvent.keyCode === KeyboardUtil.KEY_ESCAPE ) {
          this.hideList();
          this.buttonNode.focus();
        }
        else if ( domEvent.keyCode === KeyboardUtil.KEY_DOWN_ARROW || domEvent.keyCode === KeyboardUtil.KEY_UP_ARROW ) {
          const direction = domEvent.keyCode === KeyboardUtil.KEY_DOWN_ARROW ? 1 : -1;

          // Get the next/previous item in the list and focus it.
          for ( let i = 0; i < this.listNode.children.length; i++ ) {
            if ( this.focusedItem === this.listNode.children[ i ] ) {
              const nextItem = this.listNode.children[ i + direction ];
              if ( nextItem ) {

                // a11y - keep this PDOM attribute in sync
                this.updateActiveDescendant( nextItem );

                // previous item should not be focusable
                this.focusedItem.focusable = false;
                this.focusedItem = nextItem;
                this.focusedItem.a11yFocusButton();
                break;
              }
            }
          }
        }
        else if ( domEvent.keyCode === KeyboardUtil.KEY_TAB ) {
          this.hideList();
        }
      }
    } );

    // @private button, will be set to correct value when property observer is registered
    this.buttonNode = new ButtonNode( this.getItemNode( property.value ), _.pick( options, BUTTON_NODE_KEYS ) );
    this.addChild( this.buttonNode );

    // a11y - the list is labeled by the button's label
    this.listNode.addAriaLabelledbyAssociation( {
      otherNode: this.buttonNode,
      otherElementName: AccessiblePeer.LABEL_SIBLING,
      thisElementName: AccessiblePeer.PRIMARY_SIBLING
    } );

    // button interactivity
    this.buttonNode.cursor = 'pointer';
    this.buttonNode.addInputListener( {
      down: this.showList.bind( this )
    } );

    //TODO sun#314 This should not be done by reaching into buttonNode. a11yListener should be set via options or a setter method
    // add the buttonNode accessibility listener
    this.buttonNode.a11yListener = {
      click: () => {

        // if already visible, hide it
        if ( this.listNode.visible ) {
          this.hideList();
          this.buttonNode.focus();
        }

        // Otherwise show the list and manage focus properly. But be tolerant of the "double enter" loop case, where
        // this click event is coming from selecting an item with a11y, and then auto focusing the button.
        else if ( !fromA11yEnterKey ) {
          this.showList();

          // focus the selected item
          for ( let i = 0; i < this.listNode.children.length; i++ ) {

            //TODO #430 this is brittle, should be handled better when we factor out ListNode
            const itemNodeWrapper = this.listNode.children[ i ];
            const itemNode = itemNodeWrapper.children[ 0 ];
            assert && assert( itemNode instanceof ItemNode, 'expected ItemNode' );

            if ( property.value === itemNode.item.value ) {
              this.focusedItem = itemNode;
              this.focusedItem.a11yFocusButton();
            }
          }
        }

        // should only need to disable the event once if coming from the enter key on selecting the item node
        else {
          fromA11yEnterKey = false;
        }
      },

      // listen for escape to hide the list when focused on the button
      keydown: event => {
        if ( this.listNode.visible ) {
          if ( event.domEvent.keyCode === KeyboardUtil.KEY_ESCAPE ) {
            this.hideList();
          }
        }
      }
    };
    this.buttonNode.addInputListener( this.buttonNode.a11yListener );

    // layout
    if ( options.labelNode ) {
      this.buttonNode.left = options.labelNode.right + options.labelXSpacing;
      this.buttonNode.centerY = options.labelNode.centerY;
    }

    // when property changes, update button, and for a11y the list in the PDOM
    const propertyObserver = value => {
      this.buttonNode.setItemNode( this.getItemNode( value ) );
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
      for ( let i = 0; i < this.itemNodes; i++ ) {
        this.itemNodes[ i ].dispose();
      }

      // remove a11y listeners
      this.listNode.removeInputListener( handleKeyDown );

      this.buttonNode.dispose();
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'ComboBox', this );
  }

  sun.register( 'ComboBox', ComboBox );

  // Note: ComboBox cannot use ES6 class until its subtypes do
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
     * Gets the combo box item that is associated with a specified value.
     * @param {*} value
     * @returns {Object}
     * @private
     */
    getItem( value ) {
      const item = _.find( this.items, item => { return item.value === value; } );
      assert && assert( item, 'no Item has value: ' + value );
      return item;
    },

    /**
     * Gets the ItemNode associated with a specified value.
     * @param {*} value
     * @returns {ItemNode} itemNode
     * @private
     */
    getItemNode( value ) {
      const item = this.getItem( value );
      const itemNode = _.find( this.itemNodes, child => {
        return ( child instanceof ItemNode && child.item === item );
      } );
      assert && assert( itemNode, 'no ItemNode is associated with item: ' + item );
      return itemNode;
    },

    // @private - update this attribute on the listNode. This changes as you interact
    // with the comboBox, as well as when an item is selected.
    updateActiveDescendant( itemNode ) {

      // overwrite purposefully
      this.listNode.activeDescendantAssociations = [ {
        otherNode: itemNode,
        thisElementName: AccessiblePeer.PRIMARY_SIBLING,
        otherElementName: AccessiblePeer.PRIMARY_SIBLING
      } ];
    },

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

    //TODO sun#314 document
    /**
     * @public
     */
    hideListFromClick() {
      if ( this.enableClickToDismissListener ) {
        this.hideList();
      }
      else {
        this.enableClickToDismissListener = true;
      }
    },

    //TODO sun#314 if "Most often should be called from hideListFromClick" then why is this called 6 times from other places, which hideListFromClick is called once?
    /**
     * Hides the combo box list. Most often should be called from hideListFromClick
     * @private
     */
    hideList() {
      this.phetioStartEvent( 'popupHidden' );

      if ( this.display && this.display.hasInputListener( this.clickToDismissListener ) ) {
        this.display.removeInputListener( this.clickToDismissListener );
      }

      // a11y - make sure focused list item is no longer focusable
      if ( this.focusedItem ) {
        this.focusedItem.focusable = false;
      }

      this.listNode.visible = false;

      this.phetioEndEvent();
    },

    /**
     * Handles the coordinate transform required to make the list pop up near the button.
     * @private
     */
    moveList() {
      if ( this.listPosition === 'above' ) {
        const pButtonGlobal = this.localToGlobalPoint( new Vector2( this.buttonNode.left, this.buttonNode.top ) );
        const pButtonLocal = this.listParent.globalToLocalPoint( pButtonGlobal );
        this.listNode.left = pButtonLocal.x;
        this.listNode.bottom = pButtonLocal.y;
      }
      else {
        const pButtonGlobal = this.localToGlobalPoint( new Vector2( this.buttonNode.left, this.buttonNode.bottom ) );
        const pButtonLocal = this.listParent.globalToLocalPoint( pButtonGlobal );
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
   * @param {Object} [options] - see DEFAULT_ITEM_OPTIONS
   * @returns {Object}
   * @public
   */
  ComboBox.createItem = ( node, value, options ) => {

    // For 'phet-io' brand, the tandems for items must be provided.  For other brands, the tandems are not required
    // and are filled in with substitutes so the tandems are still defined.
    if ( Tandem.validationEnabled() ) {
      assert && assert( options && options.tandemName,
        'For instrumented ComboBoxes, items options.tandemName is required' );
    }

    options = _.extend( {}, DEFAULT_ITEM_OPTIONS, options );

    return { node: node, value: value, options: options };
  };

  /**
   * The button that shows the current selection. Clicking on it shows the list of items.
   */
  class ButtonNode extends Node {

    /**
     * @param {Node} itemNode
     * @param {Object} [options]
     */
    constructor( itemNode, options ) {

      options = _.extend( {

        // phet-io
        tandem: Tandem.optional, // ButtonNode is not currently instrumented

        // a11y
        tagName: 'button',
        labelTagName: 'span',
        containerTagName: 'div'

      }, BUTTON_NODE_DEFAULT_OPTIONS, options );

      super();

      // @private
      this.buttonXMargin = options.buttonXMargin;
      this.buttonYMargin = options.buttonYMargin;

      //TODO #314 missing visibility annotation
      this.labelContent = options.a11yButtonLabel;

      //TODO #314 missing visibility annotation
      // the button is labelledby its own label, and then (second) by itself. Order matters!
      assert && assert( !options.ariaLabelledbyAssociations, 'ButtonNode sets ariaLabelledbyAssociations' );
      this.ariaLabelledbyAssociations = [
        {
          otherNode: this,
          otherElementName: AccessiblePeer.LABEL_SIBLING,
          thisElementName: AccessiblePeer.PRIMARY_SIBLING
        },
        {
          otherNode: this,
          otherElementName: AccessiblePeer.PRIMARY_SIBLING,
          thisElementName: AccessiblePeer.PRIMARY_SIBLING
        }
      ];

      // signify to AT that this button opens a menu
      this.setAccessibleAttribute( 'aria-haspopup', 'listbox' );

      //TODO #314 this should be private, and its value should be passed set via options or a setter methods
      // @public - if assigned, it will be removed on disposal.
      this.a11yListener = null;

      // up or down arrow
      const arrow = new Path( null, {
        fill: 'black'
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
      const backgroundWidth = itemNode.width + ( 4 * this.buttonXMargin ) + arrow.width;
      const backgroundHeight = itemNode.height + ( 2 * this.buttonYMargin );

      // @private
      this.background = new Rectangle( 0, 0, backgroundWidth, backgroundHeight, {
        cornerRadius: options.buttonCornerRadius,
        fill: options.buttonFill,
        stroke: options.buttonStroke,
        lineWidth: options.buttonLineWidth
      } );

      // vertical separator to left of arrow
      const separator = new Line( 0, 0, 0, backgroundHeight, {
        stroke: 'black',
        lineWidth: options.buttonLineWidth
      } );

      // @private parent for the selected ItemNode
      this.itemNodeParent = new Node();

      // rendering order
      this.addChild( this.background );
      this.addChild( arrow );
      this.addChild( separator );
      this.addChild( this.itemNodeParent );

      this.setItemNode( itemNode );

      // layout
      separator.left = this.itemNodeParent.right + this.buttonXMargin;
      separator.top = this.background.top;
      arrow.left = separator.right + this.buttonXMargin;
      arrow.centerY = this.background.centerY;

      // @private
      this.disposeButtonNode = () => {
        this.a11yListener && this.removeInputListener( this.a11yListener );
      };

      this.mutate( options );
    }

    /**
     * Sets the item that is displayed on the button.
     * @param {ItemNode} itemNode
     */
    setItemNode( itemNode ){

      // Remove the previous itemNode
      assert && assert( this.itemNodeParent.getChildrenCount() <= 1,
        'itemNodeParent should never have more than 1 child' );
      this.itemNodeParent.removeAllChildren();

      // Add the new itemNode and adjust layout. Do not transform itemNode, because it's shared with the list.
      this.itemNodeParent.addChild( itemNode );
      this.itemNodeParent.left = this.background.left + this.buttonXMargin;
      this.itemNodeParent.top = this.background.top + this.buttonYMargin;

      // TODO sun#314 is there a better way to do this?
      itemNode.a11yShowItem( false );

      // Only set if defined, since it is an option, see ComboBox.createItem
      if ( itemNode.a11yLabel ) {
        this.innerContent = itemNode.a11yLabel;
      }
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
   */
  class ItemNode extends Rectangle {

    /**
     * @param {Object} item - see ComboBox.createItem
     * @param {number} width
     * @param {number} height
     * @param {number} xMargin
     * @param {Object} [options]
     */
    constructor( item, width, height, xMargin, options ) {

      assert && assert( item.options, 'expected item.options, set by ComboBox.createItem' );

      // TODO sun#314 assert you may not be allowed to have accessibleContent on the item.node, since we set the innerContent on this LI

      options = _.extend( {
        align: 'left',

        // a11y
        tagName: 'li',
        ariaRole: 'option'
      }, options );

      // Holds our item.node, and positions it in the correct location. We don't want to mutate the item's node itself.
      const itemWrapper = new Node( {
        children: [ item.node ],
        pickable: false,
        centerY: height / 2
      } );
      if ( options.align === 'left' ) {
        itemWrapper.left = xMargin;
      }
      else if ( options.align === 'right' ) {
        itemWrapper.right = width - xMargin;
      }
      else {
        // center
        itemWrapper.centerX = width / 2;
      }

      assert && assert( !options.children, 'ItemNode sets children' );
      options.children = [ itemWrapper ];

      super( 0, 0, width, height, options );

      //TODO #314 this should be @public (read-only)
      // @public - to keep track of it
      this.a11yLabel = null;

      // Only set if defined, since it is an option, see ComboBox.createItem
      if ( item.options.a11yLabel ) {
        this.a11yLabel = item.options.a11yLabel;
        this.innerContent = item.options.a11yLabel; //TODO #314 is this correct? if so, document why.
      }

      //TODO #314 this is marked private, but is assigned above, it should be set via options or a setter method
      // @private {null|function} - listener called when button clicked with AT
      this.a11yClickListener = null;

      // @public (read-only)
      this.item = item;

      // @private
      this.itemWrapper = itemWrapper;

      // the highlight wraps around the entire item rectangle
      this.itemWrapper.focusHighlight = Shape.bounds( this.itemWrapper.parentToLocalBounds( this.localBounds ) );
    }

    //TODO sun#314 doc/rename to toggleVisibility
    /**
     * @param {boolean} visible
     */
    a11yShowItem( visible ) {
      this.itemWrapper.tagName = visible ? 'button' : null;
      this.tagName = visible ? 'li' : null;
    }

    //TODO #314 ItemNode instances are now shared between the list and button. How does that affect focus? Should focus be set on the ItemNode's wrapper in the list?
    /**
     * Focus the item in the list
     * @public
     */
    a11yFocusButton() {
      this.focusable = true;
      this.focus();
    }

    /**
     * Disposes the item.
     * @public
     * @override
     */
    dispose() {

      // the item in the button will not have a listener
      this.a11yClickListener && this.removeInputListener( this.a11yClickListener );
      this.itemWrapper.dispose();
      super.dispose();
    }
  }

  sun.register( 'ComboBox.ItemNode', ItemNode );

  return ComboBox;
} );