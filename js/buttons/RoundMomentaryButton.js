// Copyright 2002-2015, University of Colorado Boulder

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

  /**
   * @param {Property.<boolean>} onProperty - whether the button is on or off
   * @param {Object} [options] - see sun.MomentaryButtonModel, sun.RoundButtonView, scenery.Node
   * @constructor
   */
  function RoundMomentaryButton( onProperty, options ) {

    var self = this;
    options = _.extend( { tandem: null }, options );
    this.buttonModel = new MomentaryButtonModel( onProperty );
    RoundButtonView.call( this, this.buttonModel, new MomentaryButtonInteractionStateProperty( this.buttonModel ), options );

    options.tandem && options.tandem.addInstance( this );

    // @private
    this.disposeRoundMomentaryButton = function() {
      self.buttonModel.dispose();
      options.tandem && options.tandem.removeInstance( this );
    };
  }

  return inherit( RoundButtonView, RoundMomentaryButton, {
    dispose: function() {
      this.disposeRoundMomentaryButton();
    }
  } );
} );