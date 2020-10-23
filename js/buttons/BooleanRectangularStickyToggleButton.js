// Copyright 2014-2020, University of Colorado Boulder

/**
 * A rectangular toggle button that switches the value of a boolean Property.  It sticks in the down position when
 * pressed, popping back up when pressed again.
 *
 * This class inherits from the more general RectangularStickyToggleButton, which can take any values.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import sun from '../sun.js';
import RectangularStickyToggleButton from './RectangularStickyToggleButton.js';

class BooleanRectangularStickyToggleButton extends RectangularStickyToggleButton {

  /**
   * @param {Property.<boolean>} booleanProperty
   * @param {Object} [options]
   * @constructor
   */
  constructor( booleanProperty, options ) {
    super( false, true, booleanProperty, options );
  }
}

sun.register( 'BooleanRectangularStickyToggleButton', BooleanRectangularStickyToggleButton );
export default BooleanRectangularStickyToggleButton;