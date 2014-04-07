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
  var ButtonModel = require( 'SUN/experimental/buttons/ButtonModel' );

  /**
   * @param {Object} options
   * @constructor
   */
  function PushButtonModel( options ) {
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

    ButtonModel.call( this, {

      down: function( event, trail ) {
        if ( self.downPointer === null ) {
          self.downPointer = event.pointer;
        }
        if ( self.buttonEnabled && event.pointer === self.downPointer ) {
          self.interactionState.value = 'pressed';
          if ( options.fireOnDown ) {
            self.fire();
          }
        }
      },

      up: function( event, trail ) {
        if ( self.buttonEnabled ) {
          if ( !options.fireOnDown && self.downPointer === event.pointer && self.overPointer === event.pointer ) {
            // Fire the listener(s).
            self.fire();
          }
          self.interactionState.value = self.overPointer === null ? 'idle' : 'over';
        }
        if ( event.pointer === self.downPointer ) {
          self.downPointer = null;
        }
      }
    } );
  }

  return inherit( ButtonModel, PushButtonModel, {

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