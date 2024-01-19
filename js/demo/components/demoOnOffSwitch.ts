// Copyright 2022-2024, University of Colorado Boulder

/**
 * Demo for OnOffSwitch
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import OnOffSwitch from '../../OnOffSwitch.js';
import { Node } from '../../../../scenery/js/imports.js';

export default function demoOnOffSwitch( layoutBounds: Bounds2 ): Node {
  return new OnOffSwitch( new BooleanProperty( true ), {
    center: layoutBounds.center
  } );
}