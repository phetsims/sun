// Copyright 2013-2019, University of Colorado Boulder

/**
 * Scenery-based combo box. Composed of a button and a popup 'list box' of items. ComboBox has no interaction of its
 * own, all interaction is handled by its subcomponents. The list box is displayed when the button is pressed, and
 * dismissed when an item is selected, the user clicks on the button, or the user clicks outside the list. The list
 * can be displayed either above or below the button.
 *
 * The supporting classes are:
 *
 * ComboBoxItem - items provided to ComboBox constructor
 * ComboBoxButton - the button
 * ComboBoxListBox - the list box
 * ComboBoxListItemNode - an item in the list box
 *
 * For info on ComboBox UI design, including a11y, see https://github.com/phetsims/sun/blob/master/doc/ComboBox.md
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const ComboBoxButton = require( 'SUN/ComboBoxButton' );
  const ComboBoxIO = require( 'SUN/ComboBoxIO' );
  const ComboBoxListBox = require( 'SUN/ComboBoxListBox' );
  const InstanceRegistry = require( 'PHET_CORE/documentation/InstanceRegistry' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhetioObject = require( 'TANDEM/PhetioObject' );
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
        enabledProperty: null, // {BooleanProperty|null} default will be provided if null
        disabledOpacity: 0.5, // {number} opacity used to make the control look disabled, 0-1
        cornerRadius: 4, // applied to button, listBox, and item highlights
        highlightFill: 'rgb( 245, 245, 245 )', // {Color|string} highlight behind items in the list

        // Margins around the edges of the button and listbox when highlight is invisible.
        // Highlight margins around the items in the list are set to 1/2 of these values.
        // These values must be > 0.
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

        // a11y
        accessibleName: null, // the a11y setter for this is overridden, see below
        helpText: null, // the a11y setter for this is overridden, see below

        // phet-io
        tandem: Tandem.required,
        phetioType: ComboBoxIO,
        phetioEventType: PhetioObject.EventType.USER

      }, options );

      // validate option values
      assert && assert( options.xMargin > 0 && options.yMargin > 0,
        'margins must be > 0, xMargin=' + options.xMargin + ', yMargin=' + options.yMargin );
      assert && assert( options.disabledOpacity > 0 && options.disabledOpacity < 1,
        'invalid disabledOpacity: ' + options.disabledOpacity );
      assert && assert( _.includes( LIST_POSITION_VALUES, options.listPosition ),
        'invalid listPosition: ' + options.listPosition );
      assert && assert( _.includes( ALIGN_VALUES, options.align ),
        'invalid align: ' + options.align );

      super();

      this.items = items; // @private
      this.listPosition = options.listPosition; // @private

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

        // a11y - accessibleName and helpText are set via overridden functions on the prototype. See below.

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
      this.listBox = new ComboBoxListBox( property, items,
        this.hideListBox.bind( this ), // callback to hide the list box
        this.button.focus.bind( this.button ), // callback to transfer focus to button
        options.tandem.createTandem( 'listBox' ), {
          align: options.align,
          highlightFill: options.highlightFill,
          xMargin: options.xMargin,
          yMargin: options.yMargin,
          cornerRadius: options.cornerRadius,
          fill: options.listFill,
          stroke: options.listStroke,
          lineWidth: options.listLineWidth,
          visible: false,

          // a11y
          // the list box is aria-labelledby its own label sibling
          ariaLabelledbyAssociations: [ {
            otherNode: this.button,
            otherElementName: AccessiblePeer.LABEL_SIBLING,
            thisElementName: AccessiblePeer.PRIMARY_SIBLING
          } ]
        } );
      listParent.addChild( this.listBox );
      this.listParent = listParent; // @private

      this.mutate( options );

      // Clicking on the button toggles visibility of the list box
      this.button.addListener( () => {
        if ( !this.listBox.visible ) {
          this.showListBox();
        }
        else {
          this.hideListBox();
        }
      } );

      //TODO sun#462 integrate this with above button listener, to eliminate order dependency
      // Handle button clicks, for a11y
      this.button.addInputListener( {
        click: () => {
          if ( this.listBox.visible ) {
            this.listBox.focus();
          }
        }
      } );

      // @private the display that clickToDismissListener is added to, because the scene may change, see sun#14
      this.display = null;

      // @private Clicking anywhere other than the button or list box will hide the list box.
      this.clickToDismissListener = {
        down: event => {

          // Ignore if we click over the button, since the button will handle hiding the list.
          if ( !( event.trail.containsNode( this.button ) || event.trail.containsNode( this.listBox ) ) ) {
            this.hideListBox();
          }
        }
      };

      // So we know whether we can dispose of the enabledProperty and its tandem
      var ownsEnabledProperty = !options.enabledProperty;

      // @public Provide a default if not specified
      this.enabledProperty = options.enabledProperty || new BooleanProperty( true, {
        tandem: options.tandem.createTandem( 'enabledProperty' )
      } );

      // enable/disable the combo box
      const enabledObserver = enabled => {
        this.pickable = enabled;
        this.opacity = enabled ? 1.0 : options.disabledOpacity;
      };
      this.enabledProperty.link( enabledObserver );

      // @private for use via PhET-iO, see https://github.com/phetsims/sun/issues/451
      // This is not generally controlled by the user, so it is not reset when the Reset All button is pressed.
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

      this.addLinkedElement( property, {
        tandem: options.tandem.createTandem( 'property' )
      } );

      // @private called by dispose
      this.disposeComboBox = () => {

        if ( this.display && this.display.hasInputListener( this.clickToDismissListener ) ) {
          this.display.removeInputListener( this.clickToDismissListener );
        }

        if ( ownsEnabledProperty ) {
          this.enabledProperty.dispose();
        }
        else {
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
     * Instead of setting accessibleName on ComboBox, forward accessibleName setter to the button
     * @param {string} accessibleName
     * @override
     */
    set accessibleName( accessibleName ) {

      // set labelContent here instead of accessibleName because of ComboBoxButton implementation -- see that file for more details
      this.button.labelContent = accessibleName;
    }

    /**
     * Instead of setting accessibleName on ComboBox, forward helpText setter to the button
     * @param {string} helpText
     * @override
     */
    set helpText( helpText ) { this.button.helpText = helpText; }

    /**
     * Shows the list box.
     * @public
     */
    showListBox() {
      if ( !this.listBox.visible ) {
        this.phetioStartEvent( 'listBoxShown' );

        // show the list box
        this.scaleListBox();
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

    /**
     * Because the button and list box have different parents (and therefore different coordinate frames)
     * they may be scaled differently. This method scales the list box so that items on the button and in
     * the list appear to be the same size.
     * @private
     */
    scaleListBox() {
      const buttonScale = this.button.localToGlobalBounds( this.button.localBounds ).width / this.button.localBounds.width;
      const listBoxScale = this.listBox.localToGlobalBounds( this.listBox.localBounds ).width / this.listBox.localBounds.width;
      this.listBox.scale( buttonScale / listBoxScale );
    }

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