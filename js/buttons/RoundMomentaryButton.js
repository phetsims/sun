// Copyright 2015, University of Colorado Boulder

/**
 * A round momentary button: on when pressed, off when released. This is the file in which the view (appearance) and
 * model (behavior) are brought together.
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

  /**
   * @param {Object} upValue - value when the button is up
   * @param {Object} downValue - value when the button is down
   * @param {Property} property
   * @param {Object} [options] - see sun.MomentaryButtonModel, sun.RoundButtonView, scenery.Node
   * @constructor
   */
  function RoundMomentaryButton( upValue, downValue, property, options ) {

    var self = this;
    options = _.extend( { tandem: null }, options );
    this.buttonModel = new MomentaryButtonModel( upValue, downValue, property );
    RoundButtonView.call( this, this.buttonModel, new MomentaryButtonInteractionStateProperty( this.buttonModel ), options );

    options.tandem && options.tandem.addInstance( this );

    // @private
    this.disposeRoundMomentaryButton = function() {
      self.buttonModel.dispose();
      options.tandem && options.tandem.removeInstance( this );
    };
  }

  sun.register( 'RoundMomentaryButton', RoundMomentaryButton );

  return inherit( RoundButtonView, RoundMomentaryButton, {

    // @public
    dispose: function() {
      this.disposeRoundMomentaryButton();
    }
  } );
} );