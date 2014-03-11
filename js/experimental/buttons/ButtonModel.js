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

    // Arrays used to track pointers that are over this button and that are
    // currently down.  Note that if a pointer goes down over the node but
    // then goes outside of the node, it will be on the down list but not the
    // over list.
    this.downPointers = [];
    this.overPointers = [];

    DownUpListener.call( this, {

      down: function( event, trail ) {
        if ( self._enabled ) {
          self.interactionState.value = 'pressed';
          // TODO: Next line is temp for testing, remove once this class is fully debugged.
          if ( self.downPointers.indexOf( event.pointer ) !== -1 ) { throw new Error( 'Pointer already in downPointers.' ); }
          self.downPointers.push( event.pointer );
          if ( options.fireOnDown ) {
            self.fire();
          }
        }
      },

      up: function( event, trail ) {
        if ( self._enabled ) {
          // TODO: Next line is temp for testing, remove once this class is fully debugged.
          if ( self.downPointers.indexOf( event.pointer ) === -1 ) { throw new Error( 'Pointer not in downPointers.' ); }
          if ( self.overPointers.indexOf( event.pointer ) !== -1 && !options.fireOnDown ) {
            // Fire the listener(s).
            self.fire();
          }
          self.downPointers = _.without( self.downPointers, event.pointer );
          self.interactionState.value = self.anyPointerOverAndDown() ? 'pressed' : self.overPointers.length > 0 ? 'over' : 'idle';
        }
      }
    } );
  }

  return inherit( DownUpListener, ButtonModel, {

    enter: function( event ) {
      if ( this._enabled ) {
        this.overPointers.push( event.pointer );
        if ( this.anyPointerOverAndDown() ) {
          this.interactionState.value = 'pressed';
        }
        else {
          this.interactionState.value = 'over';
        }
      }
    },

    exit: function( event ) {
      if ( this._enabled ) {
        assert && assert( this.overPointers.length > 0, 'Exit events not matched by an enter' );
        this.overPointers = _.without( this.overPointers, event.pointer );
        if ( this.overPointers.length === 0 ) {
          this.interactionState.value = 'idle';
        }
      }
    },

    // Return true if at least one pointer is both over and down on this node.
    anyPointerOverAndDown: function() {
      for ( var i = 0; i < this.overPointers.length; i++ ) {
        if ( this.downPointers.indexOf( this.overPointers[ i ] ) !== -1 ) {
          return true;
        }
      }
      return false;
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
        this.downPointers.length = 0;
        this.overPointers.length = 0;
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