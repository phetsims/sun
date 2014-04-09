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
  function ToggleButtonModel( options ) {
    var toggleButtonModel = this;

    options = _.extend( {
      fireOnDown: false,
      listener: null
    }, options );

    PropertySet.call( this, {
      over: false,
      down: false,
      enabled: true,
      toggled: false
    } );

    this.listeners = [];
    if ( options.listener !== null ) {
      this.listeners.push( options.listener );
    }

    //Create the "interactionState" which is often used to determine how to render the button
    this.addDerivedProperty( 'interactionState', ['over', 'down', 'enabled', 'toggled'], function( over, down, enabled, toggled ) {
      return !enabled && toggled ? 'disabled-pressed' :
             !enabled ? 'disabled' :
             over && !(down || toggled) ? 'over' :
             over && (down || toggled) ? 'pressed' :
             toggled ? 'pressed' :
             'idle';
    } );

    //If button was pressed and "fire on down" was set, fire the listeners
    this.property( 'down' ).onValue( true, function() {
      if ( options.fireOnDown ) {
        toggleButtonModel.fire();
        toggleButtonModel.toggledProperty.toggle();
      }
    } );

    //If button was released and "fire on down" was not set, fire the listeners
    this.property( 'down' ).onValue( false, function() {
      if ( !options.fireOnDown && toggleButtonModel.over ) {
        toggleButtonModel.fire();
        toggleButtonModel.toggledProperty.toggle();
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
    }
  } );
} );