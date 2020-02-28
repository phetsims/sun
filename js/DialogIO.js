// Copyright 2018-2020, University of Colorado Boulder

/**
 * IO type for Dialog
 * Used to live at '/joist/js/DialogIO'. Moved to '/sun/js/DialogIO' on 4/10/2018
 *
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import NodeIO from '../../scenery/js/nodes/NodeIO.js';
import ObjectIO from '../../tandem/js/types/ObjectIO.js';
import sun from './sun.js';

class DialogIO extends NodeIO {}

DialogIO.documentation = 'A dialog panel';
DialogIO.validator = { isValidValue: v => v instanceof phet.sun.Dialog };
DialogIO.typeName = 'DialogIO';
ObjectIO.validateSubtype( DialogIO );

sun.register( 'DialogIO', DialogIO );
export default DialogIO;