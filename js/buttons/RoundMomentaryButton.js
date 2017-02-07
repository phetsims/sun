// Copyright 2015, University of Colorado Boulder

/**
 * A round momentary button: on when pressed, off when released.
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
  var RoundButtonView = require( 'SUN/buttons/RoundButtonView' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );

  // phet-io modules
  var TMomentaryButton = require( 'ifphetio!PHET_IO/types/sun/buttons/TMomentaryButton' );

  /**
   * @param {Object} valueOff - value when the button is in the off state
   * @param {Object} valueOn - value when the button is in the on state
   * @param {Property} property
   * @param {Object} [options]
   * @constructor
   */
  function RoundMomentaryButton( valueOff, valueOn, property, options ) {

    var self = this;
    options = _.extend( { tandem: Tandem.tandemRequired() }, options );

    var tandem = options.tandem;
    options.tandem = options.tandem.createSupertypeTandem();

    this.buttonModel = new MomentaryButtonModel( valueOff, valueOn, property );
    RoundButtonView.call( this, this.buttonModel, new MomentaryButtonInteractionStateProperty( this.buttonModel ), options );

    // @private
    this.disposeRoundMomentaryButton = function() {
      self.buttonModel.dispose(); //TODO fails with assertions enable, see sun#212
      tandem.removeInstance( self );
    };

    tandem.addInstance( this, TMomentaryButton );
  }

  sun.register( 'RoundMomentaryButton', RoundMomentaryButton );

  return inherit( RoundButtonView, RoundMomentaryButton, {

    // @public
    dispose: function() {
      RoundButtonView.prototype.dispose.call( this );
      this.disposeRoundMomentaryButton();
    }
  } );
} );