// Copyright 2018-2021, University of Colorado Boulder

/**
 * General dialog type. Migrated from Joist on 4/10/2018
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrea Lin (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../axon/js/Property.js';
import ScreenView from '../../joist/js/ScreenView.js';
import getGlobal from '../../phet-core/js/getGlobal.js';
import merge from '../../phet-core/js/merge.js';
import CloseButton from '../../scenery-phet/js/buttons/CloseButton.js';
import FocusManager from '../../scenery/js/accessibility/FocusManager.js';
import KeyboardUtils from '../../scenery/js/accessibility/KeyboardUtils.js';
import PDOMPeer from '../../scenery/js/accessibility/pdom/PDOMPeer.js';
import PDOMUtils from '../../scenery/js/accessibility/pdom/PDOMUtils.js';
import AlignBox from '../../scenery/js/nodes/AlignBox.js';
import HBox from '../../scenery/js/nodes/HBox.js';
import VBox from '../../scenery/js/nodes/VBox.js';
import FullScreen from '../../scenery/js/util/FullScreen.js';
import Playable from '../../tambo/js/Playable.js';
import generalCloseSoundPlayer from '../../tambo/js/shared-sound-players/generalCloseSoundPlayer.js';
import generalOpenSoundPlayer from '../../tambo/js/shared-sound-players/generalOpenSoundPlayer.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import DynamicMarkerIO from '../../tandem/js/types/DynamicMarkerIO.js';
import IOType from '../../tandem/js/types/IOType.js';
import ButtonNode from './buttons/ButtonNode.js';
import Panel from './Panel.js';
import Popupable from './Popupable.js';
import sun from './sun.js';
import sunStrings from './sunStrings.js';

class Dialog extends Popupable( Panel ) {

  /**
   * @param {Node} content - The content to display inside the dialog (not including the title)
   * @param {Object} [options]
   */
  constructor( content, options ) {

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
      closeButtonLength: 18.2, // {number} width of the close button
      closeButtonTopMargin: 10, // {number} margin above the close button
      closeButtonRightMargin: 10, // {number} margin to the right of the close button

      // {Bounds2|null}
      layoutBounds: ScreenView.DEFAULT_LAYOUT_BOUNDS,

      // more Dialog-specific options
      isModal: true, // {boolean} modal dialogs prevent interaction with the rest of the sim while open

      // {Node|null} Title to be displayed at top. For a11y, make sure that its primary sibling has an accessible name
      title: null,
      titleAlign: 'center', // horizontal alignment of the title: {string} left, right or center

      // {function(Dialog,simBounds:Bounds2,screenBounds:Bounds2,scale:number)} which sets the dialog's position in
      // global coordinates. By default it will center the dialog in the middle of the current screen (not including nav bar).
      layoutStrategy: defaultLayoutStrategy,

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
      phetioType: Dialog.DialogIO,
      phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly, // default to false so it can pass it through to the close button
      phetioState: PhetioObject.DEFAULT_OPTIONS.phetioState,

      // {Playable} - sound generation
      openedSoundPlayer: generalOpenSoundPlayer,
      closedSoundPlayer: generalCloseSoundPlayer,

      sim: getGlobal( 'phet.joist.sim' ),

      // pdom options
      tagName: 'div',
      ariaRole: 'dialog',

      // By default set the accessible name of this dialog to be the content of the title. Some dialogs want to opt out
      // of providing the default accessible name for the dialog, opting to instead manage the accessible name
      // themselves, for example see KeyboardHelpDialog and https://github.com/phetsims/scenery-phet/issues/494
      addAriaLabelledByFromTitle: true
    }, options );

    assert && assert( options.sim, 'sim must be provided, as Dialog needs a Sim instance' );

    assert && assert( options.xMargin === undefined, 'Dialog sets xMargin' );
    options.xMargin = 0;
    assert && assert( options.yMargin === undefined, 'Dialog sets yMargin' );
    options.yMargin = 0;

    // if left margin is specified in options, use it. otherwise, set it to make the left right gutters symmetrical
    if ( options.leftMargin === null ) {
      options.leftMargin = options.xSpacing + options.closeButtonLength + options.closeButtonRightMargin;
    }

    // see https://github.com/phetsims/joist/issues/293
    assert && assert( options.isModal, 'Non-modal dialogs not currently supported' );

    assert && assert( options.maxHeight === null || typeof options.maxHeight === 'number' );
    assert && assert( options.maxWidth === null || typeof options.maxWidth === 'number' );

    // Apply maxWidth/maxHeight depending on the margins and layoutBounds
    if ( !options.maxWidth && options.layoutBounds ) {
      options.maxWidth = applyDoubleMargin( options.layoutBounds.width, options.maxWidthMargin );
    }
    if ( !options.maxHeight && options.layoutBounds ) {
      options.maxHeight = applyDoubleMargin( options.layoutBounds.height, options.maxHeightMargin );
    }

    // create close button - a flat "X"
    const closeButton = new CloseButton( {
      iconLength: options.closeButtonLength,
      baseColor: 'transparent',
      buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy,

      // no margins since the flat X takes up all the space
      xMargin: 0,
      yMargin: 0,

      listener: () => {
        options.closeButtonListener();

        // if listener was fired because of accessibility
        if ( closeButton.isPDOMClicking() ) {
          this.restoreFocus();
        }
      },

      pathOptions: {
        stroke: options.closeButtonColor
      },

      // phet-io
      tandem: options.tandem.createTandem( 'closeButton' ),
      phetioReadOnly: options.phetioReadOnly, // match the readOnly of the Dialog

      phetioState: false, // close button should not be in state

      // dialog close buttons by default do not have a featured visibleProperty
      visiblePropertyOptions: {
        phetioFeatured: false,
        phetioState: false
      },

      // dialog close buttons by default do not have a featured enabledProperty
      enabledPropertyOptions: { phetioFeatured: false },

      // turn off default sound generation, Dialog will create its own sounds
      soundPlayer: Playable.NO_SOUND,

      // pdom
      tagName: 'button',
      innerContent: sunStrings.a11y.close
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

    super( {
      isModal: options.isModal,
      layoutBounds: options.layoutBounds,
      tandem: options.tandem,
      phetioState: options.phetioState
    }, dialogContent, options );

    // {Node|null} see setFocusOnCloseNode
    this.focusOnCloseNode = null;

    // {Node|null} - Either focusOnCloseNode (if defined) or the Node that has focus
    // before the Dialog is opened, so focus can be restored to this Node when the
    // Dialog is closed.
    this.nodeToReturnFocus = null;

    // The Dialog's display runs on this Property, so add the listener that controls show/hide.
    this.isShowingProperty.lazyLink( isShowing => {
      if ( isShowing ) {
        // sound generation
        options.openedSoundPlayer.play();

        this.nodeToReturnFocus = this.focusOnCloseNode || FocusManager.pdomFocusedNode;

        // pdom - modal dialogs should be the only readable content in the sim
        // TODO: https://github.com/phetsims/joist/issues/293 non-modal dialogs shouldn't hide other accessible content,
        // and this should be dependant on other things in the sim modalNodeStack
        this.sim.setAccessibleViewsVisible( false );

        // Do this last
        options.showCallback && options.showCallback();
      }
      else {
        // sound generation
        options.closedSoundPlayer.play();

        // pdom - when the dialog is hidden, make all ScreenView content visible to assistive technology
        this.sim.setAccessibleViewsVisible( true );

        // Do this last
        options.hideCallback && options.hideCallback();
      }
    } );

    // @private {Bounds2|null}
    this.layoutBounds = options.layoutBounds;

    // @private (a11y)
    this.closeButton = closeButton;

    // @private {Sim}
    this.sim = options.sim;

    this.updateLayoutMultilink = Property.multilink( [
      this.sim.boundsProperty,
      this.sim.screenBoundsProperty,
      this.sim.scaleProperty,
      this.sim.screenProperty,
      this.isShowingProperty
    ], ( bounds, screenBounds, scale, screen ) => {
      if ( bounds && screenBounds && scale ) {
        options.layoutStrategy( this, bounds, screenBounds, scale );
      }
    } );

    // pdom - set the order of content, close button first so remaining content can be read from top to bottom
    // with virtual cursor
    this.pdomOrder = [ closeButton, options.title, content ].filter( node => node !== undefined );

    // pdom - set the aria-labelledby relation so that whenever focus enters the dialog the title is read
    if ( options.title && options.title.tagName && options.addAriaLabelledByFromTitle ) {
      this.addAriaLabelledbyAssociation( {
        thisElementName: PDOMPeer.PRIMARY_SIBLING,
        otherNode: options.title,
        otherElementName: PDOMPeer.PRIMARY_SIBLING
      } );
    }

    // @private (a11y) {Node|null} see setFocusOnCloseNode
    this.focusOnCloseNode = null;

    // pdom - close the dialog when pressing "escape"
    const escapeListener = {
      keydown: event => {
        const domEvent = event.domEvent;

        if ( KeyboardUtils.isKeyEvent( event.domEvent, KeyboardUtils.KEY_ESCAPE ) ) {
          domEvent.preventDefault();
          this.hide();
          this.restoreFocus();
        }
        else if ( KeyboardUtils.isKeyEvent( event.domEvent, KeyboardUtils.KEY_TAB ) && FullScreen.isFullScreen() ) {

          // prevent a particular bug in Windows 7/8.1 Firefox where focus gets trapped in the document
          // when the navigation bar is hidden and there is only one focusable element in the DOM
          // see https://bugzilla.mozilla.org/show_bug.cgi?id=910136
          const activeId = FocusManager.pdomFocus.trail.getUniqueId();
          const noNextFocusable = PDOMUtils.getNextFocusable().id === activeId;
          const noPreviousFocusable = PDOMUtils.getPreviousFocusable().id === activeId;

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

      closeButton.dispose();

      // remove dialog content from scene graph, but don't dispose because Panel
      // needs to remove listeners on the content in its dispose()
      dialogContent.removeAllChildren();
      dialogContent.detach();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeDialog();
    super.dispose();
  }

  /**
   * Set the Node that receives focus when the Dialog is closed. If null, focus returns to the element that had focus
   * when the Dialog was opened.
   * @param {Node|null} node
   * @public
   */
  setFocusOnCloseNode( node ) {
    this.focusOnCloseNode = node;
  }

  /**
   * Restores focus to either focusOnCloseNode, or the element that had focus when the menu was opened.
   * @private
   */
  restoreFocus() {
    if ( this.nodeToReturnFocus ) {
      this.nodeToReturnFocus.focus();
    }
  }

  /**
   * Place keyboard focus on the close button, useful when opening the dialog with an accessibility interaction.
   * @public
   */
  focusCloseButton() {
    this.closeButton.focus();
  }
}

// Default value for options.layoutStrategy, centers the Dialog in the layoutBounds
function defaultLayoutStrategy( dialog, simBounds, screenBounds, scale ) {
  if ( dialog.layoutBounds ) {
    dialog.center = dialog.layoutBounds.center;
  }
}

function applyDoubleMargin( dimension, margin ) {
  return ( dimension > margin * 2 ) ? ( dimension - margin * 2 ) : dimension;
}

Dialog.DialogIO = new IOType( 'DialogIO', {
  valueType: Dialog,

  // Since many Dialogs are dynamic elements, these need to be in the state. The value of the state object doesn't
  // matter, but it instead just serves as a marker to tell the state engine to recreate the Dialog (if dynamic) when
  // setting state.
  supertype: DynamicMarkerIO
} );

sun.register( 'Dialog', Dialog );
export default Dialog;