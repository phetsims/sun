// Copyright 2014-2017, University of Colorado Boulder

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
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var ButtonModel = require( 'SUN/buttons/ButtonModel' );
  var CallbackTimer = require( 'SUN/CallbackTimer' );
  var Emitter = require( 'AXON/Emitter' );
  var inherit = require( 'PHET_CORE/inherit' );
  var sun = require( 'SUN/sun' );
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

      // phet-io
      tandem: Tandem.optional // Note this should be for the parent button, not a child one for the PushButtonModel
    }, options );

    var self = this;

    ButtonModel.call( this, options );

    // @public - used by ResetAllButton to call functions during reset start/end
    this.isFiringProperty = new BooleanProperty( false );

    // @private
    this.emitter = new Emitter( {
      tandem: options.tandem.createTandem( 'emitter' )
    } );
    if ( options.listener !== null ) {
      this.emitter.addListener( options.listener );
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
      this.isFiringProperty.dispose();
      this.emitter.dispose();
      if ( this.timer ) {
        this.timer.dispose();
        this.timer = null;
      }
    };
  }

  sun.register( 'PushButtonModel', PushButtonModel );

  return inherit( ButtonModel, PushButtonModel, {

    // @public
    dispose: function() {

      // If the button was firing, we must complete the PhET-iO transaction before disposing.
      // see https://github.com/phetsims/energy-skate-park-basics/issues/380
      this.isFiringProperty.value = false;
      this.disposePushButtonModel();
    },

    /**
     * Adds a listener. If already a listener, this is a no-op.
     * @param {function} listener - function called when the button is pressed, no args
     * @public
     */
    addListener: function( listener ) {
      this.emitter.addListener( listener );
    },

    /**
     * Removes a listener. If not a listener, this is a no-op.
     * @param {function} listener
     * @public
     */
    removeListener: function( listener ) {
      this.emitter.removeListener( listener );
    },

    /**
     * Fires all listeners.
     * @public (phet-io, a11y)
     */
    fire: function() {

      // Make sure the button is not already firing, see https://github.com/phetsims/energy-skate-park-basics/issues/380
      assert && assert( !this.isFiringProperty.value, 'Cannot fire when already firing' );
      this.isFiringProperty.value = true;
      this.emitter.emit();
      this.isFiringProperty.value = false;
    }
  } );
} );