// Copyright 2017-2020, University of Colorado Boulder

/**
 * IO type for RectangularToggleButton|RoundStickyToggleButton|RoundToggleButton
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import NodeIO from '../../../scenery/js/nodes/NodeIO.js';
import ObjectIO from '../../../tandem/js/types/ObjectIO.js';
import sun from '../sun.js';

class ToggleButtonIO extends NodeIO {}

ToggleButtonIO.documentation = 'A button that toggles state (in/out) when pressed';
ToggleButtonIO.events = [ 'toggled' ];

ToggleButtonIO.validator = {
  isValidValue: instance => {
    const types = [ phet.sun.RectangularToggleButton, phet.sun.RoundStickyToggleButton, phet.sun.RoundToggleButton ];
    const definedTypes = types.filter( v => !!v );
    const matches = definedTypes.filter( v => instance instanceof v );
    return matches.length > 0;
  }
};
ToggleButtonIO.typeName = 'ToggleButtonIO';
ObjectIO.validateSubtype( ToggleButtonIO );

sun.register( 'ToggleButtonIO', ToggleButtonIO );
export default ToggleButtonIO;