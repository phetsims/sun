// Copyright 2018-2021, University of Colorado Boulder

/**
 * View for demonstrating dialogs.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import dotRandom from '../../../dot/js/dotRandom.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../scenery/js/nodes/Text.js';
import Font from '../../../scenery/js/util/Font.js';
import Tandem from '../../../tandem/js/Tandem.js';
import RectangularPushButton from '../buttons/RectangularPushButton.js';
import Dialog from '../Dialog.js';
import sun from '../sun.js';

// constants
const BUTTON_FONT = new Font( { size: 20 } );

class DialogsScreenView extends ScreenView {
  constructor() {

    super( {
      tandem: Tandem.OPT_OUT
    } );

    // dialog will be created the first time the button is pressed, lazily because Dialog
    // requires sim bounds during Dialog construction
    let dialog = null;

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

/**
 * Creates a model or non-modal dialog
 * @param {boolean} modal
 * @returns {Dialog}
 */
function createDialog( modal ) {

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
    modal: modal,
    hasCloseButton: !modal,
    title: new Text( 'Title', { font: new Font( { size: 32 } ) } )
  } );
}

sun.register( 'DialogsScreenView', DialogsScreenView );
export default DialogsScreenView;