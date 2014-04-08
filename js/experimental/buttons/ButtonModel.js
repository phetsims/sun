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
  function ButtonModel( options ) {
    options = _.extend(
      {
        fireOnDown: false
      }, options );

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

  return inherit( DownUpListener, ButtonModel, {

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
      if ( event.pointer === this.overPointer ) {
        this.overPointer = null;
        if ( this.buttonEnabled ) {
          this.interactionState.value = 'idle';
        }
      }
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