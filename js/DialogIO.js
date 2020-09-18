// Copyright 2018-2020, University of Colorado Boulder

/**
 * IO Type for Dialog
 * Used to live at '/joist/js/DialogIO'. Moved to '/sun/js/DialogIO' on 4/10/2018
 *
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import NodeIO from '../../scenery/js/nodes/NodeIO.js';
import IOType from '../../tandem/js/types/IOType.js';
import sun from './sun.js';

const DialogIO = new IOType( 'DialogIO', {
  isValidValue: v => v instanceof phet.sun.Dialog,
  supertype: NodeIO,

  // Since many Dialogs are dynamic elements, these need to be in the state. The value of the state object doesn't
  // matter, but it instead just serves as a marker to tell the state engine to recreate the Dialog (if dynamic) when
  // setting state.
  toStateObject: dialog => dialog.tandem.phetioID
} );

sun.register( 'DialogIO', DialogIO );
export default DialogIO;