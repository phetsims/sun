// Copyright 2014-2021, University of Colorado Boulder

/**
 * Basic model for a push button, including over/down/enabled properties.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import CallbackTimer from '../../../axon/js/CallbackTimer.js';
import Emitter from '../../../axon/js/Emitter.js';
import merge from '../../../phet-core/js/merge.js';
import EventType from '../../../tandem/js/EventType.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import ButtonModel from './ButtonModel.js';

class PushButtonModel extends ButtonModel {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {

      fireOnDown: false, // true: fire on pointer down; false: fire on pointer up if pointer is over button
      listener: null, // {function} convenience for adding 1 listener, no args

      // fire-on-hold feature
      // TODO: these options are not supported with PDOM interaction, see https://github.com/phetsims/scenery/issues/1117
      fireOnHold: false, // is the fire-on-hold feature enabled?
      fireOnHoldDelay: 400, // start to fire continuously after pressing for this long (milliseconds)
      fireOnHoldInterval: 100, // fire continuously at this interval (milliseconds), same default as in ButtonModel
      tandem: Tandem.REQUIRED,
      phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly // to support properly passing this to children, see https://github.com/phetsims/tandem/issues/60
    }, options );

    super( options );

    // @public (read-only) - used by ResetAllButton to call functions during reset start/end
    this.isFiringProperty = new BooleanProperty( false );

    // @private - sends out notifications when the button is released.
    this.firedEmitter = new Emitter( {
      tandem: options.tandem.createTandem( 'firedEmitter' ),
      phetioDocumentation: 'Emits when the button is fired',
      phetioReadOnly: options.phetioReadOnly,
      phetioEventType: EventType.USER
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
    const downPropertyObserver = down => {
      if ( down ) {
        if ( this.enabledProperty.get() ) {
          if ( options.fireOnDown ) {
            this.fire();
          }
          if ( this.timer ) {
            this.timer.start();
          }
          if ( options.fireOnDown || this.timer ) {
            this.produceSoundEmitter.emit();
          }
        }
      }
      else {

        // should the button fire?
        const fire = ( !options.fireOnDown && ( this.overProperty.get() || this.focusedProperty.get() ) && this.enabledProperty.get() && !this.interrupted );
        if ( this.timer ) {
          this.timer.stop( fire );
        }
        else if ( fire ) {

          // Produce sound before firing, in case firing causes the disposal of this PushButtonModel
          this.produceSoundEmitter.emit();
          this.fire();
        }
      }
    };
    this.downProperty.link( downPropertyObserver );

    // Stop the timer when the button is disabled.
    const enabledPropertyObserver = enabled => {
      if ( !enabled && this.timer ) {
        this.timer.stop( false ); // Stop the timer, don't fire if we haven't already
      }
    };
    this.enabledProperty.link( enabledPropertyObserver );

    this.disposePushButtonModel = () => {

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

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposePushButtonModel();
    super.dispose();
  }

  /**
   * Adds a listener. If already a listener, this is a no-op.
   * @param {function} listener - function called when the button is pressed, no args
   * @public
   */
  addListener( listener ) {
    this.firedEmitter.addListener( listener );
  }

  /**
   * Removes a listener. If not a listener, this is a no-op.
   * @param {function} listener
   * @public
   */
  removeListener( listener ) {
    this.firedEmitter.removeListener( listener );
  }

  /**
   * Fires all listeners.
   * @public (phet-io, a11y)
   */
  fire() {

    // Make sure the button is not already firing, see https://github.com/phetsims/energy-skate-park-basics/issues/380
    assert && assert( !this.isFiringProperty.value, 'Cannot fire when already firing' );
    this.isFiringProperty.value = true;
    this.firedEmitter.emit();
    this.isFiringProperty.value = false;
  }
}

sun.register( 'PushButtonModel', PushButtonModel );
export default PushButtonModel;