// Copyright 2014-2020, University of Colorado Boulder

/**
 * A rectangular toggle button that switches the value of a boolean property.  It sticks in the down position when
 * pressed, popping back up when pressed again.
 *
 * This class inherits from the more general RectangularStickyToggleButton, which can take any values.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import inherit from '../../../phet-core/js/inherit.js';
import sun from '../sun.js';
import RectangularStickyToggleButton from './RectangularStickyToggleButton.js';

/**
 * @param {Property.<boolean>} booleanProperty
 * @param {Object} [options]
 * @constructor
 */
function BooleanRectangularStickyToggleButton( booleanProperty, options ) {
  RectangularStickyToggleButton.call( this, false, true, booleanProperty, options );
}

sun.register( 'BooleanRectangularStickyToggleButton', BooleanRectangularStickyToggleButton );

inherit( RectangularStickyToggleButton, BooleanRectangularStickyToggleButton );
export default BooleanRectangularStickyToggleButton;