// Copyright 2022, University of Colorado Boulder

/**
 * Demo for ToggleSwitch
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import ToggleSwitch from '../../ToggleSwitch.js';
import { Node } from '../../../../scenery/js/imports.js';
import StringProperty from '../../../../axon/js/StringProperty.js';

export default function demoToggleSwitch( layoutBounds: Bounds2 ): Node {
  return new ToggleSwitch( new StringProperty( 'left' ), 'left', 'right', {
    center: layoutBounds.center
  } );
}