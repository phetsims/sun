// Copyright 2017-2020, University of Colorado Boulder

/**
 * IO type for RoundMomentaryButton
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import NodeIO from '../../../scenery/js/nodes/NodeIO.js';
import ObjectIO from '../../../tandem/js/types/ObjectIO.js';
import sun from '../sun.js';

class RoundMomentaryButtonIO extends NodeIO {}

RoundMomentaryButtonIO.documentation = 'Button that performs an action while it is being pressed, and stops the action when released';
RoundMomentaryButtonIO.events = [ 'pressed', 'released', 'releasedDisabled' ];
RoundMomentaryButtonIO.validator = { isValidValue: v => v instanceof phet.sun.RoundMomentaryButton };
RoundMomentaryButtonIO.typeName = 'RoundMomentaryButtonIO';
ObjectIO.validateSubtype( RoundMomentaryButtonIO );

sun.register( 'RoundMomentaryButtonIO', RoundMomentaryButtonIO );
export default RoundMomentaryButtonIO;