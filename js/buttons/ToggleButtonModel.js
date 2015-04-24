// Copyright 2002-2014, University of Colorado Boulder

/**
 * Model for a toggle button that changes value on each "up" event when the button is released.
 *
 * @author Sam Reid
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ButtonModel = require( 'SUN/buttons/ButtonModel' );

  /**
   * @param {Object} valueA one possible value for the toggle
   * @param {Object} valueB the other value for the toggle
   * @param {Property} valueProperty axon property that can be either valueA or valueB.
   *        (Would have preferred to call this `property` but it would clash with the property function name.)
   * @constructor
   */
  function ToggleButtonModel( valueA, valueB, valueProperty ) {

    var thisModel = this;

    this.valueA = valueA;
    this.valueB = valueB;
    this.valueProperty = valueProperty;

    ButtonModel.call( this );

    // Behaves like a push button (with fireOnDown:false), but toggles its state when the button is released.
    var downListener = function( down ) {
      if ( thisModel.enabled && thisModel.over ) {
        if ( !down ) {
          thisModel.toggle();
        }
      }
    };
    this.property( 'down' ).link( downListener );

    // Dispose items specific to this instance
    this.disposeToggleButtonModel = function() {
      thisModel.property( 'down' ).unlink( downListener );
    };
  }

  return inherit( ButtonModel, ToggleButtonModel, {
    dispose: function() {
      ButtonModel.prototype.dispose.call( this );
      this.disposeToggleButtonModel();
    },
    toggle: function() {
      assert && assert( this.valueProperty.value === this.valueA || this.valueProperty.value === this.valueB );
      var oldValue = this.valueProperty.value;
      var newValue = this.valueProperty.value === this.valueA ? this.valueB : this.valueA;
      this.trigger2( 'startedCallbacksForToggled', oldValue, newValue );
      this.valueProperty.value = newValue;
      this.trigger2( 'endedCallbacksForToggled', oldValue, newValue );
    }
  } );
} );