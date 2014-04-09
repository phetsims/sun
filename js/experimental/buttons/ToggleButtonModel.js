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
   * @param {Object} options
   * @constructor
   */
  function ToggleButtonModel( toggledProperty, options ) {
    var toggleButtonModel = this;

    this.toggledProperty = toggledProperty;

    options = _.extend( {
      fireOnDown: false,
      listener: null
    }, options );

    PropertySet.call( this, {
      over: false,
      down: false,
      enabled: true,
    } );

    this.listeners = [];
    if ( options.listener !== null ) {
      this.listeners.push( options.listener );
    }

    //When the user releases the toggle button, it should only fire a toggle event if it is not during the same action in which they pressed the button
    //Track the state to see if they have already pushed the button or not.
    var readyToToggleUp = false;

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
      if ( down && !toggleButtonModel.toggled ) {
        toggleButtonModel.toggledProperty.toggle();
        readyToToggleUp = false;
      }
      if ( !down && toggleButtonModel.toggled ) {
        if ( readyToToggleUp ) {
          toggleButtonModel.toggledProperty.toggle();
        }
        else {
          readyToToggleUp = true;
        }
      }
    } );
  }

  return inherit( PropertySet, ToggleButtonModel, {
    // Adds a listener. If already a listener, this is a no-op.
    addListener: function( listener ) {
      if ( this.listeners.indexOf( listener ) === -1 ) {
        this.listeners.push( listener );
      }
    },

    // Remove a listener. If not a listener, this is a no-op.
    removeListener: function( listener ) {
      var i = this.listeners.indexOf( listener );
      if ( i !== -1 ) {
        this.listeners.splice( i, 1 );
      }
    },

    // Fires all listeners.  Should not be called outside of this file with
    // the possible exception of hooking up for accessibility.
    fire: function() {
      var copy = this.listeners.slice( 0 );
      copy.forEach( function( listener ) {
        listener();
      } );
    },

    set toggled( t ) { this.toggledProperty.value = t; },

    get toggled() {return this.toggledProperty.value;}
  } );
} );