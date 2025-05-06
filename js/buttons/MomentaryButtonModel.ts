// Copyright 2015-2025, University of Colorado Boulder

/**
 * Model for a momentary button: on when pressed, off when released.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import type TProperty from '../../../axon/js/TProperty.js';
import optionize, { type EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import ButtonModel, { type ButtonModelOptions } from './ButtonModel.js';

type SelfOptions = EmptySelfOptions;

export type MomentaryButtonModelOptions = SelfOptions & ButtonModelOptions;

export default class MomentaryButtonModel<T> extends ButtonModel {

  private readonly disposeMomentaryButtonModel: () => void;

  // (sun-internal)
  public readonly valueProperty: TProperty<T>;
  public readonly valueOn: T;

  /**
   * @param valueOff - value when the button is in the off state
   * @param valueOn - value when the button is in the on state
   * @param valueProperty
   * @param [providedOptions]
   */
  public constructor( valueOff: T, valueOn: T, valueProperty: TProperty<T>, providedOptions?: MomentaryButtonModelOptions ) {

    const options = optionize<MomentaryButtonModelOptions, SelfOptions, ButtonModelOptions>()( {

      // phet-io
      tandem: Tandem.REQUIRED,

      // to support properly passing this to children, see https://github.com/phetsims/tandem/issues/60
      phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly
    }, providedOptions );

    super( options );

    // For 'toggle' like behavior for alternative input, tracks the state for the button because it should remain on
    // even when the ButtonModel is not down.
    let wasClickedWhileOn = false;

    const downListener = ( down: boolean ) => {

      // If clicking with alternative input, the button should behave like a toggle button. Activating it once will
      // set to the on value, and activating it again will set to the off value. This is different from pointer input,
      // where the button is only on while the mouse is down. To match the 'momentary' behavior of pointer input,
      // the button is released when it loses focus.
      if ( this.pdomClickingProperty.value ) {
        if ( down && valueProperty.value === valueOff ) {

          // Button is down from alt input while off, turn on.
          this.setValue( valueOn );

          // In this activation the downProperty is going to be set to false right away. This flag prevents the
          // button from turning off the button until the next click.
          wasClickedWhileOn = false;
        }
        if ( !down && valueProperty.value === valueOn ) {
          if ( wasClickedWhileOn ) {

            // Button is up from alt input while on, and it was clicked while on, turn off.
            this.setValue( valueOff );
          }
          else {

            // Button is up from alt input and it was not pressed while on, so it should remain on. Set
            // the flag so that it will turn off in the next click.
            wasClickedWhileOn = true;
          }
        }
      }
      else {

        // turn on when pressed (if enabled)
        if ( down ) {
          if ( this.enabledProperty.get() ) {
            this.setValue( valueOn );
          }
        }
        else {
          this.setValue( valueOff );
        }
      }
    };
    this.downProperty.lazyLink( downListener );

    // Turn off when focus is lost.
    const focusedListener = ( focused: boolean ) => {
      if ( !focused ) {
        this.setValue( valueOff );
      }
    };
    this.focusedProperty.lazyLink( focusedListener );

    this.valueProperty = valueProperty;
    this.valueOn = valueOn;

    // if valueProperty set externally, signify to ButtonModel
    const valuePropertyListener = ( value: T ) => {
      this.downProperty.set( value === valueOn );
    };
    valueProperty.link( valuePropertyListener );

    this.disposeMomentaryButtonModel = () => {
      this.downProperty.unlink( downListener );
      this.focusedProperty.unlink( focusedListener );
      valueProperty.unlink( valuePropertyListener );
    };
  }

  public override dispose(): void {
    this.disposeMomentaryButtonModel();
    super.dispose(); //TODO fails with assertions enabled, see https://github.com/phetsims/sun/issues/212
  }

  /**
   * Produces a sound whenever this button changes the value.
   */
  private setValue( value: T ): void {
    this.valueProperty.set( value );
    this.fireCompleteEmitter.emit();
  }
}

sun.register( 'MomentaryButtonModel', MomentaryButtonModel );