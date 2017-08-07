// Copyright 2014-2015, University of Colorado Boulder

/**
 * Model for a RadioButtonGroupMember in RadioButtonGroup. This model is designed to be used inside
 * RadioButtonGroupMember only, so there should be no need to use it outside of RadioButtonGroupMember.
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonModel = require( 'SUN/buttons/ButtonModel' );
  var Emitter = require( 'AXON/Emitter' );
  var inherit = require( 'PHET_CORE/inherit' );
  var sun = require( 'SUN/sun' );

  /**
   * @param {Property} selectorProperty - the property for the RadioButtonGroup that determines which button is selected
   * @param {Object} selectedValue - the value that selectorProperty takes when this particular SingleRadioButton is selected
   * @constructor
   */
  function RadioButtonGroupMemberModel( selectorProperty, selectedValue ) {

    ButtonModel.call( this );

    var self = this;

    this.selectedValue = selectedValue;
    this.selectorProperty = selectorProperty;
    this.startedCallbacksForFiredEmitter = new Emitter( { indicateCallbacks: false } );
    this.endedCallbacksForFiredEmitter = new Emitter( { indicateCallbacks: false } );

    // @public (read only) - fire on up if the button is enabled, public for use in the accessibility tree
    this.fire = function() {
      if ( self.enabledProperty.get() ) {
        self.startedCallbacksForFiredEmitter.emit1( selectedValue );
        selectorProperty.set( selectedValue );
        self.endedCallbacksForFiredEmitter.emit();
      }
    };
    this.downProperty.onValue( false, function() {
      if ( self.overProperty.get() ) {
        self.fire();
      }
    } );
  }

  sun.register( 'RadioButtonGroupMemberModel', RadioButtonGroupMemberModel );

  return inherit( ButtonModel, RadioButtonGroupMemberModel );
} );