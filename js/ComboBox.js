// Copyright 2013-2021, University of Colorado Boulder

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

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import dotRandom from '../../dot/js/dotRandom.js';
import Vector2 from '../../dot/js/Vector2.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import merge from '../../phet-core/js/merge.js';
import FocusManager from '../../scenery/js/accessibility/FocusManager.js';
import PDOMPeer from '../../scenery/js/accessibility/pdom/PDOMPeer.js';
import Node from '../../scenery/js/nodes/Node.js';
import generalCloseSoundPlayer from '../../tambo/js/shared-sound-players/generalCloseSoundPlayer.js';
import generalOpenSoundPlayer from '../../tambo/js/shared-sound-players/generalOpenSoundPlayer.js';
import EventType from '../../tandem/js/EventType.js';
import Tandem from '../../tandem/js/Tandem.js';
import IOType from '../../tandem/js/types/IOType.js';
import ComboBoxButton from './ComboBoxButton.js';
import ComboBoxListBox from './ComboBoxListBox.js';
import sun from './sun.js';

// const
const LIST_POSITION_VALUES = [ 'above', 'below' ]; // where the list pops up relative to the button
const ALIGN_VALUES = [ 'left', 'right', 'center' ]; // alignment of item on button and in list

// The definition for how ComboBox sets its accessibleName and helpText in the PDOM. Forward it onto its button. See
// ComboBox.md for further style guide and documentation on the pattern.
const ACCESSIBLE_NAME_BEHAVIOR = ( node, options, accessibleName, otherNodeCallbacks ) => {
  otherNodeCallbacks.push( () => {
    node.button.accessibleName = accessibleName;
  } );
  return options;
};
const HELP_TEXT_BEHAVIOR = ( node, options, helpText, otherNodeCallbacks ) => {
  otherNodeCallbacks.push( () => {
    node.button.helpText = helpText;
  } );
  return options;
};

class ComboBox extends Node {

  /**
   * @param {ComboBoxItem[]} items
   * @param {Property} property
   * @param {Node} listParent node that will be used as the list's parent, use this to ensure that the list is in front of everything else
   * @param {Object} [options] object with optional properties
   * @constructor
   */
  constructor( items, property, listParent, options ) {

    assert && assert( _.uniqBy( items, item => item.value ).length === items.length, 'items must have unique values' );

    // See https://github.com/phetsims/sun/issues/542
    assert && assert( listParent.maxWidth === null,
      'ComboBox is responsible for scaling listBox. Setting maxWidth for listParent may result in buggy behavior.' );

    options = merge( {

      align: 'left', // see ALIGN_VALUES
      listPosition: 'below', // see LIST_POSITION_VALUES
      labelNode: null, // {Node|null} optional label, placed to the left of the combo box
      labelXSpacing: 10, // horizontal space between label and combo box
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
      buttonTouchAreaXDilation: 0,
      buttonTouchAreaYDilation: 0,
      buttonMouseAreaXDilation: 0,
      buttonMouseAreaYDilation: 0,

      // list
      listFill: 'white', // {Color|string}
      listStroke: 'black', // {Color|string}
      listLineWidth: 1,

      // {Playable} - Sound generators for when combo box is opened and for when it is closed with no change (closing
      // *with* a change is handled elsewhere).
      openedSoundPlayer: generalOpenSoundPlayer,
      closedNoChangeSoundPlayer: generalCloseSoundPlayer,

      // pdom
      tagName: 'div', // must have accessible content to support behavior functions
      accessibleNameBehavior: ACCESSIBLE_NAME_BEHAVIOR,
      helpTextBehavior: HELP_TEXT_BEHAVIOR,

      // phet-io
      tandem: Tandem.REQUIRED,
      phetioType: ComboBox.ComboBoxIO,
      phetioEventType: EventType.USER,
      visiblePropertyOptions: { phetioFeatured: true },
      phetioEnabledPropertyInstrumented: true // opt into default PhET-iO instrumented enabledProperty
    }, options );

    // validate option values
    assert && assert( options.xMargin > 0 && options.yMargin > 0,
      `margins must be > 0, xMargin=${options.xMargin}, yMargin=${options.yMargin}` );
    assert && assert( _.includes( LIST_POSITION_VALUES, options.listPosition ),
      `invalid listPosition: ${options.listPosition}` );
    assert && assert( _.includes( ALIGN_VALUES, options.align ),
      `invalid align: ${options.align}` );

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
      touchAreaXDilation: options.buttonTouchAreaXDilation,
      touchAreaYDilation: options.buttonTouchAreaYDilation,
      mouseAreaXDilation: options.buttonMouseAreaXDilation,
      mouseAreaYDilation: options.buttonMouseAreaYDilation,

      // pdom - accessibleName and helpText are set via behavior functions on the ComboBox

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

        // sound generation
        openedSoundPlayer: options.openedSoundPlayer,
        closedNoChangeSoundPlayer: options.closedNoChangeSoundPlayer,

        // pdom
        // the list box is aria-labelledby its own label sibling
        ariaLabelledbyAssociations: [ {
          otherNode: this.button,
          otherElementName: PDOMPeer.LABEL_SIBLING,
          thisElementName: PDOMPeer.PRIMARY_SIBLING
        } ]
      } );
    listParent.addChild( this.listBox );
    this.listParent = listParent; // @private

    // The listBox is not a child Node of ComboBox and, as a result, listen to opacity of the ComboBox and keep
    // the listBox in sync with them. See https://github.com/phetsims/sun/issues/587
    this.opacityProperty.link( opacity => { this.listBox.opacityProperty.value = opacity; } );

    this.mutate( options );

    // Clicking on the button toggles visibility of the list box
    this.button.addListener( () => {
      this.listBox.visibleProperty.value = !this.listBox.visibleProperty.value;
      this.listBox.visibleProperty.value && this.listBox.focus();
    } );

    // @private the display that clickToDismissListener is added to, because the scene may change, see sun#14
    this.display = null;

    // @private Clicking anywhere other than the button or list box will hide the list box.
    this.clickToDismissListener = {
      down: event => {

        // If fuzzing is enabled, exercise this listener some percentage of the time, so that this listener is tested.
        // The rest of the time, ignore this listener, so that the listbox remains popped up, and we test making
        // choices from the listbox. See https://github.com/phetsims/sun/issues/677
        if ( !phet.chipper.isFuzzEnabled() || dotRandom.nextDouble() < 0.25 ) {

          // Ignore if we click over the button, since the button will handle hiding the list.
          if ( !( event.trail.containsNode( this.button ) || event.trail.containsNode( this.listBox ) ) ) {
            this.hideListBox();
          }
        }
      }
    };

    // @private - (PDOM) when focus leaves the ComboBoxListBox, it should be closed. This could happen from keyboard
    // or from other screen reader controls (like VoiceOver gestures)
    this.dismissWithFocusListener = focus => {
      if ( focus && !focus.trail.containsNode( this.listBox ) ) {
        this.hideListBox();
      }
    };
    FocusManager.pdomFocusProperty.link( this.dismissWithFocusListener );

    this.listBox.localBoundsProperty.lazyLink( () => this.moveListBox() );

    this.listBox.visibleProperty.link( ( visible, wasVisible ) => {
      if ( visible ) {

        // show the list box
        this.scaleListBox();
        this.listBox.moveToFront();
        this.moveListBox();

        // manage clickToDismissListener
        assert && assert( !this.display, 'unexpected display' );
        this.display = this.getUniqueTrail().rootNode().getRootedDisplays()[ 0 ];
        this.display.addInputListener( this.clickToDismissListener );
      }
      else {

        // manage clickToDismissListener
        if ( this.display && this.display.hasInputListener( this.clickToDismissListener ) ) {
          this.display.removeInputListener( this.clickToDismissListener );
          this.display = null;
        }
      }
    } );

    // @private for use via PhET-iO, see https://github.com/phetsims/sun/issues/451
    // This is not generally controlled by the user, so it is not reset when the Reset All button is pressed.
    this.displayOnlyProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'displayOnlyProperty' ),
      phetioFeatured: true,
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

      FocusManager.pdomFocusProperty.unlink( this.dismissWithFocusListener );

      // dispose of subcomponents
      this.listBox.dispose();
      this.button.dispose();
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'ComboBox', this );
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeComboBox();
    super.dispose();
  }

  /**
   * Shows the list box.
   * @public
   */
  showListBox() {
    this.listBox.visibleProperty.value = true;
  }

  /**
   * Hides the list box.
   * @public
   */
  hideListBox() {
    this.listBox.visibleProperty.value = false;
  }

  /**
   * Because the button and list box have different parents (and therefore different coordinate frames)
   * they may be scaled differently. This method scales the list box so that items on the button and in
   * the list appear to be the same size.
   * @private
   */
  scaleListBox() {

    // To support an empty list box due to PhET-iO customization, see https://github.com/phetsims/sun/issues/606
    if ( !this.listBox.localBounds.isEmpty() ) {
      const buttonScale = this.button.localToGlobalBounds( this.button.localBounds ).width / this.button.localBounds.width;
      const listBoxScale = this.listBox.localToGlobalBounds( this.listBox.localBounds ).width / this.listBox.localBounds.width;
      this.listBox.scale( buttonScale / listBoxScale );
    }
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

  /**
   * Sets the visibility of items that correspond to a value. If the selected item has this value, it's your
   * responsibility to change the Property value to something else. Otherwise the combo box button will continue
   * to display this value.
   * @param {*} value - the value associated with the ComboBoxItem
   * @param {boolean} visible
   * @public
   */
  setItemVisible( value, visible ) {
    this.listBox.setItemVisible( value, visible );
  }

  /**
   * Is the item that corresponds to a value visible when the listbox is popped up?
   * @param {*} value
   * @returns {boolean}
   * @public
   */
  isItemVisible( value ) {
    return this.listBox.isItemVisible( value );
  }
}

ComboBox.ComboBoxIO = new IOType( 'ComboBoxIO', {
  valueType: ComboBox,
  documentation: 'A combo box is composed of a push button and a listbox. The listbox contains items that represent ' +
                 'choices. Pressing the button pops up the listbox. Selecting from an item in the listbox sets the ' +
                 'value of an associated Property. The button shows the item that is currently selected.',
  supertype: Node.NodeIO,
  events: [ 'listBoxShown', 'listBoxHidden' ]
} );

sun.register( 'ComboBox', ComboBox );
export default ComboBox;