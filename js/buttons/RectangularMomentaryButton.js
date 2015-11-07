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

  /**
   * @param {Property.<boolean>} onProperty - whether the button is on or off
   * @param {Object} [options] - see sun.MomentaryButtonModel, sun.RectangularButtonView, scenery.Node
   * @constructor
   */
  function RectangularMomentaryButton( onProperty, options ) {
    var buttonModel = new MomentaryButtonModel( onProperty );
    RectangularButtonView.call( this, buttonModel, new MomentaryButtonInteractionStateProperty( buttonModel ), options );
  }

  return inherit( RectangularButtonView, RectangularMomentaryButton );
} );