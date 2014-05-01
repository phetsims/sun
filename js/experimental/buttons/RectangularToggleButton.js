// Copyright 2002-2014, University of Colorado Boulder

/**
 * A rectangular toggle button that switches the value of a property that can take on valueA or valueB.  It
 * sticks in the down position when pressed, popping back up when pressed
 * again.
 *
 * @author John Blanco
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RectangularButtonView = require( 'SUN/experimental/buttons/RectangularButtonView' );
  var ToggleButtonInteractionState = require( 'SUN/experimental/buttons/ToggleButtonInteractionState' );
  var ToggleButtonModel = require( 'SUN/experimental/buttons/ToggleButtonModel' );

  function RectangularToggleButton( valueA, valueB, property, options ) {
    var buttonModel = new ToggleButtonModel( valueA, valueB, property );
    RectangularButtonView.call( this, buttonModel, new ToggleButtonInteractionState( buttonModel ), options );
  }

  return inherit( RectangularButtonView, RectangularToggleButton );
} );