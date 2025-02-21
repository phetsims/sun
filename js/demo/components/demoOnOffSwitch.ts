// Copyright 2022-2025, University of Colorado Boulder

/**
 * Demo for OnOffSwitch
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import type Bounds2 from '../../../../dot/js/Bounds2.js';
import type Node from '../../../../scenery/js/nodes/Node.js';
import OnOffSwitch from '../../OnOffSwitch.js';

export default function demoOnOffSwitch( layoutBounds: Bounds2 ): Node {
  return new OnOffSwitch( new BooleanProperty( true ), {
    center: layoutBounds.center
  } );
}