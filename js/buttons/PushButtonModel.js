// Copyright 2014-2015, University of Colorado Boulder

/**
 * Basic model for a push button, including over/down/enabled properties.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonModel = require( 'SUN/buttons/ButtonModel' );
  var CallbackTimer = require( 'SUN/CallbackTimer' );
  var inherit = require( 'PHET_CORE/inherit' );
  var sun = require( 'SUN/sun' );
  var Emitter = require( 'AXON/Emitter' );
  var Tandem = require( 'TANDEM/Tandem' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function PushButtonModel( options ) {

    options = _.extend( {

      fireOnDown: false, // true: fire on pointer down; false: fire on pointer up if pointer is over button
      listener: null, // {function} convenience for adding 1 listener, no args

      // fire-on-hold feature
      fireOnHold: false, // is the fire-on-hold feature enabled?
      fireOnHoldDelay: 400, // start to fire continuously after pressing for this long (milliseconds)
      fireOnHoldInterval: 100, // fire continuously at this interval (milliseconds),
      tandem: Tandem.tandemOptional()
    }, options );

    var self = this;

    ButtonModel.call( this, options );

    // @public (phet-io) support for the phet-io data stream
    this.startedCallbacksForFiredEmitter = new Emitter( {
      indicateCallbacks: false,
      tandem: options.tandem.createTandem( 'startedCallbacksForFiredEmitter' ),
      phetioEmitData: false
    } );
    this.endedCallbacksForFiredEmitter = new Emitter( {
      indicateCallbacks: false,
      tandem: options.tandem.createTandem( 'endedCallbacksForFiredEmitter' ),
      phetioEmitData: false
    } );

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
    this.downProperty.link( function( down ) {
      if ( down ) {
        if ( self.enabledProperty.get() ) {
          if ( options.fireOnDown ) {
            self.fire();
          }
          if ( self.timer ) {
            self.timer.start();
          }
        }
      }
      else {
        var fire = ( !options.fireOnDown && self.overProperty.get() && self.enabledProperty.get() ); // should the button fire?
        if ( self.timer ) {
          self.timer.stop( fire );
        }
        else if ( fire ) {
          self.fire();
        }
      }
    } );

    // Stop the timer when the button is disabled.
    this.enabledProperty.link( function( enabled ) {
      if ( !enabled && self.timer ) {
        self.timer.stop( false ); // Stop the timer, don't fire if we haven't already
      }
    } );


    this.disposePushButtonModel = function() {
      this.listeners.length = 0;
      if ( this.timer ) {
        this.timer.dispose();
        this.timer = null;
      }

      this.startedCallbacksForFiredEmitter.dispose();
      this.endedCallbacksForFiredEmitter.dispose();
    };
  }

  sun.register( 'PushButtonModel', PushButtonModel );

  return inherit( ButtonModel, PushButtonModel, {

    // @public
    dispose: function() {
      this.disposePushButtonModel();
      ButtonModel.prototype.dispose.call( this );
    },

    /**
     * Adds a listener. If already a listener, this is a no-op.
     * @param {function} listener - function called when the button is pressed, no args
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
     * @public (phet-io, a11y)
     */
    fire: function() {
      this.startedCallbacksForFiredEmitter.emit();
      var copy = this.listeners.slice( 0 );
      copy.forEach( function( listener ) {
        listener();
      } );
      this.endedCallbacksForFiredEmitter.emit();
    }
  } );
} );