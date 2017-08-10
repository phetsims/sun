// Copyright 2014-2015, University of Colorado Boulder

/**
 * A rectangular toggle button that switches the value of a property between 2 values.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RectangularButtonView = require( 'SUN/buttons/RectangularButtonView' );
  var sun = require( 'SUN/sun' );
  var ToggleButtonInteractionStateProperty = require( 'SUN/buttons/ToggleButtonInteractionStateProperty' );
  var ToggleButtonModel = require( 'SUN/buttons/ToggleButtonModel' );
  var Tandem = require( 'TANDEM/Tandem' );
  var TToggleButton = require( 'SUN/buttons/TToggleButton' );

  /**
   * @param {Object} valueOff - value when the button is in the off state
   * @param {Object} valueOn - value when the button is in the on state
   * @param {Property} property - axon Property that can be either valueOff or valueOn
   * @param {Object} [options]
   * @constructor
   */
  function RectangularToggleButton( valueOff, valueOn, property, options ) {

    options = _.extend( {
      tandem: Tandem.tandemRequired(),
      phetioType: TToggleButton
    }, options );


    // @public (phet-io)
    this.toggleButtonModel = new ToggleButtonModel( valueOff, valueOn, property, options );
    this.phetioValueType = property.phetioValueType;
    RectangularButtonView.call( this, this.toggleButtonModel, new ToggleButtonInteractionStateProperty( this.toggleButtonModel ), options );
  }

  sun.register( 'RectangularToggleButton', RectangularToggleButton );

  return inherit( RectangularButtonView, RectangularToggleButton );
} );