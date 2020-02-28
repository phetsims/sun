// Copyright 2014-2020, University of Colorado Boulder

/**
 * A circular toggle button that switches the value of a boolean property.  It sticks in the down position when pressed,
 * popping back up when pressed again.
 *
 * This class inherits from the more general RoundStickyToggleButton, which can take any values.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import inherit from '../../../phet-core/js/inherit.js';
import sun from '../sun.js';
import RoundStickyToggleButton from './RoundStickyToggleButton.js';

/**
 * @param {Property.<boolean>} booleanProperty
 * @param {Object} [options]
 * @constructor
 */
function BooleanRoundStickyToggleButton( booleanProperty, options ) {
  RoundStickyToggleButton.call( this, false, true, booleanProperty, options );
}

sun.register( 'BooleanRoundStickyToggleButton', BooleanRoundStickyToggleButton );

inherit( RoundStickyToggleButton, BooleanRoundStickyToggleButton );
export default BooleanRoundStickyToggleButton;