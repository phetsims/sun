// Copyright 2002-2014, University of Colorado Boulder

/**
 * The ButtonListener is a scenery Input Listener that translates input events
 * (down, up, enter, exit) into states in a button model.  Duck typing is used
 * for the buttonModel, it can be anything with "down" and "over" boolean properties,
 * such as a PushButtonModel or a StickyToggleButtonModel.
 *
 * One assumption of this ButtonListener is that only one pointer can interact
 * with the button at a time, and the other pointers are effectively "locked
 * out" while another pointer is using the button.
 *
 * @author John Blanco
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var DownUpListener = require( 'SCENERY/input/DownUpListener' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {*} buttonModel any object with 'down' and 'over' boolean properties
   * @constructor
   */
  function ButtonListener( buttonModel ) {
    this.buttonModel = buttonModel; // @private
    var buttonListener = this;

    // Track the pointer that is currently interacting with this button, ignore others.
    this.overPointer = null; // @private
    this.downPointer = null; // @private

    DownUpListener.call( this, {
        down: function( event, trail ) {
          if ( buttonListener.downPointer === null ) {
            buttonListener.downPointer = event.pointer;
          }
          if ( event.pointer === buttonListener.downPointer ) {
            buttonModel.down = true;
          }
        },

        up: function( event, trail ) {
          if ( event.pointer === buttonListener.downPointer ) {
            buttonListener.downPointer = null;
            buttonModel.down = false;
          }
        }
      }
    );
  }

  return inherit( DownUpListener, ButtonListener, {
    enter: function( event, trail ) {
      if ( this.overPointer === null ) {
        this.overPointer = event.pointer;
        this.buttonModel.over = true;
      }
    },

    exit: function( event, trail ) {
      if ( event.pointer === this.overPointer ) {
        this.overPointer = null;
        this.buttonModel.over = false;
      }
    } } );
} );