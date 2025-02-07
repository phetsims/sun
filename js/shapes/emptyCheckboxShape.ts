// Copyright 2025, University of Colorado Boulder

/**
 * Empty Checkbox Shape
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Amanda McGarry (PhET Interactive Simulations)
 */

import Shape from '../../../kite/js/Shape.js';
import LineStyles from '../../../kite/js/util/LineStyles.js';

export default Shape.roundRectangle( 1, 1, 25, 25, 4.99, 4.99 ).getStrokedShape( new LineStyles( {
  lineWidth: 2
} ) );