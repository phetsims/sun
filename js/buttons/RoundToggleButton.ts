// Copyright 2014-2025, University of Colorado Boulder

/**
 * RoundToggleButton is a round toggle button that toggles the value of a Property between 2 values.
 * It has the same look for both values.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import type Property from '../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import affirm from '../../../perennial-alias/js/browser-and-node/affirm.js';
import optionize from '../../../phet-core/js/optionize.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import { PDOMValueType } from '../../../scenery/js/accessibility/pdom/ParallelDOM.js';
import sharedSoundPlayers from '../../../tambo/js/sharedSoundPlayers.js';
import type TSoundPlayer from '../../../tambo/js/TSoundPlayer.js';
import Tandem from '../../../tandem/js/Tandem.js';
import { ResolvedResponse } from '../../../utterance-queue/js/ResponsePacket.js';
import sun from '../sun.js';
import SunUtil from '../SunUtil.js';
import RoundButton, { type RoundButtonOptions } from './RoundButton.js';
import ToggleButtonInteractionStateProperty from './ToggleButtonInteractionStateProperty.js';
import ToggleButtonModel from './ToggleButtonModel.js';

type SelfOptions = {

  // sounds to be played on toggle transitions
  valueOffSoundPlayer?: TSoundPlayer;
  valueOnSoundPlayer?: TSoundPlayer;

  // Convenience accessible names for each of the on/off states. So you don't have to create
  // a DerivedProperty for the accessibleName if it changes with the state of the button.
  // For a constant accessibleName, just use the accessibleName option.
  accessibleNameOff?: PDOMValueType;
  accessibleNameOn?: PDOMValueType;

  accessibleContextResponseOff?: ResolvedResponse | TReadOnlyProperty<ResolvedResponse>;
  accessibleContextResponseOn?: ResolvedResponse | TReadOnlyProperty<ResolvedResponse>;
};

export type RoundToggleButtonOptions = SelfOptions & StrictOmit<RoundButtonOptions, 'accessibleContextResponse' | 'accessiblePressedProperty'>;

export default class RoundToggleButton<T> extends RoundButton {

  private readonly disposeRoundToggleButton: () => void;

  /**
   * @param property - axon Property that can be either valueOff or valueOn
   * @param valueOff - value when the button is in the off state
   * @param valueOn - value when the button is in the on state
   * @param providedOptions
   */
  public constructor( property: Property<T>, valueOff: T, valueOn: T, providedOptions?: RoundToggleButtonOptions ) {
    affirm( property.valueComparisonStrategy === 'reference', 'RoundToggleButton depends on "===" for comparison' );

    if ( assert && providedOptions ) {

      // accessibleNameOn and accessibleNameOff are provided for convenience, but cannot be used with accessibleName. If
      // using accessibleName, you are presumably doing custom logic or changing the name yourself with the property.
      // assertMutuallyExclusiveOptions cannot be used because it checks only for the presence of keys, not their values.
      // It treats a key as "provided" even if its value is null or undefined.
      const hasAccessibleName = 'accessibleName' in providedOptions && providedOptions.accessibleName;
      const hasAccessibleNameOn = 'accessibleNameOn' in providedOptions && providedOptions.accessibleNameOn;
      const hasAccessibleNameOff = 'accessibleNameOff' in providedOptions && providedOptions.accessibleNameOff;
      assert( !( hasAccessibleName && ( hasAccessibleNameOn || hasAccessibleNameOff ) ),
        'accessibleName cannot be used with accessibleNameOn or accessibleNameOff' );

      // If accessibleNameOn is used, then accessibleNameOff must also be used, and vice versa.
      const hasOn = providedOptions && 'accessibleNameOn' in providedOptions;
      const hasOff = providedOptions && 'accessibleNameOff' in providedOptions;
      assert( hasOn === hasOff, 'accessibleNameOn and accessibleNameOff must be used together' );
    }

    // The implementation describing when this button is 'pressed'. Pressed corresponds to 'on' state.
    // This is important when using the accessibleRoleConfiguration option. By default, toggle buttons
    // use 'button' configuration and this is unused.
    const accessiblePressedProperty = new DerivedProperty( [ property ], ( value: T ) => value === valueOn );

    const options = optionize<RoundToggleButtonOptions, SelfOptions, RoundButtonOptions>()( {

      // SelfOptions
      valueOffSoundPlayer: sharedSoundPlayers.get( 'toggleOff' ),
      valueOnSoundPlayer: sharedSoundPlayers.get( 'toggleOn' ),

      // phet-io support
      tandem: Tandem.REQUIRED,
      phetioFeatured: true,

      // a11y
      accessibleContextResponseOn: null,
      accessibleContextResponseOff: null,
      accessibleNameOn: null,
      accessibleNameOff: null,
      accessiblePressedProperty: accessiblePressedProperty,

      listenerOptions: {
        tandem: Tandem.OPT_OUT // ToggleButtonModel provides a toggledEmitter which is sufficient
      }
    }, providedOptions );

    options.accessibleContextResponse = () => {

      // This is called after the property has taken the new value
      return property.value === valueOn ? options.accessibleContextResponseOn : options.accessibleContextResponseOff;
    };

    // If using accessibleNameOn/Off, set the initial accessibleName based on the current value of the property.
    if ( options.accessibleNameOn || options.accessibleNameOff ) {
      options.accessibleName = property.value === valueOn ? options.accessibleNameOn : options.accessibleNameOff;
    }

    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    const toggleButtonModel = new ToggleButtonModel( valueOff, valueOn, property, options );
    const toggleButtonInteractionStateProperty = new ToggleButtonInteractionStateProperty( toggleButtonModel );

    super( toggleButtonModel, toggleButtonInteractionStateProperty, options );

    this.addLinkedElement( property, {
      tandemName: 'property'
    } );

    assert && SunUtil.validateLinkedElementInstrumentation( this, property );

    // sound generation
    const afterFire = () => {
      if ( property.value === valueOff ) {
        options.valueOffSoundPlayer.play();
        options.accessibleNameOff && this.setAccessibleName( options.accessibleNameOff );
      }
      else if ( property.value === valueOn ) {
        options.valueOnSoundPlayer.play();
        options.accessibleNameOn && this.setAccessibleName( options.accessibleNameOn );
      }
    };
    this.buttonModel.fireCompleteEmitter.addListener( afterFire );

    this.disposeRoundToggleButton = () => {
      this.buttonModel.fireCompleteEmitter.removeListener( afterFire );
      accessiblePressedProperty.dispose();
      toggleButtonModel.dispose();
    };
  }

  public override dispose(): void {
    this.disposeRoundToggleButton();
    super.dispose();
  }
}

sun.register( 'RoundToggleButton', RoundToggleButton );