// Copyright 2015, University of Colorado Boulder

/**
 * A rectangular momentary button: on when pressed, off when released.
 * This is the file in which the view (appearance) and model (behavior) are brought together.
 *
 * @author Chris Malley
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var MomentaryButtonInteractionStateProperty = require( 'SUN/buttons/MomentaryButtonInteractionStateProperty' );
  var MomentaryButtonModel = require( 'SUN/buttons/MomentaryButtonModel' );
  var RectangularButtonView = require( 'SUN/buttons/RectangularButtonView' );
  var sun = require( 'SUN/sun' );

  /**
   * @param {Object} upValue - value when the button is up
   * @param {Object} downValue - value when the button is down
   * @param {Property} property
   * @param {Object} [options] - see sun.MomentaryButtonModel, sun.RoundButtonView, scenery.Node
   * @constructor
   */
  function RectangularMomentaryButton( upValue, downValue, property, options ) {
    var buttonModel = new MomentaryButtonModel( upValue, downValue, property );
    RectangularButtonView.call( this, buttonModel, new MomentaryButtonInteractionStateProperty( buttonModel ), options );
  }

  sun.register( 'RectangularMomentaryButton', RectangularMomentaryButton );

  return inherit( RectangularButtonView, RectangularMomentaryButton );
} );