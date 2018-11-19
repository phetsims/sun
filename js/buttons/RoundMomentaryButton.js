// Copyright 2015-2018, University of Colorado Boulder

/**
 * A round momentary button: on when pressed, off when released.
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
  var RoundButtonView = require( 'SUN/buttons/RoundButtonView' );
  var RoundMomentaryButtonIO = require( 'SUN/buttons/RoundMomentaryButtonIO' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );

  /**
   * @param {Object} valueOff - value when the button is in the off state
   * @param {Object} valueOn - value when the button is in the on state
   * @param {Property} property
   * @param {Object} [options]
   * @constructor
   */
  function RoundMomentaryButton( valueOff, valueOn, property, options ) {
    options = _.extend( {
      tandem: Tandem.required,
      phetioType: RoundMomentaryButtonIO
    }, options );

    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    this.buttonModel = new MomentaryButtonModel( valueOff, valueOn, property, options );
    RoundButtonView.call( this, this.buttonModel, new MomentaryButtonInteractionStateProperty( this.buttonModel ), options );
  }

  sun.register( 'RoundMomentaryButton', RoundMomentaryButton );

  return inherit( RoundButtonView, RoundMomentaryButton, {

    // @public
    dispose: function() {
      this.buttonModel.dispose(); //TODO fails with assertions enable, see sun#212
      RoundButtonView.prototype.dispose.call( this );
    }
  } );
} );