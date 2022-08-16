// Copyright 2014-2022, University of Colorado Boulder

/**
 * Model for a toggle button that changes value on each "up" event when the button is released.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 */

import Emitter from '../../../axon/js/Emitter.js';
import TEmitter from '../../../axon/js/TEmitter.js';
import TProperty from '../../../axon/js/TProperty.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import EventType from '../../../tandem/js/EventType.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import ButtonModel, { ButtonModelOptions } from './ButtonModel.js';

type SelfOptions = EmptySelfOptions;

export type ToggleButtonModelOptions = SelfOptions & ButtonModelOptions;

export default class ToggleButtonModel<T> extends ButtonModel {

  public readonly valueProperty: TProperty<T>;
  public readonly valueOff: T;
  public readonly valueOn: T;

  private readonly toggledEmitter: TEmitter;
  private readonly disposeToggleButtonModel: () => void;

  /**
   * @param valueOff - value when the button is in the off state
   * @param valueOn - value when the button is in the on state
   * @param property - axon Property that can be either valueOff or valueOn.
   * @param [providedOptions]
   */
  public constructor( valueOff: T, valueOn: T, property: TProperty<T>, providedOptions?: ToggleButtonModelOptions ) {

    const options = optionize<ToggleButtonModelOptions, SelfOptions, ButtonModelOptions>()( {
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( options );

    this.valueOff = valueOff;
    this.valueOn = valueOn;
    this.valueProperty = property;

    // Behaves like a push button (with fireOnDown:false), but toggles its state when the button is released.
    const downListener = ( down: boolean ) => {
      if ( ( this.overProperty.get() || this.focusedProperty.get() ) && this.enabledProperty.get() && !this.interrupted ) {
        if ( !down ) {
          this.toggle();
        }
      }
    };
    this.downProperty.link( downListener );

    this.toggledEmitter = new Emitter( {
      tandem: options.tandem.createTandem( 'toggledEmitter' ),
      phetioDocumentation: 'Emits when the button is toggled',
      phetioEventType: EventType.USER
    } );

    const toggleListener = () => {
      assert && assert( this.valueProperty.value === this.valueOff || this.valueProperty.value === this.valueOn,
        `unrecognized value: ${this.valueProperty.value}` );

      this.valueProperty.value = this.valueProperty.value === this.valueOff ? this.valueOn : this.valueOff;
    };
    this.toggledEmitter.addListener( toggleListener );

    this.disposeToggleButtonModel = () => {
      this.downProperty.unlink( downListener );
      this.toggledEmitter.dispose();
    };
  }

  public override dispose(): void {
    this.disposeToggleButtonModel();
    super.dispose();
  }

  private toggle(): void {
    this.toggledEmitter.emit();
    this.produceSoundEmitter.emit();
  }
}

sun.register( 'ToggleButtonModel', ToggleButtonModel );