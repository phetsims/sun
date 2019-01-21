// Copyright 2013-2019, University of Colorado Boulder

/**
 * Scenery-based combo box. Composed of a button and a popup 'list box' of items.
 * The list box is displayed when the button is pressed, and dismissed when an item is selected, the user clicks on
 * the button, or the user clicks outside the list. The list can be displayed either above or below the button.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const ComboBoxButton = require( 'SUN/ComboBoxButton' );
  const ComboBoxIO = require( 'SUN/ComboBoxIO' );
  const ComboBoxListBox = require( 'SUN/ComboBoxListBox' );
  const InstanceRegistry = require( 'PHET_CORE/documentation/InstanceRegistry' );
  const Node = require( 'SCENERY/nodes/Node' );
  const sun = require( 'SUN/sun' );
  const Tandem = require( 'TANDEM/Tandem' );
  const Vector2 = require( 'DOT/Vector2' );

  // const
  const LIST_POSITION_VALUES = [ 'above', 'below' ]; // where the list pops up relative to the button
  const ALIGN_VALUES = [ 'left', 'right', 'center' ]; // alignment of item on button and in list

  class ComboBox extends Node {
    
    /**
     * @param {ComboBoxItem[]} items
     * @param {Property} property
     * @param {Node} listParent node that will be used as the list's parent, use this to ensure that the list is in front of everything else
     * @param {Object} [options] object with optional properties
     * @constructor
     */
    constructor( items, property, listParent, options ) {

      options = _.extend( {

        align: 'left', // see ALIGN_VALUES
        listPosition: 'below', // see LIST_POSITION_VALUES
        labelNode: null, // {Node|null} optional label, placed to the left of the combo box
        labelXSpacing: 10, // horizontal space between label and combo box
        enabledProperty: new BooleanProperty( true ),
        disabledOpacity: 0.5, // {number} opacity used to make the control look disabled, 0-1
        cornerRadius: 4, // applied to list and button
        highlightFill: 'rgb( 245, 245, 245 )', // {Color|string} highlight behind items in the list

        // Margins around the edges of the button and listbox when highlight is invisible.
        // Highlight margins around the items in the list are set to 1/2 of these values.
        xMargin: 12,
        yMargin: 8,

        // button
        buttonFill: 'white', // {Color|string}
        buttonStroke: 'black', // {Color|string}
        buttonLineWidth: 1,

        // list
        listFill: 'white', // {Color|string}
        listStroke: 'black', // {Color|string}
        listLineWidth: 1,

        //TODO sun#314 need to add a11y options?

        // phet-io
        tandem: Tandem.required,
        phetioType: ComboBoxIO,
        phetioEventType: 'user'

      }, options );

      // validate option values
      assert && assert( options.disabledOpacity > 0 && options.disabledOpacity < 1,
        'invalid disabledOpacity: ' + options.disabledOpacity );
      assert && assert( LIST_POSITION_VALUES.includes( options.listPosition ),
        'invalid listPosition: ' + options.listPosition );
      assert && assert( ALIGN_VALUES.includes( options.align ),
        'invalid align: ' + options.align );

      super();

      this.items = items; // @private
      this.listPosition = options.listPosition; // @private
      this.enabledProperty = options.enabledProperty; // @public

      // optional label
      if ( options.labelNode !== null ) {
        this.addChild( options.labelNode );
      }

      // @private button that shows the current selection
      this.button = new ComboBoxButton( property, items, {
        align: options.align,
        arrowDirection: ( options.listPosition === 'below' ) ? 'down' : 'up',
        cornerRadius: options.cornerRadius,
        xMargin: options.xMargin,
        yMargin: options.yMargin,
        baseColor: options.buttonFill,
        stroke: options.buttonStroke,
        lineWidth: options.buttonLineWidth,

        //TODO sun#314 need to add a11y options?

        // phet-io
        tandem: options.tandem.createTandem( 'button' )
      } );
      this.addChild( this.button );

      // put optional label to left of button
      if ( options.labelNode ) {
        this.button.left = options.labelNode.right + options.labelXSpacing;
        this.button.centerY = options.labelNode.centerY;
      }

      // @private the popup list box
      this.listBox = new ComboBoxListBox( property, items, this.button,
        this.hideListBox.bind( this ), options.tandem.createTandem( 'listBox' ), {
          align: options.align,
          highlightFill: options.highlightFill,
          xMargin: options.xMargin,
          yMargin: options.yMargin,
          cornerRadius: options.cornerRadius,
          fill: options.listFill,
          stroke: options.listStroke,
          lineWidth: options.listLineWidth,
          visible: false

          //TODO sun#314 need to add a11y options?
        } );
      listParent.addChild( this.listBox );
      this.listParent = listParent; // @private

      this.mutate( options );

      // Clicking on the button toggles visibility of the list
      this.button.addListener( () => {
        if ( !this.listBox.visible ) {
          this.showListBox();
        }
        else {
          this.hideListBox();
        }
      } );

      // Handle button clicks, for a11y
      this.button.addInputListener( {
        a11yclick: () => {

          //TODO sun#314 order dependency, requires that button's listener has called showList
          if ( this.listBox.visible ) {
            this.listBox.updateFocus();
          }
        }
      } );

      // @private the display that clickToDismissListener is added to, because the scene may change, see sun#14
      this.display = null;

      // @private listener for 'click outside to dismiss'
      // TODO sun#314 handle this logic for a11y too, perhaps on by monitoring the focusout event on the display's root PDOM element
      this.clickToDismissListener = {
        down: event => {
          //TODO scenery#927 is trail.nodes public? should we add Trail.containsNode?
          // Ignore if we click over the button, since the button will handle hiding the list.
          if ( event.trail.nodes.indexOf( this.button ) === -1 ) {
            this.hideListBox();
          }
        }
      };

      // enable/disable the combo box
      const enabledObserver = enabled => {
        this.pickable = enabled;
        this.opacity = enabled ? 1.0 : options.disabledOpacity;
      };
      this.enabledProperty.link( enabledObserver );

      // @private for use via PhET-iO, see https://github.com/phetsims/sun/issues/451
      // This is NOT reset when the Reset All button is pressed.
      this.displayOnlyProperty = new BooleanProperty( false, {
        tandem: options.tandem.createTandem( 'displayOnlyProperty' ),
        phetioDocumentation: 'disables interaction with the ComboBox and ' +
                             'makes it appear like a display that shows the current selection'
      } );
      this.displayOnlyProperty.link( displayOnly => {
        this.hideListBox();
        this.button.setDisplayOnly( displayOnly );
        this.pickable = !displayOnly;
      } );

      // @private called by dispose
      this.disposeComboBox = () => {

        if ( this.display && this.display.hasInputListener( this.clickToDismissListener ) ) {
          this.display.removeInputListener( this.clickToDismissListener );
        }

        if ( this.enabledProperty.hasListener( enabledObserver ) ) {
          this.enabledProperty.unlink( enabledObserver );
        }

        // dispose of subcomponents
        this.listBox.dispose();
        this.button.dispose();
      };

      // support for binder documentation, stripped out in builds and only runs when ?binder is specified
      assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'ComboBox', this );
    }

    // @public - Provide dispose() on the prototype for ease of subclassing.
    dispose() {
      this.disposeComboBox();
      Node.prototype.dispose.call( this );
    }

    // @public
    setEnabled( enabled ) { this.enabledProperty.value = enabled; }

    set enabled( value ) { this.setEnabled( value ); }

    // @public
    getEnabled() { return this.enabledProperty.value; }

    get enabled() { return this.getEnabled(); }

    /**
     * Shows the list box.
     * @public
     */
    showListBox() {
      if ( !this.listBox.visible ) {
        this.phetioStartEvent( 'listBoxShown' );

        // show the list box
        this.moveListBox();
        this.listBox.moveToFront();
        this.listBox.visible = true;

        // manage clickToDismissListener
        assert && assert( !this.display, 'unexpected display' );
        this.display = this.getUniqueTrail().rootNode().getRootedDisplays()[ 0 ];
        this.display.addInputListener( this.clickToDismissListener );

        this.phetioEndEvent();
      }
    }

    /**
     * Hides the list box.
     * @public
     */
    hideListBox() {
      if ( this.listBox.visible ) {
        this.phetioStartEvent( 'listBoxHidden' );

        // manage clickToDismissListener
        if ( this.display && this.display.hasInputListener( this.clickToDismissListener ) ) {
          this.display.removeInputListener( this.clickToDismissListener );
          this.display = null;
        }

        // hide the list box
        this.listBox.visible = false;

        this.phetioEndEvent();
      }
    }

    //TODO sun#457 scale list box to match button
    /**
     * Handles the coordinate transform required to make the list box pop up near the button.
     * @private
     */
    moveListBox() {
      if ( this.listPosition === 'above' ) {
        const pButtonGlobal = this.localToGlobalPoint( new Vector2( this.button.left, this.button.top ) );
        const pButtonLocal = this.listParent.globalToLocalPoint( pButtonGlobal );
        this.listBox.left = pButtonLocal.x;
        this.listBox.bottom = pButtonLocal.y;
      }
      else {
        const pButtonGlobal = this.localToGlobalPoint( new Vector2( this.button.left, this.button.bottom ) );
        const pButtonLocal = this.listParent.globalToLocalPoint( pButtonGlobal );
        this.listBox.left = pButtonLocal.x;
        this.listBox.top = pButtonLocal.y;
      }
    }
  }

  return sun.register( 'ComboBox', ComboBox );
} );