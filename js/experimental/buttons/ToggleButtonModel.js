// Copyright 2002-2014, University of Colorado Boulder

/**
 * Basic model for a push button, including over/down/enabled properties and the derived property "interactionState".
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   * @param {Property<Boolean>} toggledProperty the property that represents the model state of whether the button
   * (and corresponding model domain feature) is toggled or not.
   * @param {Object} options
   * @constructor
   */
  function ToggleButtonModel( toggledProperty, options ) {
    var toggleButtonModel = this;

    this.toggledProperty = toggledProperty;

    options = _.extend( {
      toggleOnDown: true
    }, options );

    PropertySet.call( this, {
      over: false,
      down: false,
      enabled: true,
      readyToToggleUp: false
    } );

    //For debugging
//    this.overProperty.debug( 'over' );
//    this.downProperty.debug( 'down' );
//    this.enabledProperty.debug( 'enabled' );
//    this.toggledProperty.debug( 'toggled' );
//    this.readyToToggleUpProperty.debug( 'readyToToggleUp' );

    //When the user releases the toggle button, it should only fire a toggle event if it is not during the same action in which they pressed the button
    //Track the state to see if they have already pushed the button or not.
//    var readyToToggleUp = false;

    //Create the "interactionState" which is often used to determine how to render the button
    this.addDerivedProperty( 'interactionState', ['over', 'down', 'enabled', 'toggled'], function( over, down, enabled, toggled ) {
      return !enabled && toggled ? 'disabled-pressed' :
             !enabled ? 'disabled' :
             over && !(down || toggled) ? 'over' :
             over && (down || toggled) ? 'pressed' :
             toggled ? 'pressed' :
             'idle';
    } );

    //If the button is untoggled and the user presses it, show it pressed and toggle the state right away
    //When the button is released, untoggle the state (unless it was part of the same action that toggled the button down in the first place).
    this.property( 'down' ).link( function( down ) {
      if ( toggleButtonModel.enabled && toggleButtonModel.over ) {
        if ( down && !toggleButtonModel.toggled ) {
          toggleButtonModel.toggledProperty.toggle();
          toggleButtonModel.readyToToggleUp = false;
        }
        if ( !down && toggleButtonModel.toggled ) {
          if ( toggleButtonModel.readyToToggleUp ) {
            toggleButtonModel.toggledProperty.toggle();
          }
          else {
            toggleButtonModel.readyToToggleUp = true;
          }
        }
      }

      //Handle the case where the pointer moved out then up over a toggle button, so it will respond to the next press
      if ( !down && !toggleButtonModel.over ) {
        toggleButtonModel.readyToToggleUp = true;
      }
    } );
  }

  return inherit( PropertySet, ToggleButtonModel, {
    set toggled( t ) { this.toggledProperty.value = t; },

    get toggled() {return this.toggledProperty.value;}
  } );
} );