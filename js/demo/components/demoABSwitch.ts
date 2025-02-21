// Copyright 2022-2025, University of Colorado Boulder

/**
 * Demo for ABSwitch.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import StringProperty from '../../../../axon/js/StringProperty.js';
import type Bounds2 from '../../../../dot/js/Bounds2.js';
import type Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Font from '../../../../scenery/js/util/Font.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ABSwitch from '../../ABSwitch.js';

export default function demoABSwitch( layoutBounds: Bounds2 ): Node {

  const property = new StringProperty( 'A' );

  const labelOptions = { font: new Font( { size: 24 } ) };
  const labelA = new Text( 'A', labelOptions );
  const labelB = new Text( 'B', labelOptions );

  return new ABSwitch( property, 'A', labelA, 'B', labelB, {
    center: layoutBounds.center,
    tandem: Tandem.OPT_OUT
  } );
}