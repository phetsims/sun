// Copyright 2002-2014, University of Colorado Boulder

/**
 * A rectangular toggle button that switches the value of a property that can take on valueA or valueB.
 *
 * @author John Blanco
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RectangularButtonView = require( 'SUN/buttons/RectangularButtonView' );
  var ToggleButtonInteractionState = require( 'SUN/buttons/ToggleButtonInteractionState' );
  var ToggleButtonModel = require( 'SUN/buttons/ToggleButtonModel' );

  /**
   * @param valueA {Object} one possible value for the toggle
   * @param valueB {Object} the other value for the toggle
   * @param property {Property<Object>} axon property that can be either valueA or valueB.
   * @param {Object} options
   * @constructor
   */
  function RectangularToggleButton( valueA, valueB, property, options ) {
    var buttonModel = new ToggleButtonModel( valueA, valueB, property );
    RectangularButtonView.call( this, buttonModel, new ToggleButtonInteractionState( buttonModel ), options );
  }

  return inherit( RectangularButtonView, RectangularToggleButton );
} );