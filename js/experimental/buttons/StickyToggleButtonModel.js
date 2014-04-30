// Copyright 2002-2014, University of Colorado Boulder

/**
 * Model for a toggle button that sticks when pushed down and pops up when
 * pushed a second time.
 *
 * @author Sam Reid
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ButtonModel = require( 'SUN/experimental/buttons/ButtonModel' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );

  /**
   *
   * @param valueA {Object} one value for the toggle
   * @param valueB {Object} other value for the toggle
   * @param valueProperty {Property<Object>} axon property that can be either valueA or valueB.  Would have preferred to call this `property` but it would clash with the property function name.
   * @constructor
   */
  function StickyToggleButtonModel( valueA, valueB, valueProperty ) {
    var thisModel = this;

    this.valueA = valueA;
    this.valueB = valueB;
    this.valueProperty = valueProperty;

    ButtonModel.call( this );

    // When the user releases the toggle button, it should only fire a
    // toggle event if it is not during the same action in which they
    // pressed the button.  Track the state to see if they have already
    // pushed the button.
    // Note: Does this need to be reset when the simulation does "reset
    // all"?  I (sreid) can't find any negative consequences in the user
    // interface of not resetting it, but maybe I missed something. Or maybe
    // it would be safe to reset it anyway.
    this.addProperty( 'readyToToggleUp', false );

    // Create the "interactionState" which is generally used to determine how to render the button
    this.interactionStateProperty = new DerivedProperty( [this.overProperty, this.downProperty, this.enabledProperty, valueProperty], function( over, down, enabled, propertyValue ) {
      var toggled = propertyValue === valueB;
      return !enabled && toggled ? 'disabled-pressed' :
             !enabled ? 'disabled' :
             over && !(down || toggled) ? 'over' :
             over && (down || toggled) ? 'pressed' :
             toggled ? 'pressed' :
             'idle';
    } );

    // If the button is untoggled and the user presses it, show it pressed and
    // toggle the state right away.  When the button is released, untoggle the
    // state (unless it was part of the same action that toggled the button
    // down in the first place).
    this.property( 'down' ).link( function( down ) {
      if ( thisModel.enabled && thisModel.over ) {
        if ( down && valueProperty.value === valueA ) {
          thisModel.toggle();
          thisModel.readyToToggleUp = false;
        }
        if ( !down && valueProperty.value === valueB ) {
          if ( thisModel.readyToToggleUp ) {
            thisModel.toggle();
          }
          else {
            thisModel.readyToToggleUp = true;
          }
        }
      }

      //Handle the case where the pointer moved out then up over a toggle button, so it will respond to the next press
      if ( !down && !thisModel.over ) {
        thisModel.readyToToggleUp = true;
      }
    } );

    //Make the button ready to toggle when enabled
    this.property( 'enabled' ).onValue( true, function() {
      thisModel.readyToToggleUp = true;
    } );
  }

  return inherit( ButtonModel, StickyToggleButtonModel, {
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