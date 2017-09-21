// Copyright 2014-2017, University of Colorado Boulder

/**
 * A circular toggle button that switches the value of a boolean property.  It sticks in the down position when pressed,
 * popping back up when pressed again.
 *
 * This class inherits from the more general RoundStickyToggleButton, which can take any values.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RoundStickyToggleButton = require( 'SUN/buttons/RoundStickyToggleButton' );
  var sun = require( 'SUN/sun' );

  /**
   * @param {Property.<boolean>} booleanProperty
   * @param {Object} [options]
   * @constructor
   */
  function BooleanRoundStickyToggleButton( booleanProperty, options ) {
    RoundStickyToggleButton.call( this, false, true, booleanProperty, options );
  }

  sun.register( 'BooleanRoundStickyToggleButton', BooleanRoundStickyToggleButton );

  return inherit( RoundStickyToggleButton, BooleanRoundStickyToggleButton );
} );
