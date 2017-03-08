// Copyright 2015, University of Colorado Boulder

/**
 * A rectangular momentary button: on when pressed, off when released.
 * This is the file in which the view (appearance) and model (behavior) are brought together.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var MomentaryButtonInteractionStateProperty = require( 'SUN/buttons/MomentaryButtonInteractionStateProperty' );
  var MomentaryButtonModel = require( 'SUN/buttons/MomentaryButtonModel' );
  var RectangularButtonView = require( 'SUN/buttons/RectangularButtonView' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );

  /**
   * @param {Object} valueOff - value when the button is in the off state
   * @param {Object} valueOn - value when the button is in the on state
   * @param {Property} property
   * @param {Object} [options]
   * @constructor
   */
  function RectangularMomentaryButton( valueOff, valueOn, property, options ) {
    Tandem.indicateUninstrumentedCode();

    var buttonModel = new MomentaryButtonModel( valueOff, valueOn, property );
    RectangularButtonView.call( this, buttonModel, new MomentaryButtonInteractionStateProperty( buttonModel ), options );
  }

  sun.register( 'RectangularMomentaryButton', RectangularMomentaryButton );

  return inherit( RectangularButtonView, RectangularMomentaryButton );
} );