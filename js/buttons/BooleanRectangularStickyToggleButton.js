// Copyright 2014-2017, University of Colorado Boulder

/**
 * A rectangular toggle button that switches the value of a boolean property.  It sticks in the down position when
 * pressed, popping back up when pressed again.
 *
 * This class inherits from the more general RectangularStickyToggleButton, which can take any values.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RectangularStickyToggleButton = require( 'SUN/buttons/RectangularStickyToggleButton' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );

  /**
   * @param {Property.<boolean>} booleanProperty
   * @param {Object} [options]
   * @constructor
   */
  function BooleanRectangularStickyToggleButton( booleanProperty, options ) {
    Tandem.indicateUninstrumentedCode();

    RectangularStickyToggleButton.call( this, false, true, booleanProperty, options );
  }

  sun.register( 'BooleanRectangularStickyToggleButton', BooleanRectangularStickyToggleButton );

  return inherit( RectangularStickyToggleButton, BooleanRectangularStickyToggleButton );
} );