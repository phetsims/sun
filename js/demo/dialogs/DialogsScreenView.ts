// Copyright 2018-2022, University of Colorado Boulder

/**
 * View for demonstrating dialogs.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import { Font, Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import RectangularPushButton from '../../buttons/RectangularPushButton.js';
import Dialog from '../../Dialog.js';
import sun from '../../sun.js';
import { DemosScreenViewOptions } from '../DemosScreenView.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';

// constants
const BUTTON_FONT = new Font( { size: 20 } );

type SelfOptions = EmptySelfOptions;
type DialogsScreenViewOptions = SelfOptions & PickRequired<DemosScreenViewOptions, 'tandem'>;

class DialogsScreenView extends ScreenView {

  public constructor( providedOptions: DialogsScreenViewOptions ) {

    super( providedOptions );

    // dialog will be created the first time the button is pressed, lazily because Dialog
    // requires sim bounds during Dialog construction
    let dialog: Dialog | null = null;

    const modalDialogButton = new RectangularPushButton( {
      content: new Text( 'modal dialog', { font: BUTTON_FONT } ),
      listener: () => {
        if ( !dialog ) {
          dialog = createDialog( true );
        }
        dialog.show();
      },
      left: this.layoutBounds.left + 100,
      top: this.layoutBounds.top + 100,
      tandem: Tandem.OPT_OUT
    } );
    this.addChild( modalDialogButton );
  }
}

function createDialog( isModal: boolean ): Dialog {

  const resizeButton = new RectangularPushButton( {
    content: new Text( 'Resize', { font: new Font( { size: 18 } ) } )
  } );

  const minWidth = 1.5 * resizeButton.width;
  const minHeight = 1.5 * resizeButton.height;

  // This rectangle represents that bounds of the Dialog's content.
  const randomRect = new Rectangle( 0, 0, minWidth, minHeight, { stroke: 'red' } );
  resizeButton.center = randomRect.center;

  resizeButton.addListener( () => {
    randomRect.rectWidth = minWidth + dotRandom.nextDouble() * 200;
    randomRect.rectHeight = minHeight + dotRandom.nextDouble() * 100;
    resizeButton.center = randomRect.center;
  } );

  const contentNode = new Node( { children: [ randomRect, resizeButton ] } );

  return new Dialog( contentNode, {
    titleAlign: 'center',
    isModal: isModal,
    title: new Text( 'Title', { font: new Font( { size: 32 } ) } )
  } );
}

sun.register( 'DialogsScreenView', DialogsScreenView );
export default DialogsScreenView;