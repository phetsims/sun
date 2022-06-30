// Copyright 2022, University of Colorado Boulder

/**
 * Demo for ABSwitch.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import StringProperty from '../../../../axon/js/StringProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import { Font, Node, Text } from '../../../../scenery/js/imports.js';
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