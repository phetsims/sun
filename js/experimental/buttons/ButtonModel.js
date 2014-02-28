// Copyright 2002-2014, University of Colorado Boulder

define( function( require ) {
  'use strict';

  var DownUpListener = require( 'SCENERY/input/DownUpListener' );
  var Property = require( 'AXON/Property' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {function} callback
   * @param {Object} options
   * @constructor
   */
  function ButtonModel( callback, options ) {
    if ( typeof( callback ) !== 'function' ) { throw new Error( 'Must supply callback function to button model.' ); }
    var self = this;
    options = _.extend( { fireOnDown: false }, options );

    // A property that can be monitored externally in order to modify the
    // appearance of a button.  Valid values are idle, over, pressed, and
    // disabled.  Should not be set externally.
    this.interactionState = new Property( 'idle' );

    // Enabled state, for internal use.
    this._enabled = true;

    // Track pointers that are over this button and that are currently down.
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
            callback();
          }
        }
      },

      up: function( event, trail ) {
        if ( self._enabled ) {
          self.interactionState.value = self.overPointers.length > 0 ? 'over' : 'idle';
          // TODO: Next line is temp for testing, remove once this class is fully debugged.
          if ( self.downPointers.indexOf( event.pointer ) === -1 ) { throw new Error( 'Pointer not in downPointers.' ); }

          if ( self.overPointers.indexOf( event.pointer ) !== -1 && !options.fireOnDown ) {
            // Fire the callback.
            callback();
          }
          self.downPointers = _.without( self.downPointers, event.pointer );
        }
      }
    } );
  }

  return inherit( DownUpListener, ButtonModel, {

    enter: function( event ) {
      if ( this._enabled ) {
        this.overPointers.push( event.pointer );
        if ( this.downPointers.indexOf( event.pointer ) !== -1 ) {
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

    // ES5 getter for enabled state.
    get enabled() { return this._enabled; },

    // ES5 setter for enabled state.
    set enabled( value ) {

      this._enabled = value;

      if ( !value ) {
        this.interactionState.value = 'disabled';
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