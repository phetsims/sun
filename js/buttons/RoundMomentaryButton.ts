// Copyright 2015-2025, University of Colorado Boulder

/**
 * RoundMomentaryButton is a round momentary button that toggles a Property between 2 values.
 * The 'off value' is the value when the button is not pressed.
 * The 'on value' is the value when the button is pressed.
 *
 * TODO: Not supported with alternative input, see https://github.com/phetsims/scenery/issues/1117
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import type TProperty from '../../../axon/js/TProperty.js';
import optionize from '../../../phet-core/js/optionize.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import sharedSoundPlayers from '../../../tambo/js/sharedSoundPlayers.js';
import type TSoundPlayer from '../../../tambo/js/TSoundPlayer.js';
import Tandem from '../../../tandem/js/Tandem.js';
import { TAlertable } from '../../../utterance-queue/js/Utterance.js';
import sun from '../sun.js';
import MomentaryButtonInteractionStateProperty from './MomentaryButtonInteractionStateProperty.js';
import MomentaryButtonModel from './MomentaryButtonModel.js';
import RoundButton, { type RoundButtonOptions } from './RoundButton.js';

type SelfOptions = {
  valueOffSoundPlayer?: TSoundPlayer;
  valueOnSoundPlayer?: TSoundPlayer;

  // The accessibleContextResponse that is spoken when the button is pressed, after the value is set to valueOn.
  accessibleContextResponseValueOn?: TAlertable;

  // The accessibleContextResponse that is spoken when the button is released, after the value is set to valueOff.
  accessibleContextResponseValueOff?: TAlertable;
};

export type RoundMomentaryButtonOptions = SelfOptions & StrictOmit<RoundButtonOptions, 'accessibleContextResponse'>;

export default class RoundMomentaryButton<T> extends RoundButton {

  private readonly disposeRoundMomentaryButton: () => void;

  /**
   * @param property
   * @param valueOff - value when the button is in the off state
   * @param valueOn - value when the button is in the on state
   * @param providedOptions?
   */
  public constructor( property: TProperty<T>, valueOff: T, valueOn: T, providedOptions?: RoundMomentaryButtonOptions ) {

    const options = optionize<RoundMomentaryButtonOptions, SelfOptions, RoundButtonOptions>()( {

      // SelfOptions
      valueOffSoundPlayer: sharedSoundPlayers.get( 'toggleOff' ),
      valueOnSoundPlayer: sharedSoundPlayers.get( 'toggleOn' ),

      accessibleContextResponseValueOn: null,
      accessibleContextResponseValueOff: null,

      tandem: Tandem.REQUIRED
    }, providedOptions );

    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    const buttonModel = new MomentaryButtonModel( valueOff, valueOn, property, options );

    super( buttonModel, new MomentaryButtonInteractionStateProperty( buttonModel ), options );

    // sound and accessibility
    const handleButtonFire = () => {
      if ( property.value === valueOff ) {
        options.valueOffSoundPlayer.play();
        this.addAccessibleContextResponse( options.accessibleContextResponseValueOff );
      }
      else if ( property.value === valueOn ) {
        options.valueOnSoundPlayer.play();
        this.addAccessibleContextResponse( options.accessibleContextResponseValueOn );
      }
    };
    this.buttonModel.fireCompleteEmitter.addListener( handleButtonFire );

    // pdom - signify button is 'pressed' when down
    const setAriaPressed = () => this.setPDOMAttribute( 'aria-pressed', property.value === valueOn );
    property.link( setAriaPressed );

    this.disposeRoundMomentaryButton = () => {
      property.unlink( setAriaPressed );
      buttonModel.fireCompleteEmitter.removeListener( handleButtonFire );
      buttonModel.dispose();
    };
  }

  public override dispose(): void {
    this.disposeRoundMomentaryButton();
    super.dispose();
  }
}

sun.register( 'RoundMomentaryButton', RoundMomentaryButton );