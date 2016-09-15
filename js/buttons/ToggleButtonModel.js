// Copyright 2014-2015, University of Colorado Boulder

/**
 * Model for a toggle button that changes value on each "up" event when the button is released.
 *
 * @author Sam Reid
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonModel = require( 'SUN/buttons/ButtonModel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var sun = require( 'SUN/sun' );

  /**
   * @param {Object} valueOff - value when the button is in the off state
   * @param {Object} valueOn - value when the button is in the on state
   * @param {Property} valueProperty - axon Property that can be either valueOff or valueOn.
   *        (Would have preferred to call this `property` but it would clash with PropertySet.property function.)
   * @constructor
   */
  function ToggleButtonModel( valueOff, valueOn, valueProperty ) {

    var self = this;

    // @private
    this.valueOff = valueOff;
    this.valueOn = valueOn;
    this.valueProperty = valueProperty;

    ButtonModel.call( this );

    // Behaves like a push button (with fireOnDown:false), but toggles its state when the button is released.
    var downListener = function( down ) {
      if ( self.enabled && self.over ) {
        if ( !down ) {
          self.toggle();
        }
      }
    };
    this.property( 'down' ).link( downListener ); // @private

    // @private - dispose items specific to this instance
    this.disposeToggleButtonModel = function() {
      self.property( 'down' ).unlink( downListener );
    };
  }

  sun.register( 'ToggleButtonModel', ToggleButtonModel );

  return inherit( ButtonModel, ToggleButtonModel, {

    // @public
    dispose: function() {
      ButtonModel.prototype.dispose.call( this );
      this.disposeToggleButtonModel();
    },

    // @public
    toggle: function() {
      assert && assert( this.valueProperty.value === this.valueOff || this.valueProperty.value === this.valueOn );
      var oldValue = this.valueProperty.value;
      var newValue = this.valueProperty.value === this.valueOff ? this.valueOn : this.valueOff;
      this.trigger2( 'startedCallbacksForToggled', oldValue, newValue );
      this.valueProperty.value = newValue;
      this.trigger0( 'endedCallbacksForToggled' );
    }
  } );
} );