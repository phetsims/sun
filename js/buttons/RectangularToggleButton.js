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
  var ToggleButtonInteractionStateProperty = require( 'SUN/buttons/ToggleButtonInteractionStateProperty' );
  var ToggleButtonModel = require( 'SUN/buttons/ToggleButtonModel' );

  /**
   * @param {Object} valueA one possible value for the toggle
   * @param {Object} valueB the other value for the toggle
   * @param {Property} property axon property that can be either valueA or valueB.
   * @param {Object} [options]
   * @constructor
   */
  function RectangularToggleButton( valueA, valueB, property, options ) {

    //@public, so it can be listened to by together
    this.toggleButtonModel = new ToggleButtonModel( valueA, valueB, property, options );
    RectangularButtonView.call( this, this.toggleButtonModel, new ToggleButtonInteractionStateProperty( this.toggleButtonModel ), options );
  }

  return inherit( RectangularButtonView, RectangularToggleButton );
} );