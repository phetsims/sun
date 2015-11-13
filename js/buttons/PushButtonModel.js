// Copyright 2014-2015, University of Colorado Boulder

/**
 * Basic model for a push button, including over/down/enabled properties.
 *
 * @author Sam Reid
 * @author John Blanco
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonModel = require( 'SUN/buttons/ButtonModel' );
  var CallbackTimer = require( 'SUN/CallbackTimer' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function PushButtonModel( options ) {

    options = _.extend( {

      fireOnDown: false, // true: fire on pointer down; false: fire on pointer up if pointer is over button
      listener: null, // {function} convenience for adding 1 listener

      // fire-on-hold feature
      fireOnHold: false, // is the fire-on-hold feature enabled?
      fireOnHoldDelay: 400, // start to fire continuously after pressing for this long (milliseconds)
      fireOnHoldInterval: 100 // fire continuously at this interval (milliseconds)
    }, options );

    var pushButtonModel = this;
    ButtonModel.call( this, options );

    this.listeners = []; // @private
    if ( options.listener !== null ) {
      this.listeners.push( options.listener );
    }

    // Create a timer to handle the optional fire-on-hold feature.
    // When that feature is enabled, calling this.fire is delegated to the timer.
    if ( options.fireOnHold ) {
      this.timer = new CallbackTimer( {
        callback: this.fire.bind( this ),
        delay: options.fireOnHoldDelay,
        interval: options.fireOnHoldInterval
      } );
    }

    // Point down
    this.property( 'down' ).onValue( true, function() {
      if ( pushButtonModel.enabled ) {
        if ( options.fireOnDown ) {
          pushButtonModel.fire();
        }
        if ( pushButtonModel.timer ) {
          pushButtonModel.timer.start();
        }
      }
    } );

    // Pointer up
    this.property( 'down' ).onValue( false, function() {
      var fire = ( !options.fireOnDown && pushButtonModel.over && pushButtonModel.enabled ); // should the button fire?
      if ( pushButtonModel.timer ) {
        pushButtonModel.timer.stop( fire );
      }
      else if ( fire ) {
        pushButtonModel.fire();
      }
    } );

    // Stop the timer when the button is disabled.
    this.property( 'enabled' ).link( function( enabled ) {
      if ( !enabled && pushButtonModel.timer ) {
        pushButtonModel.timer.stop( false ); // Stop the timer, don't fire if we haven't already
      }
    } );
  }

  return inherit( ButtonModel, PushButtonModel, {

    // @public
    dispose: function() {
      ButtonModel.prototype.dispose.call( this );
      this.listeners.length = 0;
      if ( this.timer ) {
        this.timer.dispose();
        this.timer = null;
      }
    },

    /**
     * Adds a listener. If already a listener, this is a no-op.
     * @param {function} listener
     * @public
     */
    addListener: function( listener ) {
      if ( this.listeners.indexOf( listener ) === -1 ) {
        this.listeners.push( listener );
      }
    },

    /**
     * Removes a listener. If not a listener, this is a no-op.
     * @param {function} listener
     * @public
     */
    removeListener: function( listener ) {
      var i = this.listeners.indexOf( listener );
      if ( i !== -1 ) {
        this.listeners.splice( i, 1 );
      }
    },

    /**
     * Fires all listeners.
     * @private with the possible exception of hooking up for accessibility
     */
    fire: function() {
      this.trigger0( 'startedCallbacksForFired' );
      var copy = this.listeners.slice( 0 );
      copy.forEach( function( listener ) {
        listener();
      } );
      this.trigger0( 'endedCallbacksForFired' );
    }
  } );
} );