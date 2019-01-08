// Copyright 2013-2018, University of Colorado Boulder

/**
 * Scenery-based combo box. Composed of a button and a list of items.
 * The list of items is displayed when the button is pressed, and dismissed when an item is selected
 * or the user clicks outside the list.  The list can be displayed either above or below the button.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );
  const ComboBoxButtonNode = require( 'SUN/ComboBoxButtonNode' );
  const ComboBoxIO = require( 'SUN/ComboBoxIO' );
  const ComboBoxItem = require( 'SUN/ComboBoxItem' );
  const ComboBoxItemNode = require( 'SUN/ComboBoxItemNode' );
  const Emitter = require( 'AXON/Emitter' );
  const EmitterIO = require( 'AXON/EmitterIO' );
  const inherit = require( 'PHET_CORE/inherit' );
  const InstanceRegistry = require( 'PHET_CORE/documentation/InstanceRegistry' );
  const KeyboardUtil = require( 'SCENERY/accessibility/KeyboardUtil' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Property = require( 'AXON/Property' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const sun = require( 'SUN/sun' );
  const Tandem = require( 'TANDEM/Tandem' );
  const Vector2 = require( 'DOT/Vector2' );
  const VoidIO = require( 'TANDEM/types/VoidIO' );

  // const
  const LIST_POSITION_VALUES = [ 'above', 'below' ];
  const ALIGN_VALUES = [ 'left', 'right', 'center' ];

  /**
   * @param {*[]} items - must be created using ComboBox.createItem
   * @param {Property} property
   * @param {Node} listParent node that will be used as the list's parent, use this to ensuring that the list is in front of everything else
   * @param {Object} [options] object with optional properties
   * @constructor
   */
  function ComboBox( items, property, listParent, options ) {

    options = _.extend( {

      listPosition: 'below', // {string} where the list pops up relative to the button
      align: 'left', // {string} alignment of items on the button and in the list, see ALIGN_VALUES
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

    }, ComboBoxButtonNode.DEFAULT_OPTIONS, options );

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

    // TODO sun#405 It seems it would be better to use FireListener on each ComboBoxItemNode
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
        assert && assert( itemNode instanceof ComboBoxItemNode, 'expected the wrapper child to be ComboBoxItemNode' );
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

      // Create the list item node
      const itemNode = new ComboBoxItemNode( item, itemWidth, itemHeight, {
        xMargin: options.itemXMargin,
        tandem: item.tandemName ? options.tandem.createTandem( item.tandemName ) : Tandem.optional
      } );
      this.itemNodes.push( itemNode );

      // ComboBoxItemNodes are shared between the list and button, so parent the itemNode with a Rectangle that we can highlight.
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

    // @private {ComboBoxItemNode} - a11y
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

    // Cherry pick button options
    const buttonOptions = _.pick( options, _.keys( ComboBoxButtonNode.DEFAULT_OPTIONS ) );
    buttonOptions.arrowDirection = ( options.listPosition === 'below' ) ? 'down' : 'up';

    // @private button, will be set to correct value when property observer is registered
    this.buttonNode = new ComboBoxButtonNode( this.getItemNode( property.value ), buttonOptions);
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
            assert && assert( itemNode instanceof ComboBoxItemNode, 'expected ComboBoxItemNode' );

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
     * Gets the ComboBoxItemNode associated with a specified value.
     * @param {*} value
     * @returns {ComboBoxItemNode} itemNode
     * @private
     */
    getItemNode( value ) {
      const item = this.getItem( value );
      const itemNode = _.find( this.itemNodes, child => {
        return ( child instanceof ComboBoxItemNode && child.item === item );
      } );
      assert && assert( itemNode, 'no ComboBoxItemNode is associated with item: ' + item );
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
   * Creates a combo box item. Provided for backward compatibility. Using new ComboBoxItem is preferred.
   * @param {Node} node
   * @param {*} value
   * @param {Object} [options] see ComboBoxItem
   * @returns {ComboBoxItem}
   * @public
   */
  ComboBox.createItem = ( node, value, options ) => {
    return new ComboBoxItem( node, value, options );
  };

  return ComboBox;
} );