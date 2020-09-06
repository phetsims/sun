// Copyright 2018-2020, University of Colorado Boulder

/**
 * IO Type for Dialog
 * Used to live at '/joist/js/DialogIO'. Moved to '/sun/js/DialogIO' on 4/10/2018
 *
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import NodeIO from '../../scenery/js/nodes/NodeIO.js';
import ObjectIO from '../../tandem/js/types/ObjectIO.js';
import sun from './sun.js';

class DialogIO extends NodeIO {

  /**
   * Since many Dialogs are dynamic elements, these need to be in the state. The value of the state object doesn't
   * matter, but it instead just serves as a marker to tell the state engine to recreate the Dialog (if dynamic) when
   * setting state.
   * @override
   * @public
   * @param {Dialog} dialog
   * @returns {string}
   */
  static toStateObject( dialog ) {
    return dialog.tandem.phetioID;
  }
}

DialogIO.documentation = 'A dialog panel';
DialogIO.validator = { isValidValue: v => v instanceof phet.sun.Dialog };
DialogIO.typeName = 'DialogIO';
ObjectIO.validateIOType( DialogIO );

sun.register( 'DialogIO', DialogIO );
export default DialogIO;