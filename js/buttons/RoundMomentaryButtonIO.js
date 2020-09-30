// Copyright 2017-2020, University of Colorado Boulder

/**
 * IO Type for RoundMomentaryButton
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import Node from '../../../scenery/js/nodes/Node.js';
import IOType from '../../../tandem/js/types/IOType.js';
import sun from '../sun.js';

const RoundMomentaryButtonIO = new IOType( 'RoundMomentaryButtonIO', {
  isValidValue: v => v instanceof phet.sun.RoundMomentaryButton,
  supertype: Node.NodeIO,
  documentation: 'Button that performs an action while it is being pressed, and stops the action when released',
  events: [ 'pressed', 'released', 'releasedDisabled' ]
} );

sun.register( 'RoundMomentaryButtonIO', RoundMomentaryButtonIO );
export default RoundMomentaryButtonIO;