// Copyright 2014-2015, University of Colorado Boulder

/**
 * The ButtonListener is a scenery Input Listener that translates input events (down, up, enter, exit) into states in a
 * button model.  Duck typing is used for the buttonModel, it can be anything with "down" and "over" boolean properties,
 * such as a PushButtonModel or a StickyToggleButtonModel.
 *
 * One assumption of this ButtonListener is that only one pointer can interact with the button at a time, and the other
 * pointers are effectively "locked out" while another pointer is using the button.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var DownUpListener = require( 'SCENERY/input/DownUpListener' );
  var Input = require( 'SCENERY/input/Input' );
  var inherit = require( 'PHET_CORE/inherit' );
  var sun = require( 'SUN/sun' );

  /**
   * @param {*} buttonModel any object with 'downProperty' and 'overProperty' boolean attributes
   * @constructor
   */
  function ButtonListener( buttonModel ) {

    this.buttonModel = buttonModel; // @private
    var self = this;

    // Track the pointer that is currently interacting with this button, ignore others.
    this.overPointer = null; // @private
    this.downPointer = null; // @private

    DownUpListener.call( this, {
      down: function( event, trail ) {
        if ( self.downPointer === null ) {
          self.downPointer = event.pointer;
        }
        if ( event.pointer === self.downPointer ) {
          buttonModel.downProperty.set( true );
        }
      },

      up: function( event, trail ) {
        if ( event.pointer === self.downPointer ) {
          self.downPointer = null;
          buttonModel.downProperty.set( false );
        }
      }
    } );
  }

  sun.register( 'ButtonListener', ButtonListener );

  return inherit( DownUpListener, ButtonListener, {

    /**
     * When this Button has focus, pressing a key down presses the button.  This is part of the accessibility feature
     * set. This API is subject to change (if we make a more specific ENTER/SPACE callback).
     * @param {Event} event
     * @param {Trail} trail
     * @public
     */
    keydown: function( event, trail ) {
      if ( event.domEvent.keyCode === Input.KEY_ENTER || event.domEvent.keyCode === Input.KEY_SPACE ) {
        this.enter( event, trail );
        this.buttonModel.downProperty.set( true );
      }
    },

    /**
     * When this Button has focus, pressing a key up releases the button.  This is part of the accessibility feature
     * set. This API is subject to change (if we make a more specific ENTER/SPACE callback
     * @param {Event} event
     * @param {Trail} trail
     * @public
     */
    keyup: function( event, trail ) {
      if ( event.domEvent.keyCode === Input.KEY_ENTER || event.domEvent.keyCode === Input.KEY_SPACE ) {
        this.buttonModel.downProperty.set( false );
        this.exit( event, trail );
      }
    },

    // @public
    enter: function( event, trail ) {
      if ( this.overPointer === null ) {
        this.overPointer = event.pointer;
        this.buttonModel.overProperty.set( true );
      }
    },

    // @public
    exit: function( event, trail ) {
      if ( event.pointer === this.overPointer ) {
        this.overPointer = null;
        this.buttonModel.overProperty.set( false );
      }
    }
  } );
} );