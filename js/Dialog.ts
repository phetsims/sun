// Copyright 2018-2023, University of Colorado Boulder

/**
 * General dialog type. Migrated from Joist on 4/10/2018
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrea Lin (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Multilink from '../../axon/js/Multilink.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import ScreenView from '../../joist/js/ScreenView.js';
import Sim from '../../joist/js/Sim.js';
import getGlobal from '../../phet-core/js/getGlobal.js';
import optionize from '../../phet-core/js/optionize.js';
import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import CloseButton from '../../scenery-phet/js/buttons/CloseButton.js';
import { AlignBox, FocusManager, FullScreen, HBox, KeyboardUtils, Node, PDOMPeer, PDOMUtils, TColor, TInputListener, VBox, voicingManager } from '../../scenery/js/imports.js';
import TSoundPlayer from '../../tambo/js/TSoundPlayer.js';
import generalCloseSoundPlayer from '../../tambo/js/shared-sound-players/generalCloseSoundPlayer.js';
import generalOpenSoundPlayer from '../../tambo/js/shared-sound-players/generalOpenSoundPlayer.js';
import nullSoundPlayer from '../../tambo/js/shared-sound-players/nullSoundPlayer.js';
import Tandem from '../../tandem/js/Tandem.js';
import DynamicMarkerIO from '../../tandem/js/types/DynamicMarkerIO.js';
import IOType from '../../tandem/js/types/IOType.js';
import Utterance from '../../utterance-queue/js/Utterance.js';
import ButtonNode from './buttons/ButtonNode.js';
import Panel, { PanelOptions } from './Panel.js';
import Popupable, { PopupableOptions } from './Popupable.js';
import sun from './sun.js';
import SunStrings from './SunStrings.js';
import TinyProperty from '../../axon/js/TinyProperty.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import PatternStringProperty from '../../axon/js/PatternStringProperty.js';

// see SelfOptions.titleAlign
type DialogTitleAlign = 'left' | 'right' | 'center';

/**
 * see SelfOptions.layoutStrategy
 * @param dialog
 * @param simBounds - see Sim.boundsProperty
 * @param screenBounds - see Sim.screenBoundsProperty
 * @param scale - see Sim.scaleProperty
 */
type DialogLayoutStrategy = ( dialog: Dialog, simBounds: Bounds2, screenBounds: Bounds2, scale: number ) => void;

type SelfOptions = {

  /* Margins and spacing:

                              maxHeightMargin
  ____________________________________________________________________________
  |                                     |                          |           |
  |                                     |                          closeButton |
  |                                     topMargin                  TopMargin   |
  |                                     |                         _|___        |
  |                  ___________________|____________________    |     |       |
m |--------l--------|                                        |-x-|  X  |---c---| m
a |        e        |   Title                                | S |_____|   l   | a
x |        f        |________________________________________| P           o   | x
W |        t        |   |                                    | a           s   | W
i |        M        |   ySpacing                             | c           e   | i
d |        a        |___|____________________________________| i           B   | d
t |        r        |                                        | n           u   | t
h |        g        |   Content                              | g           t   | h
M |        i        |                                        |             t   | M
a |        n        |                                        |             o   | a
r |                 |                                        |             n   | r
g |                 |                                        |             R   | g
i |                 |                                        |             i   | i
n |                 |                                        |             g   | n
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

  // Margins and spacing
  xSpacing?: number; // how far the title and content is placed to the left of the close button
  ySpacing?: number; // vertical space between title and content
  topMargin?: number; // margin above content, or above title if provided
  bottomMargin?: number; // margin below content
  leftMargin?: number | null; // margin to the left of the content.  If null, this is computed so that we have the same margins on the left and right of the content.
  maxWidthMargin?: number; // the margin between the left/right of the layoutBounds and the dialog, ignored if maxWidth is specified
  maxHeightMargin?: number; // the margin between the top/bottom of the layoutBounds and the dialog, ignored if maxHeight is specified
  closeButtonLength?: number; // width of the close button
  closeButtonTopMargin?: number; // margin above the close button
  closeButtonRightMargin?: number; // margin to the right of the close button

  // title
  title?: Node | null; // Title to be displayed at top. For a11y, its primary sibling must have an accessible name.
  titleAlign?: DialogTitleAlign; // horizontal alignment

  // By default, the accessible name of this dialog is the content of the title. Some dialogs want to opt out
  // of providing the default accessible name for the dialog, opting to instead manage the accessible name
  // themselves, for example see KeyboardHelpDialog and https://github.com/phetsims/scenery-phet/issues/494
  addAriaLabelledByFromTitle?: boolean;

  // Sets the dialog's position in global coordinates.
  layoutStrategy?: DialogLayoutStrategy;

  // close button options
  closeButtonListener?: () => void;
  closeButtonColor?: TColor;
  closeButtonTouchAreaXDilation?: number;
  closeButtonTouchAreaYDilation?: number;
  closeButtonMouseAreaXDilation?: number;
  closeButtonMouseAreaYDilation?: number;

  // If provided use this dialog title in the Close button voicingNameResponse. This should be provided
  // for proper Dialog Voicing design.
  closeButtonVoicingDialogTitle?: string | TReadOnlyProperty<string> | null;

  // By default, the close button is placed first in the PDOMOrder (and thus the focus order). Set this to true
  // if you want the close button to be the last element in the focus order for the Dialog.
  closeButtonLastInPDOM?: boolean;

  // sound generation
  openedSoundPlayer?: TSoundPlayer;
  closedSoundPlayer?: TSoundPlayer;

  sim?: Sim;

  // Called after the dialog is shown, see https://github.com/phetsims/joist/issues/478
  showCallback?: ( () => void ) | null;

  // Called after the dialog is hidden, see https://github.com/phetsims/joist/issues/478
  hideCallback?: ( () => void ) | null;
};

type ParentOptions = PanelOptions & PopupableOptions;

export type DialogOptions = SelfOptions & StrictOmit<ParentOptions, 'xMargin' | 'yMargin'>;

export default class Dialog extends Popupable( Panel, 1 ) {

  private readonly closeButton: CloseButton;
  private readonly sim: Sim;
  private readonly disposeDialog: () => void;

  /**
   * @param content - The content to display inside the dialog (not including the title)
   * @param providedOptions
   */
  public constructor( content: Node, providedOptions?: DialogOptions ) {

    const options = optionize<DialogOptions, SelfOptions, ParentOptions>()( {

      // DialogOptions
      xSpacing: 10,
      ySpacing: 10,
      topMargin: 15,
      bottomMargin: 15,
      leftMargin: null,
      maxWidthMargin: 12,
      maxHeightMargin: 12,
      closeButtonLength: 18.2,
      closeButtonTopMargin: 10,
      closeButtonRightMargin: 10,
      title: null,
      titleAlign: 'center',
      addAriaLabelledByFromTitle: true,
      layoutStrategy: defaultLayoutStrategy,
      closeButtonListener: () => this.hide(),
      closeButtonColor: 'black',
      closeButtonTouchAreaXDilation: 0,
      closeButtonTouchAreaYDilation: 0,
      closeButtonMouseAreaXDilation: 0,
      closeButtonMouseAreaYDilation: 0,
      closeButtonVoicingDialogTitle: null,
      closeButtonLastInPDOM: false,
      openedSoundPlayer: generalOpenSoundPlayer,
      closedSoundPlayer: generalCloseSoundPlayer,
      sim: getGlobal( 'phet.joist.sim' ),
      showCallback: null,
      hideCallback: null,

      // PopupableOptions
      layoutBounds: ScreenView.DEFAULT_LAYOUT_BOUNDS,
      focusOnShowNode: null,

      // PanelOptions
      cornerRadius: 10, // {number} radius of the dialog's corners
      resize: true, // {boolean} whether to resize if content's size changes
      fill: 'white', // {string|Color}
      stroke: 'black', // {string|Color}
      backgroundPickable: true,
      maxHeight: null, // if not provided, then dynamically calculate based on the layoutBounds of the current screen, see updateLayoutMultilink
      maxWidth: null, // if not provided, then dynamically calculate based on the layoutBounds of the current screen, see updateLayoutMultilink

      // phet-io
      tandem: Tandem.OPTIONAL,
      phetioType: Dialog.DialogIO,
      phetioState: true, // Dialog is often a dynamic element, and thus needs to be in state to trigger element creation.
      phetioVisiblePropertyInstrumented: false, // visible isn't toggled when showing a Dialog

      // pdom options
      tagName: 'div',
      ariaRole: 'dialog'
    }, providedOptions );

    assert && assert( options.sim, 'sim must be provided, as Dialog needs a Sim instance' );

    assert && assert( options.xMargin === undefined, 'Dialog sets xMargin' );
    options.xMargin = 0;
    assert && assert( options.yMargin === undefined, 'Dialog sets yMargin' );
    options.yMargin = 0;

    // if left margin is specified in options, use it. otherwise, set it to make the left right gutters symmetrical
    if ( options.leftMargin === null ) {
      options.leftMargin = options.xSpacing + options.closeButtonLength + options.closeButtonRightMargin;
    }

    assert && assert( options.maxHeight === null || typeof options.maxHeight === 'number' );
    assert && assert( options.maxWidth === null || typeof options.maxWidth === 'number' );

    // Apply maxWidth/maxHeight depending on the margins and layoutBounds
    if ( !options.maxWidth && options.layoutBounds ) {
      options.maxWidth = applyDoubleMargin( options.layoutBounds.width, options.maxWidthMargin );
    }
    if ( !options.maxHeight && options.layoutBounds ) {
      options.maxHeight = applyDoubleMargin( options.layoutBounds.height, options.maxHeightMargin );
    }

    // We need an "unattached" utterance so that when the close button fires, hiding the close button, we still hear
    // the context response. But we still should only hear this context response when "Sim Voicing" is enabled.
    const contextResponseUtterance = new Utterance( {
      priority: Utterance.MEDIUM_PRIORITY,
      voicingCanAnnounceProperties: [ voicingManager.voicingFullyEnabledProperty ]
    } );

    // create close button - a flat "X"
    const closeButton = new CloseButton( {
      iconLength: options.closeButtonLength,
      baseColor: 'transparent',
      buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy,

      // no margins since the flat X takes up all the space
      xMargin: 0,
      yMargin: 0,

      listener: () => {

        // Context response first, before potentially changing focus with the callback listener
        closeButton.voicingSpeakContextResponse( {
          utterance: contextResponseUtterance
        } );

        options.closeButtonListener();
      },

      pathOptions: {
        stroke: options.closeButtonColor
      },

      // phet-io
      tandem: options.tandem.createTandem( 'closeButton' ),
      phetioState: false, // close button should not be in state

      // It is a usability concern to change either of these, also there are other ways to exit a Dialog, so using
      // these is buggy.
      phetioVisiblePropertyInstrumented: false,
      phetioEnabledPropertyInstrumented: false,

      // turn off default sound generation, Dialog will create its own sounds
      soundPlayer: nullSoundPlayer,

      // pdom
      tagName: 'button',
      innerContent: SunStrings.a11y.closeStringProperty,

      // voicing
      voicingContextResponse: SunStrings.a11y.closedStringProperty
    } );


    let closeButtonVoicingNameResponseProperty: PatternStringProperty<{ title: TReadOnlyProperty<string> }>;
    if ( options.closeButtonVoicingDialogTitle ) {
      const titleProperty = typeof options.closeButtonVoicingDialogTitle === 'string' ? new TinyProperty( options.closeButtonVoicingDialogTitle ) : options.closeButtonVoicingDialogTitle;
      closeButtonVoicingNameResponseProperty = closeButton.voicingNameResponse = new PatternStringProperty( SunStrings.a11y.titleClosePatternStringProperty, { title: titleProperty } );
    }

    // touch/mouse areas for the close button
    closeButton.touchArea = closeButton.bounds.dilatedXY(
      options.closeButtonTouchAreaXDilation,
      options.closeButtonTouchAreaYDilation
    );
    closeButton.mouseArea = closeButton.bounds.dilatedXY(
      options.closeButtonMouseAreaXDilation,
      options.closeButtonMouseAreaYDilation
    );

    // pdom - set the order of content, close button first so remaining content can be read from top to bottom
    // with virtual cursor
    let pdomOrder = [ options.title, content ];
    options.closeButtonLastInPDOM ? pdomOrder.push( closeButton ) : pdomOrder.unshift( closeButton );
    pdomOrder = pdomOrder.filter( node => node !== undefined && node !== null );

    // pdom - fall back to focusing the closeButton by default if there is no focusOnShowNode or the
    // content is not focusable
    assert && assert( pdomOrder[ 0 ] );
    options.focusOnShowNode = options.focusOnShowNode ? options.focusOnShowNode :
                              pdomOrder[ 0 ]!.focusable ? pdomOrder[ 0 ] :
                              closeButton;


    assert && assert( options.focusOnShowNode instanceof Node, 'should be non-null and defined' );
    assert && assert( options.focusOnShowNode!.focusable, 'focusOnShowNode must be focusable.' );

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

    super( dialogContent, options );

    // The Dialog's display runs on this Property, so add the listener that controls show/hide.
    this.isShowingProperty.lazyLink( isShowing => {
      if ( isShowing ) {
        // sound generation
        options.openedSoundPlayer.play();

        // Do this last
        options.showCallback && options.showCallback();
      }
      else {
        // sound generation
        options.closedSoundPlayer.play();

        // Do this last
        options.hideCallback && options.hideCallback();
      }
    } );

    this.sim = options.sim;
    this.closeButton = closeButton;

    const updateLayoutMultilink = Multilink.multilink( [
      this.sim.boundsProperty,
      this.sim.screenBoundsProperty,
      this.sim.scaleProperty,
      this.sim.selectedScreenProperty,
      this.isShowingProperty,
      this.localBoundsProperty
    ], ( bounds, screenBounds, scale ) => {
      if ( bounds && screenBounds && scale ) {
        options.layoutStrategy( this, bounds, screenBounds, scale );
      }
    } );

    // Setter after the super call
    this.pdomOrder = pdomOrder;

    // pdom - set the aria-labelledby relation so that whenever focus enters the dialog the title is read
    if ( options.title && options.title.tagName && options.addAriaLabelledByFromTitle ) {
      this.addAriaLabelledbyAssociation( {
        thisElementName: PDOMPeer.PRIMARY_SIBLING,
        otherNode: options.title,
        otherElementName: PDOMPeer.PRIMARY_SIBLING
      } );
    }

    // pdom - close the dialog when pressing "escape"
    const escapeListener: TInputListener = {
      keydown: event => {
        const domEvent = event.domEvent; // {DOMEvent|null}

        if ( KeyboardUtils.isKeyEvent( event.domEvent, KeyboardUtils.KEY_ESCAPE ) ) {
          assert && assert( domEvent );
          domEvent!.preventDefault();
          this.hide();
        }
        else if ( KeyboardUtils.isKeyEvent( event.domEvent, KeyboardUtils.KEY_TAB ) && FullScreen.isFullScreen() ) {

          // prevent a particular bug in Windows 7/8.1 Firefox where focus gets trapped in the document
          // when the navigation bar is hidden and there is only one focusable element in the DOM
          // see https://bugzilla.mozilla.org/show_bug.cgi?id=910136
          assert && assert( FocusManager.pdomFocus ); // {Focus|null}
          const activeId = FocusManager.pdomFocus!.trail.getUniqueId();
          const noNextFocusable = PDOMUtils.getNextFocusable().id === activeId;
          const noPreviousFocusable = PDOMUtils.getPreviousFocusable().id === activeId;

          if ( noNextFocusable && noPreviousFocusable ) {
            assert && assert( domEvent );
            domEvent!.preventDefault();
          }
        }
      }
    };
    this.addInputListener( escapeListener );

    this.disposeDialog = () => {
      updateLayoutMultilink.dispose();
      closeButtonWithMargins.dispose();
      this.removeInputListener( escapeListener );

      closeButtonVoicingNameResponseProperty && closeButtonVoicingNameResponseProperty.dispose();

      closeButton.dispose();

      contextResponseUtterance.dispose();
      contentAndTitle.dispose();

      // remove dialog content from scene graph, but don't dispose because Panel
      // needs to remove listeners on the content in its dispose()
      dialogContent.removeAllChildren();
      dialogContent.detach();
    };
  }

  public override dispose(): void {
    this.disposeDialog();
    super.dispose();
  }

  public static DialogIO = new IOType( 'DialogIO', {
    valueType: Dialog,

    // Since many Dialogs are dynamic elements, these need to be in the state. The value of the state object doesn't
    // matter, but it instead just serves as a marker to tell the state engine to recreate the Dialog (if dynamic) when
    // setting state.
    supertype: DynamicMarkerIO
  } );
}

// Default value for options.layoutStrategy, centers the Dialog in the layoutBounds.
function defaultLayoutStrategy( dialog: Dialog, simBounds: Bounds2, screenBounds: Bounds2, scale: number ): void {
  if ( dialog.layoutBounds ) {
    dialog.center = dialog.layoutBounds.center;
  }
}

/**
 * @param dimension - width or height dimension
 * @param margin - margin to be applied to the dimension
 */
function applyDoubleMargin( dimension: number, margin: number ): number {
  return ( dimension > margin * 2 ) ? ( dimension - margin * 2 ) : dimension;
}

sun.register( 'Dialog', Dialog );