// Copyright 2014-2022, University of Colorado Boulder

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
import TEmitter from '../../../axon/js/TEmitter.js';
import Property from '../../../axon/js/Property.js';
import optionize from '../../../phet-core/js/optionize.js';
import EventType from '../../../tandem/js/EventType.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import ButtonModel, { ButtonModelOptions } from './ButtonModel.js';

export type PushButtonListener = () => void;

type SelfOptions = {

  // true: fire on pointer down; false: fire on pointer up if pointer is over button
  fireOnDown?: boolean;

  // convenience for adding 1 listener, no args
  listener?: PushButtonListener | null;

  // fire-on-hold feature
  // TODO: these options are not supported with PDOM interaction, see https://github.com/phetsims/scenery/issues/1117
  fireOnHold?: boolean; // is the fire-on-hold feature enabled?
  fireOnHoldDelay?: number; // start to fire continuously after pressing for this long (milliseconds)
  fireOnHoldInterval?: number; // fire continuously at this interval (milliseconds), same default as in ButtonModel

  // to support properly passing this to children, see https://github.com/phetsims/tandem/issues/60
  phetioReadOnly?: boolean;
};

export type PushButtonModelOptions = SelfOptions & ButtonModelOptions;

export default class PushButtonModel extends ButtonModel {

  // used by ResetAllButton to call functions during reset start/end
  public readonly isFiringProperty: Property<boolean>;

  // sends out notifications when the button is released.
  private readonly firedEmitter: TEmitter;

  private timer?: CallbackTimer | null;

  private readonly disposePushButtonModel: () => void;

  public constructor( providedOptions?: PushButtonModelOptions ) {

    const options = optionize<PushButtonModelOptions, SelfOptions, ButtonModelOptions>()( {

      fireOnDown: false,
      listener: null,
      fireOnHold: false,
      fireOnHoldDelay: 400,
      fireOnHoldInterval: 100,

      tandem: Tandem.REQUIRED,
      phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly
    }, providedOptions );

    super( options );

    this.isFiringProperty = new BooleanProperty( false );

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
    const downPropertyObserver = ( down: boolean ) => {
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
    const enabledPropertyObserver = ( enabled: boolean ) => {
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

  public override dispose(): void {
    this.disposePushButtonModel();
    super.dispose();
  }

  /**
   * Adds a listener. If already a listener, this is a no-op.
   * @param listener - function called when the button is pressed, no args
   */
  public addListener( listener: PushButtonListener ): void {
    this.firedEmitter.addListener( listener );
  }

  /**
   * Removes a listener. If not a listener, this is a no-op.
   */
  public removeListener( listener: PushButtonListener ): void {
    this.firedEmitter.removeListener( listener );
  }

  /**
   * Fires all listeners.  Public for phet-io and a11y use.
   */
  public fire(): void {

    // Make sure the button is not already firing, see https://github.com/phetsims/energy-skate-park-basics/issues/380
    assert && assert( !this.isFiringProperty.value, 'Cannot fire when already firing' );
    this.isFiringProperty.value = true;
    this.firedEmitter.emit();
    this.isFiringProperty.value = false;
  }
}

sun.register( 'PushButtonModel', PushButtonModel );
