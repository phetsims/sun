// Copyright 2017-2020, University of Colorado Boulder

/**
 * IO Type for RectangularToggleButton|RoundStickyToggleButton|RoundToggleButton
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import Node from '../../../scenery/js/nodes/Node.js';
import IOType from '../../../tandem/js/types/IOType.js';
import sun from '../sun.js';

const ToggleButtonIO = new IOType( 'ToggleButtonIO', {
  isValidValue: instance => {
    const types = [ phet.sun.RectangularToggleButton, phet.sun.RoundStickyToggleButton, phet.sun.RoundToggleButton ];
    const definedTypes = types.filter( v => !!v );
    const matches = definedTypes.filter( v => instance instanceof v );
    return matches.length > 0;
  },
  supertype: Node.NodeIO,
  documentation: 'A button that toggles state (in/out) when pressed',
  events: [ 'toggled' ]
} );

sun.register( 'ToggleButtonIO', ToggleButtonIO );
export default ToggleButtonIO;