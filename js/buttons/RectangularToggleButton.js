// Copyright 2014-2018, University of Colorado Boulder

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
  function RectangularToggleButton( valueOff, valueOn, property, options ) {

    options = _.extend( {
      tandem: Tandem.required,
      phetioType: ToggleButtonIO
    }, options );

    // @public (phet-io)
    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    this.toggleButtonModel = new ToggleButtonModel( valueOff, valueOn, property, options );
    var toggleButtonInteractionStateProperty = new ToggleButtonInteractionStateProperty( this.toggleButtonModel );
    RectangularButtonView.call( this, this.toggleButtonModel, toggleButtonInteractionStateProperty, options );

    // @private
    this.disposeRectangularToggleButton = function() {
      toggleButtonInteractionStateProperty.dispose();
    };
  }

  sun.register( 'RectangularToggleButton', RectangularToggleButton );

  return inherit( RectangularButtonView, RectangularToggleButton, {

    /**
     * @public
     */
    dispose: function() {
      this.disposeRectangularToggleButton();
      RectangularButtonView.prototype.dispose && RectangularButtonView.prototype.dispose.call( this );
    }
  } );
} );