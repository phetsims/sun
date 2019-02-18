// Copyright 2014-2019, University of Colorado Boulder

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
  var PhetioObject = require( 'TANDEM/PhetioObject' );
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
      fireOnHoldInterval: 100, // fire continuously at this interval (milliseconds), same default as in ButtonModel
      tandem: Tandem.required,
      phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly // to support properly passing this to children, see https://github.com/phetsims/tandem/issues/60
    }, options );

    var self = this;

    ButtonModel.call( this, options );

    // @public - used by ResetAllButton to call functions during reset start/end
    this.isFiringProperty = new BooleanProperty( false );

    // @private - sends out notifications when the button is released.
    this.firedEmitter = new Emitter( {
      tandem: options.tandem.createTandem( 'firedEmitter' ),
      phetioDocumentation: 'Emits when the button is fired',
      phetioReadOnly: options.phetioReadOnly,
      phetioEventType: PhetioObject.EventType.USER
    } );
    if ( options.listener !== null ) {
      this.firedEmitter.addListener( options.listener );
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
    var downPropertyObserver = function( down ) {
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
    };
    this.downProperty.link( downPropertyObserver );

    // Stop the timer when the button is disabled.
    var enabledPropertyObserver = function( enabled ) {
      if ( !enabled && self.timer ) {
        self.timer.stop( false ); // Stop the timer, don't fire if we haven't already
      }
    };
    this.enabledProperty.link( enabledPropertyObserver );

    this.disposePushButtonModel = function() {

      // If the button was firing, we must complete the PhET-iO transaction before disposing.
      // see https://github.com/phetsims/energy-skate-park-basics/issues/380
      this.isFiringProperty.value = false;
      this.isFiringProperty.dispose();
      this.firedEmitter.dispose();
      this.downProperty.unlink( downPropertyObserver );
      this.enabledProperty.unlink( enabledPropertyObserver );
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
      this.disposePushButtonModel();
      ButtonModel.prototype.dispose.call( this );
    },

    /**
     * Adds a listener. If already a listener, this is a no-op.
     * @param {function} listener - function called when the button is pressed, no args
     * @public
     */
    addListener: function( listener ) {
      this.firedEmitter.addListener( listener );
    },

    /**
     * Removes a listener. If not a listener, this is a no-op.
     * @param {function} listener
     * @public
     */
    removeListener: function( listener ) {
      this.firedEmitter.removeListener( listener );
    },

    /**
     * Fires all listeners.
     * @public (phet-io, a11y)
     */
    fire: function() {

      // Make sure the button is not already firing, see https://github.com/phetsims/energy-skate-park-basics/issues/380
      assert && assert( !this.isFiringProperty.value, 'Cannot fire when already firing' );
      this.isFiringProperty.value = true;
      this.firedEmitter.emit();
      this.isFiringProperty.value = false;
    }
  } );
} );