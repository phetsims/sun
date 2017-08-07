// Copyright 2014-2015, University of Colorado Boulder

/**
 * Model for a toggle button that changes value on each "up" event when the button is released.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonModel = require( 'SUN/buttons/ButtonModel' );
  var Emitter = require( 'AXON/Emitter' );
  var inherit = require( 'PHET_CORE/inherit' );
  var sun = require( 'SUN/sun' );

  /**
   * @param {Object} valueOff - value when the button is in the off state
   * @param {Object} valueOn - value when the button is in the on state
   * @param {Property} property - axon Property that can be either valueOff or valueOn.
   * @constructor
   */
  function ToggleButtonModel( valueOff, valueOn, property ) {

    var self = this;

    // @private
    this.valueOff = valueOff;
    this.valueOn = valueOn;
    this.valueProperty = property;

    ButtonModel.call( this );

    // phet-io support
    this.startedCallbacksForToggledEmitter = new Emitter( { indicateCallbacks: false } );
    this.endedCallbacksForToggledEmitter = new Emitter( { indicateCallbacks: false } );

    // Behaves like a push button (with fireOnDown:false), but toggles its state when the button is released.
    var downListener = function( down ) {
      if ( self.enabledProperty.get() && self.overProperty.get() ) {
        if ( !down ) {
          self.toggle();
        }
      }
    };
    this.downProperty.link( downListener ); // @private

    // @private - dispose items specific to this instance
    this.disposeToggleButtonModel = function() {
      self.downProperty.unlink( downListener );
    };
  }

  sun.register( 'ToggleButtonModel', ToggleButtonModel );

  return inherit( ButtonModel, ToggleButtonModel, {

    // @public
    dispose: function() {
      this.disposeToggleButtonModel();
      ButtonModel.prototype.dispose.call( this );
    },

    // @public
    toggle: function() {
      assert && assert( this.valueProperty.value === this.valueOff || this.valueProperty.value === this.valueOn );
      var oldValue = this.valueProperty.value;
      var newValue = this.valueProperty.value === this.valueOff ? this.valueOn : this.valueOff;
      this.startedCallbacksForToggledEmitter.emit2( oldValue, newValue );
      this.valueProperty.value = newValue;
      this.endedCallbacksForToggledEmitter.emit();
    }
  } );
} );