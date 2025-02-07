// Copyright 2025, University of Colorado Boulder

/**
 * Filled Checkbox Shape
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Amanda McGarry (PhET Interactive Simulations)
 */

import Shape from '../../../kite/js/Shape.js';
import LineStyles from '../../../kite/js/util/LineStyles.js';

const borderShapeString = 'M26,14.68v6.33c0,2.76-2.23,4.99-4.99,4.99H5.99c-2.76,0-4.99-2.23-4.99-4.99V5.99C1,3.23,3.23,1,5.99,1h15.02';
const checkShapeString = 'M13.42,21.27l-7.42-7.42c-.68-.68-.68-1.78,0-2.46l1.71-1.71c.68-.68,1.78-.68,2.46,0l4.48,4.48L28.29.51c.68-.68,1.78-.68,2.46,0l1.71,1.71c.68.68.68,1.78,0,2.46L15.88,21.27c-.68.68-1.78.68-2.46,0Z';

const strokedBorderShape = new Shape( borderShapeString ).getStrokedShape( new LineStyles( {
  lineWidth: 2,
  lineCap: 'round'
} ) );

const checkShape = new Shape( checkShapeString );

export default new Shape( [
  ...strokedBorderShape.subpaths,
  ...checkShape.subpaths
] );