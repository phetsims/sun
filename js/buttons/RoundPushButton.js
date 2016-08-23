// Copyright 2014-2015, University of Colorado Boulder

/**
 * An interactive round push button.  This is the file in which the appearance and behavior are brought together.
 *
 * This class inherits from RoundButtonView, which contains all of the
 * code that defines the button's appearance, and adds the button's behavior
 * by hooking up a button model.
 *
 * @author John Blanco
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PushButtonInteractionStateProperty = require( 'SUN/buttons/PushButtonInteractionStateProperty' );
  var PushButtonModel = require( 'SUN/buttons/PushButtonModel' );
  var RoundButtonView = require( 'SUN/buttons/RoundButtonView' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );

  // phet-io modules
  var TPushButton = require( 'ifphetio!PHET_IO/types/sun/buttons/TPushButton' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function RoundPushButton( options ) {

    options = _.extend( {
      tandem: null // {Tandem|null}
    }, options );
    Tandem.validateOptions( options ); // The tandem is required when brand==='phet-io'

    // Safe to pass through options to the PushButtonModel like "fireOnDown".  Other scenery options will be safely ignored.
    this.buttonModel = new PushButtonModel( options ); // @public, listen only
    RoundButtonView.call( this, this.buttonModel, new PushButtonInteractionStateProperty( this.buttonModel ), options );

    // Tandem support
    // Give it a novel name to reduce the risk of parent or child collisions
    this.roundPushButtonTandem = options.tandem;
    this.roundPushButtonTandem && this.roundPushButtonTandem.addInstance( this, TPushButton );
  }

  sun.register( 'RoundPushButton', RoundPushButton );

  return inherit( RoundButtonView, RoundPushButton, {

    // @public
    dispose: function() {
      this.roundPushButtonTandem && this.roundPushButtonTandem.removeInstance( this );
    },

    // @public
    addListener: function( listener ) {
      this.buttonModel.addListener( listener );
    },

    // @public
    removeListener: function( listener ) {
      this.buttonModel.removeListener( listener );
    }
  } );
} );