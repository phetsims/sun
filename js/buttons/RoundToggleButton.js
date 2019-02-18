// Copyright 2014-2019, University of Colorado Boulder

/**
 * A round toggle button that switches the value of a property between 2 values.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RoundButtonView = require( 'SUN/buttons/RoundButtonView' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );
  var ToggleButtonInteractionStateProperty = require( 'SUN/buttons/ToggleButtonInteractionStateProperty' );
  var ToggleButtonIO = require( 'SUN/buttons/ToggleButtonIO' );
  var ToggleButtonModel = require( 'SUN/buttons/ToggleButtonModel' );

  /**
   * @param {Object} valueOff - value when the button is in the off state
   * @param {Object} valueOn - value when the button is in the on state
   * @param {Property} property - axon Property that can be either valueOff or valueOn
   * @param {Object} [options]
   * @constructor
   */
  function RoundToggleButton( valueOff, valueOn, property, options ) {

    // Tandem support
    options = _.extend( {
      tandem: Tandem.required,
      phetioType: ToggleButtonIO
    }, options );

    // @private (read-only)
    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    this.toggleButtonModel = new ToggleButtonModel( valueOff, valueOn, property, options );
    var toggleButtonInteractionStateProperty = new ToggleButtonInteractionStateProperty( this.toggleButtonModel );

    RoundButtonView.call( this, this.toggleButtonModel, toggleButtonInteractionStateProperty, options );

    // @private
    this.disposeRoundToggleButton = function() {
      this.toggleButtonModel.dispose();
      toggleButtonInteractionStateProperty.dispose();
    };
  }

  sun.register( 'RoundToggleButton', RoundToggleButton );

  return inherit( RoundButtonView, RoundToggleButton, {

    // @public
    dispose: function() {
      this.disposeRoundToggleButton();
      RoundButtonView.prototype.dispose.call( this );
    }
  } );
} );