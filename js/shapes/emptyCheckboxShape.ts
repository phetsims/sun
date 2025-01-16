// Copyright 2025, University of Colorado Boulder

/**
 * Empty Checkbox Shape
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Amanda McGarry (PhET Interactive Simulations)
 */

import { LineStyles, Shape } from '../../../kite/js/imports.js';

export default Shape.roundRectangle( 1, 1, 25, 25, 4.99, 4.99 ).getStrokedShape( new LineStyles( {
  lineWidth: 2
} ) );