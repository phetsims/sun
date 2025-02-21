// Copyright 2022-2025, University of Colorado Boulder

/**
 * Demo for ToggleSwitch
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import StringProperty from '../../../../axon/js/StringProperty.js';
import type Bounds2 from '../../../../dot/js/Bounds2.js';
import type Node from '../../../../scenery/js/nodes/Node.js';
import ToggleSwitch from '../../ToggleSwitch.js';

export default function demoToggleSwitch( layoutBounds: Bounds2 ): Node {
  return new ToggleSwitch( new StringProperty( 'left' ), 'left', 'right', {
    center: layoutBounds.center
  } );
}