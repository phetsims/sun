// Copyright 2014-2015, University of Colorado Boulder

/**
 * A circular toggle button that switches the value of a boolean property.  It sticks in the down position when pressed,
 * popping back up when pressed again.
 *
 * This class inherits from the more general RoundStickyToggleButton, which can take any values.
 *
 * @author John Blanco
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RoundStickyToggleButton = require( 'SUN/buttons/RoundStickyToggleButton' );

  /**
   * @param {Property.<boolean>} booleanProperty
   * @param {object} options
   * @constructor
   */
  function BooleanRoundStickyToggleButton( booleanProperty, options ) {
    RoundStickyToggleButton.call( this, false, true, booleanProperty, options );
  }

  return inherit( RoundStickyToggleButton, BooleanRoundStickyToggleButton );
} );
