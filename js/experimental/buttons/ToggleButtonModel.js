// Copyright 2002-2014, University of Colorado Boulder

/**
 * Model for a toggle button that changes value on each "up" event.
 *
 * @author Sam Reid
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ButtonModel = require( 'SUN/experimental/buttons/ButtonModel' );

  /**
   *
   * @param valueA {Object} one possible value for the toggle, when the button is in an "up" state
   * @param valueB {Object} other value for the toggle, when the button is in a "down" state
   * @param valueProperty {Property<Object>} axon property that can be either valueA or valueB.  Would have preferred to call this `property` but it would clash with the property function name.
   * @constructor
   */
  function ToggleButtonModel( valueA, valueB, valueProperty ) {
    var thisModel = this;

    this.valueA = valueA;
    this.valueB = valueB;
    this.valueProperty = valueProperty;

    ButtonModel.call( this );

    // If the button is up and the user presses it, show it pressed and
    // toggle the state right away.  When the button is released, pop up the button
    // (unless it was part of the same action that pressed the button
    // down in the first place).
    this.property( 'down' ).link( function( down ) {
      if ( thisModel.enabled && thisModel.over ) {
        if ( !down ) {
          thisModel.toggle();
        }
      }
    } );
  }

  return inherit( ButtonModel, ToggleButtonModel, {
    toggle: function() {
      assert && assert( this.valueProperty.value === this.valueA || this.valueProperty.value === this.valueB );
      if ( this.valueProperty.value === this.valueA ) {
        this.valueProperty.value = this.valueB;
      }
      else {
        this.valueProperty.value = this.valueA;
      }
    }
  } );
} );