// Copyright 2002-2014, University of Colorado Boulder

/**
 * Basic button model, intended to be added as an input listener to any
 * Scenery node in order to allow it to behave as a button.
 */
define( function( require ) {
  'use strict';

  var DownUpListener = require( 'SCENERY/input/DownUpListener' );
  var Property = require( 'AXON/Property' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {Object} options
   * @constructor
   */
  function ButtonModel( options ) {
    var self = this;
    options = _.extend(
      {
        fireOnDown: false,
        listener: null
      }, options );

    this.listeners = [];
    if ( options.listener !== null ) {
      this.listeners.push( options.listener );
    }

    // A property that can be monitored externally in order to modify the
    // appearance of a button.  The values that it can take on are idle, over,
    // pressed, and disabled.  Should not be set externally.
    this.interactionState = new Property( 'idle' );

    // Enabled state, for internal use.
    this._enabled = true;

    // Track the pointer the is currently interacting with this button, ignore others.
    this.overPointer = null;

    DownUpListener.call( this, {

      down: function( event, trail ) {
        if ( self._enabled ) {
          assert && assert( self.overPointer === event.pointer, 'down event received from unexpected pointer' );
          self.interactionState.value = 'pressed';
          if ( options.fireOnDown ) {
            self.fire();
          }
        }
      },

      up: function( event, trail ) {
        if ( self._enabled ) {
          assert && assert( self.overPointer === event.pointer, 'up event received from unexpected pointer' );
          if ( !options.fireOnDown && self.overPointer === event.pointer ) {
            // Fire the listener(s).
            self.fire();
          }
          self.interactionState.value = self.overPointer === null ? 'idle' : 'over';
        }
      }
    } );
  }

  return inherit( DownUpListener, ButtonModel, {

    enter: function( event ) {
      if ( this._enabled && this.overPointer === null ) {
        this.overPointer = event.pointer;
        this.interactionState.value = 'over';
      }
    },

    exit: function( event ) {
      if ( this._enabled ) {
        this.overPointer = null;
        this.interactionState.value = 'idle';
      }
    },

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

    // ES5 getter for enabled state.
    get enabled() { return this._enabled; },

    // ES5 setter for enabled state.
    set enabled( value ) {

      this._enabled = value;

      if ( !value ) {
        this.interactionState.value = 'disabled';
        this.overPointer = null;
      }
      else {
        // TODO: Determine if we want/need to handle multi-touch situations
        // here.  If so, we would need to track some sort of 'shadow state'
        // when the button is disabled and restore it here.
        this.interactionState.value = 'idle';
      }
    }
  } );
} );