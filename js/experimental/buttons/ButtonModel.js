// Copyright 2002-2014, University of Colorado Boulder

/**
 * Basic model for a push button, intended to be added as an input listener to
 * any Scenery node in order to allow it to behave as a button.
 *
 * IMPORTANT USAGE NOTES:
 * - The node to which this is added should not be made non-pickable when
 *   the disabled state is entered, or subsequent states may not be correct.
 * - Generally speaking, only one of these should be added to a given node.
 *
 * @author John Blanco
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
  function PushButtonModel( options ) {
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
    this.buttonEnabled = true;

    // Track the pointer the is currently interacting with this button, ignore others.
    this.overPointer = null;
    this.downPointer = null;

    DownUpListener.call( this, {
      down: options.down,
      up: options.up
    } );
  }

  return inherit( DownUpListener, PushButtonModel, {

    enter: function( event, trail ) {
      if ( this.overPointer === null ) {
        this.overPointer = event.pointer;
      }
      if ( this.buttonEnabled ) {
        if ( this.overPointer === event.pointer ) {
          this.interactionState.value = this.downPointer === event.pointer ? 'pressed' : 'over';
        }
      }
    },

    exit: function( event, trail ) {
      if ( this.buttonEnabled && event.pointer === this.overPointer ) {
        this.interactionState.value = 'idle';
      }
      if ( event.pointer === this.overPointer ) {
        this.overPointer = null;
        if ( this.buttonEnabled ) {
          this.interactionState.value = 'idle';
        }
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
    get enabled() { return this.buttonEnabled; },

    // ES5 setter for enabled state.
    set enabled( value ) {

      if ( this.buttonEnabled !== value ) {
        this.buttonEnabled = value;

        if ( !value ) {
          this.interactionState.value = 'disabled';
        }
        else {
          if ( this.overPointer === null ) {
            this.interactionState.value = 'idle';
          }
          else {
            this.interactionState.value = this.downPointer === null ? 'over' : 'pressed';
          }
        }
      }
    }
  } );
} );