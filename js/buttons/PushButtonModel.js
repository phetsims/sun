// Copyright 2002-2014, University of Colorado Boulder

/**
 * Basic model for a push button, including over/down/enabled properties.
 *
 * @author Sam Reid
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonModel = require( 'SUN/buttons/ButtonModel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Timer = require( 'JOIST/Timer' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function PushButtonModel( options ) {
    var pushButtonModel = this;

    options = _.extend( {
      fireOnDown: false, // true: fire on pointer down; false: fire on pointer up if pointer is over button
      listener: null,

      // options related to fire-on-hold feature
      fireOnHold: false,
      fireOnHoldDelay: 400, // start to fire continuously after pressing for this long (milliseconds)
      fireOnHoldInterval: 100 // fire continuously at this interval (milliseconds)
    }, options );

    // check that the timer values are reasonable if fire-on-hold is turned on
    assert && assert( !options.fireOnHold || ( options.fireOnHoldDelay && options.fireOnHoldInterval ) );

    ButtonModel.call( this );

    this.listeners = []; //@private
    if ( options.listener !== null ) {
      this.listeners.push( options.listener );
    }

    var delayID = null; // identified for timer associated with the initial delay
    var intervalID = null; // identifier for timer associates with the continuous interval
    var firedByHold = false; // flag for preventing extra firing on button up after holding

    // cleans up the timers
    var cleanupTimer = function() {
      if ( delayID ) {
        Timer.clearTimeout( delayID );
        delayID = null;
      }
      if ( intervalID ) {
        Timer.clearInterval( intervalID );
        intervalID = null;
      }
    };

    // Handle changes of the 'down' property to true.
    this.property( 'down' ).onValue( true, function() {
      if ( pushButtonModel.enabled ) {

        if ( options.fireOnDown ) {
          pushButtonModel.fire();
        }

        // make sure timers are in the expected state
        assert && assert( delayID === null && intervalID === null, 'Timers non-null on button down' );

        if ( options.fireOnHold ){
          // set timers for press-and-hold behavior
          delayID = Timer.setTimeout( function() {
            pushButtonModel.fire();
            firedByHold = true;
            delayID = null;
            intervalID = Timer.setInterval( function() {
              pushButtonModel.fire();
            }, options.fireOnHoldInterval );
          }, options.fireOnHoldDelay );
        }
      }
    } );

    // If button was released and "fire on down" was not set, fire the listeners
    this.property( 'down' ).onValue( false, function() {
      cleanupTimer();
      if ( !options.fireOnDown && !firedByHold && pushButtonModel.over && pushButtonModel.enabled ) {
        pushButtonModel.fire();
      }
      firedByHold = false;
    } );
  }

  return inherit( ButtonModel, PushButtonModel, {

    dispose: function() {
      this.listeners.length = 0;
      ButtonModel.prototype.dispose.call( this );
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

    // Fires all listeners.
    // @private with the possible exception of hooking up for accessibility.
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