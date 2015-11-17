// Copyright 2014-2015, University of Colorado Boulder

/**
 * A round toggle button that switches the value of a property that can take on valueA or valueB.
 *
 * @author John Blanco
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RoundButtonView = require( 'SUN/buttons/RoundButtonView' );
  var ToggleButtonInteractionStateProperty = require( 'SUN/buttons/ToggleButtonInteractionStateProperty' );
  var ToggleButtonModel = require( 'SUN/buttons/ToggleButtonModel' );

  /**
   * @param {Object} valueA one possible value for the toggle
   * @param {Object} valueB the other value for the toggle
   * @param {Property} property axon property that can be either valueA or valueB.
   * @param {Object} [options]
   * @constructor
   */
  function RoundToggleButton( valueA, valueB, property, options ) {

    var thisRoundToggleButton = this;

    // Tandem support
    options = _.extend( { tandem: null }, options );

    this.toggleButtonModel = new ToggleButtonModel( valueA, valueB, property ); // @public, listen only
    RoundButtonView.call( this, this.toggleButtonModel, new ToggleButtonInteractionStateProperty( this.toggleButtonModel ), options );

    // Tandem support
    options.tandem && options.tandem.addInstance( this );

    // @private - disposal for listener above
    this.disposeRoundToggleButton = function() {
      options.tandem && options.tandem.removeInstance( this );
      thisRoundToggleButton.toggleButtonModel.dispose();
    };
  }

  return inherit( RoundButtonView, RoundToggleButton, {

    // @public
    dispose: function() {
      this.disposeRoundToggleButton();
    }
  } );
} );