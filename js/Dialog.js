// Copyright 2018-2020, University of Colorado Boulder

/**
 * General dialog type. Migrated from Joist on 4/10/2018
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrea Lin (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import Property from '../../axon/js/Property.js';
import Shape from '../../kite/js/Shape.js';
import inherit from '../../phet-core/js/inherit.js';
import merge from '../../phet-core/js/merge.js';
import AccessibilityUtils from '../../scenery/js/accessibility/AccessibilityUtils.js';
import AccessiblePeer from '../../scenery/js/accessibility/AccessiblePeer.js';
import KeyboardUtils from '../../scenery/js/accessibility/KeyboardUtils.js';
import Display from '../../scenery/js/display/Display.js';
import AlignBox from '../../scenery/js/nodes/AlignBox.js';
import HBox from '../../scenery/js/nodes/HBox.js';
import Path from '../../scenery/js/nodes/Path.js';
import VBox from '../../scenery/js/nodes/VBox.js';
import FullScreen from '../../scenery/js/util/FullScreen.js';
import Playable from '../../tambo/js/Playable.js';
import generalCloseSoundPlayer from '../../tambo/js/shared-sound-players/generalCloseSoundPlayer.js';
import generalOpenSoundPlayer from '../../tambo/js/shared-sound-players/generalOpenSoundPlayer.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import RectangularButtonView from './buttons/RectangularButtonView.js';
import RectangularPushButton from './buttons/RectangularPushButton.js';
import DialogIO from './DialogIO.js';
import Panel from './Panel.js';
import sun from './sun.js';
import sunStrings from './sun-strings.js';

// constants
const closeString = sunStrings.a11y.close;
const CLOSE_BUTTON_WIDTH = 14;

/**
 * @param {Node} content - The content to display inside the dialog (not including the title)
 * @param {Object} [options]
 * @constructor
 */
function Dialog( content, options ) {

  options = merge( {

    /* Margins and spacing:

                                  maxHeightMargin
     ____________________________________________________________________________
    |                                     |                          |           |
    |                                     |                          closeButton |
    |                                     topMargin                  TopMargin   |
    |                                     |                         _|___        |
    |                  ___________________|____________________    |     |       |
   m|--------l--------|                                        |-x-|  X  |---c---|m
   a|        e        |   Title                                | S |_____|   l   |a
   x|        f        |________________________________________| P           o   |x
   W|        t        |   |                                    | a           s   |W
   i|        M        |   ySpacing                             | c           e   |i
   d|        a        |___|____________________________________| i           B   |d
   t|        r        |                                        | n           u   |t
   h|        g        |   Content                              | g           t   |h
   M|        i        |                                        |             t   |M
   a|        n        |                                        |             o   |a
   r|                 |                                        |             n   |r
   g|                 |                                        |             R   |g
   i|                 |                                        |             i   |i
   n|                 |                                        |             g   |n
    |                 |                                        |             h   |
    |                 |                                        |             M   |
    |                 |________________________________________|             a   |
    |                                     |                                  r   |
    |                                     |                                  g   |
    |                                     bottomMargin                       i   |
    |                                     |                                  n   |
    |_____________________________________|______________________________________|

                                      maxHeightMargin
     */

    xSpacing: 10, // {number} how far the title and content is placed to the left of the close button
    ySpacing: 10, // {number} vertical space between title and content
    topMargin: 15, // {number} margin above content, or above title if provided
    bottomMargin: 15, // {number} margin below content
    leftMargin: null, // {number|null} margin to the left of the content.  If null, this is computed so that we have
    // the same margins on the left and right of the content.
    maxWidthMargin: 12, // {number} the margin between the left/right of the layoutBounds and the dialog, ignored if maxWidth is specified
    maxHeightMargin: 12, // {number} the margin between the top/bottom of the layoutBounds and the dialog, ignored if maxHeight is specified
    closeButtonTopMargin: 10, // {number} margin above the close button
    closeButtonRightMargin: 10, // {number} margin to the right of the close button

    // more Dialog-specific options
    isModal: true, // {boolean} modal dialogs prevent interaction with the rest of the sim while open

    // {Node|null} Title to be displayed at top. For a11y, make sure that its primary sibling has an accessible name
    title: null,
    titleAlign: 'center', // horizontal alignment of the title: {string} left, right or center

    // {function(Dialog,simBounds:Bounds2,screenBounds:Bounds2,scale:number)} which sets the dialog's position in
    // global coordinates. By default it will center the dialog in the middle of the current screen (not including nav bar).
    layoutStrategy: Dialog.DEFAULT_LAYOUT_STRATEGY,

    // close button options
    closeButtonListener: () => this.hide(),
    closeButtonColor: 'black', // {Color|null} color for the close button 'X'
    closeButtonTouchAreaXDilation: 0,
    closeButtonTouchAreaYDilation: 0,
    closeButtonMouseAreaXDilation: 0,
    closeButtonMouseAreaYDilation: 0,

    // {function|null} called after the dialog is shown, see https://github.com/phetsims/joist/issues/478
    showCallback: null,

    // {function|null} called after the dialog is hidden, see https://github.com/phetsims/joist/issues/478
    hideCallback: null,

    // pass through to Panel options
    cornerRadius: 10, // {number} radius of the dialog's corners
    resize: true, // {boolean} whether to resize if content's size changes
    fill: 'white', // {string|Color}
    stroke: 'black', // {string|Color}
    backgroundPickable: true,
    maxHeight: null, // if not provided, then dynamically calculate based on the layoutBounds of the current screen, see updateLayoutMultilink
    maxWidth: null, // if not provided, then dynamically calculate based on the layoutBounds of the current screen, see updateLayoutMultilink
    tandem: Tandem.OPTIONAL,
    phetioType: DialogIO,
    phetioReadOnly: false, // default to false so it can pass it through to the close button
    phetioState: false, // default to false so it can pass it through to the close button
    phetioComponentOptions: null, // filled in below with PhetioObject.mergePhetioComponentOptions()

    // sound generation, if set to null defaults will be used, set to Playable.NO_SOUND to disable
    openedSoundPlayer: null,
    closedSoundPlayer: null,

    // a11y options
    tagName: 'div',
    ariaRole: 'dialog',
    focusOnCloseNode: null, // {Node} receives focus on close, if null focus returns to element that had focus on open

    // By default set the accessible name of this dialog to be the content of the title. Some dialogs want to opt out
    // of providing the default accessible name for the dialog, opting to instead manage the accessible name
    // themselves, for example see KeyboardHelpDialog and https://github.com/phetsims/scenery-phet/issues/494
    addAriaLabelledByFromTitle: true
  }, options );

  // by default, copy the state of the dialog
  PhetioObject.mergePhetioComponentOptions( {
    phetioState: options.phetioState
  }, options );

  assert && assert( options.xMargin === undefined, 'Dialog sets xMargin' );
  options.xMargin = 0;
  assert && assert( options.yMargin === undefined, 'Dialog sets yMargin' );
  options.yMargin = 0;

  // if left margin is specified in options, use it. otherwise, set it to make the left right gutters symmetrical
  if ( options.leftMargin === null ) {
    options.leftMargin = options.xSpacing + CLOSE_BUTTON_WIDTH + options.closeButtonRightMargin;
  }

  // see https://github.com/phetsims/joist/issues/293
  assert && assert( options.isModal, 'Non-modal dialogs not currently supported' );

  // sound generation - create default players if needed
  const openedSoundPlayer = options.openedSoundPlayer || generalOpenSoundPlayer;
  const closedSoundPlayer = options.closedSoundPlayer || generalCloseSoundPlayer;

  // @protected (read-only) - whether the dialog is showing
  this.isShowingProperty = new BooleanProperty( false, {
    tandem: options.tandem.createTandem( 'isShowingProperty' ),
    phetioReadOnly: true,
    phetioState: options.phetioState // match the state transfer of the Dialog
  } );

  // The Dialog's display runs on this Property, so add the listener that controls show/hide.
  this.isShowingProperty.lazyLink( isShowing => {
    if ( isShowing ) {
      window.phet.joist.sim.showPopup( this, options.isModal );

      // sound generation
      openedSoundPlayer.play();

      // a11y - focus is returned to this element if dialog closed from accessible input
      this.activeElement = this.activeElement || Display.focusedNode;

      // a11y - modal dialogs should be the only readable content in the sim
      // TODO: https://github.com/phetsims/joist/issues/293 non-modal dialogs shouldn't hide other accessible content,
      // and this should be dependant on other things in the sim modalNodeStack
      this.sim.setAccessibleViewsVisible( false );

      // Do this last
      options.showCallback && options.showCallback();
    }
    else {
      window.phet.joist.sim.hidePopup( this, options.isModal );

      // sound generation
      closedSoundPlayer.play();

      // a11y - when the dialog is hidden, make all ScreenView content visible to assistive technology
      this.sim.setAccessibleViewsVisible( true );

      // Do this last
      options.hideCallback && options.hideCallback();
    }
  } );

  assert && assert( options.maxHeight === null || typeof options.maxHeight === 'number' );
  assert && assert( options.maxWidth === null || typeof options.maxWidth === 'number' );

  // keep track of if maxWidth and maxHeight were supplied by the client, because the default approach dynamically
  // updates them based on the current screens layoutBounds.
  const suppliedMaxHeight = !!options.maxHeight;
  const suppliedMaxWidth = !!options.maxWidth;

  // create close button
  const closeButton = new CloseButton( {

    pathStroke: options.closeButtonColor,
    iconLength: CLOSE_BUTTON_WIDTH,
    listener: () => {
      options.closeButtonListener();

      // if listener was fired because of accessibility
      if ( closeButton.buttonModel.isA11yClicking() ) {
        this.focusActiveElement();
      }
    },

    // phet-io
    tandem: options.tandem.createTandem( 'closeButton' ),
    phetioReadOnly: options.phetioReadOnly, // match the readOnly of the Dialog
    phetioState: false, // close button should not be in state
    phetioComponentOptions: {
      phetioState: false,

      // dialog close buttons by default do not have a featured visibleProperty
      visibleProperty: { phetioFeatured: false }
    },
    enabledPropertyOptions: { phetioFeatured: false }, // dialog close buttons by default do not have a featured enabledProperty

    // turn off default sound generation, Dialog will create its own sounds
    soundPlayer: Playable.NO_SOUND,

    // a11y
    tagName: 'button',
    innerContent: closeString
  } );

  // touch/mouse areas for the close button
  closeButton.touchArea = closeButton.bounds.dilatedXY(
    options.closeButtonTouchAreaXDilation,
    options.closeButtonTouchAreaYDilation
  );
  closeButton.mouseArea = closeButton.bounds.dilatedXY(
    options.closeButtonMouseAreaXDilation,
    options.closeButtonMouseAreaYDilation
  );

  // @private (a11y)
  this.closeButton = closeButton;

  // Align content, title, and close button using spacing and margin options

  // align content and title (if provided) vertically
  const contentAndTitle = new VBox( {
    children: options.title ? [ options.title, content ] : [ content ],
    spacing: options.ySpacing,
    align: options.titleAlign
  } );

  // add topMargin, bottomMargin, and leftMargin
  const contentAndTitleWithMargins = new AlignBox( contentAndTitle, {
    topMargin: options.topMargin,
    bottomMargin: options.bottomMargin,
    leftMargin: options.leftMargin
  } );

  // add closeButtonTopMargin and closeButtonRightMargin
  const closeButtonWithMargins = new AlignBox( closeButton, {
    topMargin: options.closeButtonTopMargin,
    rightMargin: options.closeButtonRightMargin
  } );

  // create content for Panel
  const dialogContent = new HBox( {
    children: [ contentAndTitleWithMargins, closeButtonWithMargins ],
    spacing: options.xSpacing,
    align: 'top'
  } );

  Panel.call( this, dialogContent, options );

  const sim = window.phet.joist.sim;

  this.updateLayoutMultilink = Property.multilink( [
    sim.boundsProperty,
    sim.screenBoundsProperty,
    sim.scaleProperty,
    sim.screenProperty
  ], ( bounds, screenBounds, scale, screen ) => {

    if ( bounds && screenBounds && scale ) {
      const screenView = screen.view;

      // Calculate the scale based on the current screen instead of using sim.scaleProperty which is a single
      // static scale that doesn't change based on the current screen. This allows the flexibility to apply the max
      // width/height to within the screen's layout bounds. Use bounds instead of screenBounds because of the
      // localToGlobalBounds call below.
      const screenScale = Math.min( bounds.width / screenView.layoutBounds.width,
        bounds.height / screenView.layoutBounds.height );

      // get the converted size of the screen's layout bounds, scaled via the sim.scaleProperty, in global coordinates
      const globalScreenViewBounds = screenView.localToGlobalBounds( screenView.layoutBounds );

      if ( !suppliedMaxHeight ) {
        const height = globalScreenViewBounds.height / screenScale;
        this.maxHeight = applyDoubleMargin( height, options.maxHeightMargin );
      }
      if ( !suppliedMaxWidth ) {
        const width = globalScreenViewBounds.width / screenScale;
        this.maxWidth = applyDoubleMargin( width, options.maxWidthMargin );
      }
      options.layoutStrategy( this, bounds, screenBounds, scale );
    }
  } );

  // @private
  this.sim = sim;

  // a11y - set the order of content, close button first so remaining content can be read from top to bottom
  // with virtual cursor
  this.accessibleOrder = [ closeButton, options.title, content ].filter( node => node !== undefined );

  // a11y - set the aria-labelledby relation so that whenever focus enters the dialog the title is read
  if ( options.title && options.title.tagName && options.addAriaLabelledByFromTitle ) {
    this.addAriaLabelledbyAssociation( {
      thisElementName: AccessiblePeer.PRIMARY_SIBLING,
      otherNode: options.title,
      otherElementName: AccessiblePeer.PRIMARY_SIBLING
    } );
  }

  // @private (a11y) - the active element when the dialog is shown, tracked so that focus can be restored on close
  this.activeElement = options.focusOnCloseNode || null;

  // a11y - close the dialog when pressing "escape"
  const escapeListener = {
    keydown: event => {
      const domEvent = event.domEvent;

      if ( domEvent.keyCode === KeyboardUtils.KEY_ESCAPE ) {
        domEvent.preventDefault();
        this.hide();
        this.focusActiveElement();
      }
      else if ( domEvent.keyCode === KeyboardUtils.KEY_TAB && FullScreen.isFullScreen() ) {

        // prevent a particular bug in Windows 7/8.1 Firefox where focus gets trapped in the document
        // when the navigation bar is hidden and there is only one focusable element in the DOM
        // see https://bugzilla.mozilla.org/show_bug.cgi?id=910136
        const activeId = Display.focus.trail.getUniqueId();
        const noNextFocusable = AccessibilityUtils.getNextFocusable().id === activeId;
        const noPreviousFocusable = AccessibilityUtils.getPreviousFocusable().id === activeId;

        if ( noNextFocusable && noPreviousFocusable ) {
          domEvent.preventDefault();
        }
      }
    }
  };
  this.addInputListener( escapeListener );

  // @private - to be called on dispose()
  this.disposeDialog = () => {
    this.updateLayoutMultilink.dispose();
    this.removeInputListener( escapeListener );

    this.isShowingProperty.dispose();
    closeButton.dispose();

    // remove dialog content from scene graph, but don't dispose because Panel
    // needs to remove listeners on the content in its dispose()
    dialogContent.removeAllChildren();
    dialogContent.detach();
  };
}

sun.register( 'Dialog', Dialog );

inherit( Panel, Dialog, {

  /**
   * @public
   */
  show: function() {
    this.isShowingProperty.value = true;
  },

  /**
   * Hide the dialog.  If you create a new dialog next time you show(), be sure to dispose this
   * dialog instead.
   * @public
   */
  hide: function() {
    this.isShowingProperty.value = false;
  },

  /**
   * Make eligible for garbage collection.
   * @public
   */
  dispose() {
    this.hide();
    this.disposeDialog();
    Panel.prototype.dispose.call( this );
  },

  /**
   * If there is an active element, focus it.  Should almost always be called after the Dialog has been closed.
   *
   * @public
   * @a11y
   */
  focusActiveElement() {
    this.activeElement && this.activeElement.focus();
  },

  /**
   * Place keyboard focus on the close button, useful when opening the dialog with an accessibility interaction.
   * @public
   */
  focusCloseButton() {
    this.closeButton.focus();
  }
} );

// @private - Center in the screenBounds (doesn't include the navigation bar)
Dialog.DEFAULT_LAYOUT_STRATEGY = ( dialog, simBounds, screenBounds, scale ) => {
  dialog.center = screenBounds.center.times( 1.0 / scale );
};

// {function(number,number):number}
const applyDoubleMargin = ( dimension, margin ) => dimension > margin * 2 ? dimension - margin * 2 : dimension;

/**
 * The close button for Dialog
 * A flat x
 *
 * @param {Object} [options] - see RectangularPushButton
 * @constructor
 */
function CloseButton( options ) {
  options = merge( {
    iconLength: 7,
    baseColor: 'transparent',
    pathStroke: 'black', // {Color|null} color for the close button 'X'
    buttonAppearanceStrategy: RectangularButtonView.FlatAppearanceStrategy,
    xMargin: 0,
    yMargin: 0,
    listener: null // {function} called when the button is pressed
  }, options );

  // close button shape, an 'X'
  const closeButtonShape = new Shape()
    .moveTo( -options.iconLength / 2, -options.iconLength / 2 )
    .lineTo( options.iconLength / 2, options.iconLength / 2 )
    .moveTo( options.iconLength / 2, -options.iconLength / 2 )
    .lineTo( -options.iconLength / 2, options.iconLength / 2 );

  assert && assert( !options.content, 'Dialog.CloseButton sets content' );

  options.content = new Path( closeButtonShape, {
    stroke: options.pathStroke,
    lineCap: 'round',
    lineWidth: 2
  } );

  RectangularPushButton.call( this, options );
}

inherit( RectangularPushButton, CloseButton );

export default Dialog;