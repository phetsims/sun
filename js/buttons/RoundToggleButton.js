// Copyright 2002-2014, University of Colorado Boulder

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
  var ToggleButtonInteractionState = require( 'SUN/buttons/ToggleButtonInteractionState' );
  var ToggleButtonModel = require( 'SUN/buttons/ToggleButtonModel' );

  /**
   * @param {Object} valueA one possible value for the toggle
   * @param {Object} valueB the other value for the toggle
   * @param {Property} property axon property that can be either valueA or valueB.
   * @param {Object} [options]
   * @constructor
   */
  function RoundToggleButton( valueA, valueB, property, options ) {
    options = _.extend( {
      togetherID: null
    }, options );
    var buttonModel = new ToggleButtonModel( valueA, valueB, property, { togetherID: options.togetherID } );
    RoundButtonView.call( this, buttonModel, new ToggleButtonInteractionState( buttonModel ), options );
  }

  return inherit( RoundButtonView, RoundToggleButton );
} );