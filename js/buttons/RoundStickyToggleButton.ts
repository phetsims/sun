// Copyright 2014-2025, University of Colorado Boulder

/**
 * RoundStickyToggleButton is a round toggle button that toggles the value of a Property between 2 values.
 * It has a different look (referred to as 'up' and 'down') for the 2 values.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type TProperty from '../../../axon/js/TProperty.js';
import optionize from '../../../phet-core/js/optionize.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import sharedSoundPlayers from '../../../tambo/js/sharedSoundPlayers.js';
import type TSoundPlayer from '../../../tambo/js/TSoundPlayer.js';
import Tandem from '../../../tandem/js/Tandem.js';
import { TAlertable } from '../../../utterance-queue/js/Utterance.js';
import sun from '../sun.js';
import RoundButton, { type RoundButtonOptions } from './RoundButton.js';
import StickyToggleButtonInteractionStateProperty from './StickyToggleButtonInteractionStateProperty.js';
import StickyToggleButtonModel from './StickyToggleButtonModel.js';

type SelfOptions = {
  soundPlayer?: TSoundPlayer;

  // The accessibleContextResponse that is spoken when the button is pressed, after the value is set to valueOn.
  accessibleContextResponseOn?: TAlertable;

  // The accessibleContextResponse that is spoken when the button is released, after the value is set to valueOff.
  accessibleContextResponseOff?: TAlertable;
};

export type RoundStickyToggleButtonOptions = SelfOptions & StrictOmit<RoundButtonOptions, 'accessibleContextResponse'>;

export default class RoundStickyToggleButton<T> extends RoundButton {

  private readonly disposeRoundStickyToggleButton: () => void;

  /**
   * @param valueProperty - axon Property that can be either valueUp or valueDown.
   * @param valueUp - value when the toggle is in the 'up' position
   * @param valueDown - value when the toggle is in the 'down' position
   * @param providedOptions?
   */
  public constructor( valueProperty: TProperty<T>, valueUp: T, valueDown: T, providedOptions?: RoundStickyToggleButtonOptions ) {
    assert && assert( valueProperty.valueComparisonStrategy === 'reference',
      'RoundStickyToggleButton depends on "===" equality for value comparison' );

    const options = optionize<RoundStickyToggleButtonOptions, SelfOptions, RoundButtonOptions>()( {

      // SelfOptions
      soundPlayer: sharedSoundPlayers.get( 'pushButton' ),

      // So that this button is conveyed as a toggle button with a pressed state for accessibility.
      accessibleRoleConfiguration: 'toggle',
      accessibleContextResponseOn: null,
      accessibleContextResponseOff: null,

      // RoundButtonOptions
      tandem: Tandem.REQUIRED
    }, providedOptions );

    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    const toggleButtonModel = new StickyToggleButtonModel( valueUp, valueDown, valueProperty, options );
    const stickyToggleButtonInteractionStateProperty = new StickyToggleButtonInteractionStateProperty( toggleButtonModel );

    super( toggleButtonModel, stickyToggleButtonInteractionStateProperty, options );

    // sound generation and responses
    const handleButtonFire = () => {
      options.soundPlayer.play();

      if ( valueProperty.value === valueUp ) {
        this.addAccessibleContextResponse( options.accessibleContextResponseOff );
      }
      else {
        this.addAccessibleContextResponse( options.accessibleContextResponseOn );
      }
    };
    toggleButtonModel.fireCompleteEmitter.addListener( handleButtonFire );

    this.disposeRoundStickyToggleButton = () => {
      toggleButtonModel.fireCompleteEmitter.removeListener( handleButtonFire );
      toggleButtonModel.dispose();
    };
  }

  public override dispose(): void {
    this.disposeRoundStickyToggleButton();
    super.dispose();
  }
}

sun.register( 'RoundStickyToggleButton', RoundStickyToggleButton );