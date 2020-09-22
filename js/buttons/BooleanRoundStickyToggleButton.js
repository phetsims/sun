// Copyright 2014-2020, University of Colorado Boulder

/**
 * A round toggle button that toggles the value of a boolean Property.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import sun from '../sun.js';
import RoundStickyToggleButton from './RoundStickyToggleButton.js';

class BooleanRoundStickyToggleButton extends RoundStickyToggleButton {

  /**
   * @param {Property.<boolean>} booleanProperty
   * @param {Object} [options]
   */
  constructor( booleanProperty, options ) {
    super( false, true, booleanProperty, options );
  }
}

sun.register( 'BooleanRoundStickyToggleButton', BooleanRoundStickyToggleButton );
export default BooleanRoundStickyToggleButton;