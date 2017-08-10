// Copyright 2014-2015, University of Colorado Boulder

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
  function RoundToggleButton( valueOff, valueOn, property, options ) {

    var self = this;

    // Tandem support
    options = _.extend( {
      tandem: Tandem.tandemRequired(),
      phetioType: TToggleButton,

      // a11y
      tagName: 'input',
      inputType: 'button'
    }, options );

    // @public, (read-only) (phet-io)
    this.toggleButtonModel = new ToggleButtonModel( valueOff, valueOn, property );
    this.phetioValueType = property.phetioValueType;

    RoundButtonView.call( this, this.toggleButtonModel, new ToggleButtonInteractionStateProperty( this.toggleButtonModel ), options );

    // @private (a11y) - toggle the button when we receive the accessible click event
    this.accessibleClickListener = this.addAccessibleInputListener( {
      click: function ( event ) {
        self.toggleButtonModel.toggle();
      }
    } );
  }

  sun.register( 'RoundToggleButton', RoundToggleButton );

  return inherit( RoundButtonView, RoundToggleButton, {

    // @public
    dispose: function() {
      this.removeAccessibleInputListener( this.accessibleClickListener );
      this.toggleButtonModel.dispose(); //TODO this fails with assertions enabled, see sun#212
      RoundButtonView.prototype.dispose.call( this );
    }
  } );
} );