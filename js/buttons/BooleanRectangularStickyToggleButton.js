// Copyright 2002-2014, University of Colorado Boulder

/**
 * A rectangular toggle button that switches the value of a boolean property.  It
 * sticks in the down position when pressed, popping back up when pressed
 * again.
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
  var RectangularStickyToggleButton = require( 'SUN/buttons/RectangularStickyToggleButton' );

  function BooleanRectangularStickyToggleButton( booleanProperty, options ) {
    RectangularStickyToggleButton.call( this, false, true, booleanProperty, options );
  }

  return inherit( RectangularStickyToggleButton, BooleanRectangularStickyToggleButton );
} );