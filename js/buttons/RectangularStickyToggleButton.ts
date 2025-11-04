// Copyright 2014-2025, University of Colorado Boulder

/**
 * RectangularStickyToggleButton is a rectangular toggle button that toggles the value of a Property between 2 values.
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
import RectangularButton, { type RectangularButtonOptions } from './RectangularButton.js';
import StickyToggleButtonInteractionStateProperty from './StickyToggleButtonInteractionStateProperty.js';
import StickyToggleButtonModel from './StickyToggleButtonModel.js';

type SelfOptions = {
  soundPlayer?: TSoundPlayer;

  // The accessibleContextResponse that is spoken when the button is pressed, after the value is set to valueDown.
  accessibleContextResponseOn?: TAlertable;

  // The accessibleContextResponse that is spoken when the button is released, after the value is set to valueUp.
  accessibleContextResponseOff?: TAlertable;
};

export type RectangularStickyToggleButtonOptions = SelfOptions & StrictOmit<RectangularButtonOptions, 'accessibleContextResponse'>;

export default class RectangularStickyToggleButton<T> extends RectangularButton {

  private readonly disposeRectangularStickyToggleButton: () => void;

  /**
   * @param valueProperty - axon Property that can be either valueUp or valueDown.
   * @param valueUp - value when the toggle is in the 'up' position
   * @param valueDown - value when the toggle is in the 'down' position
   * @param providedOptions?
   */
  public constructor( valueProperty: TProperty<T>, valueUp: T, valueDown: T, providedOptions?: RectangularStickyToggleButtonOptions ) {

    const options = optionize<RectangularStickyToggleButtonOptions, SelfOptions, RectangularButtonOptions>()( {
      soundPlayer: sharedSoundPlayers.get( 'pushButton' ),
      tandem: Tandem.REQUIRED,
      accessibleRoleConfiguration: 'toggle',
      accessibleContextResponseOn: null,
      accessibleContextResponseOff: null
    }, providedOptions );

    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    const buttonModel = new StickyToggleButtonModel( valueUp, valueDown, valueProperty, providedOptions );
    const stickyToggleButtonInteractionStateProperty = new StickyToggleButtonInteractionStateProperty( buttonModel );

    super( buttonModel, stickyToggleButtonInteractionStateProperty, options );

    // sound generation
    const handleButtonFire = () => {
      options.soundPlayer.play();

      if ( valueProperty.value === valueUp ) {
        this.addAccessibleContextResponse( options.accessibleContextResponseOff );
      }
      else {
        this.addAccessibleContextResponse( options.accessibleContextResponseOn );
      }
    };
    buttonModel.fireCompleteEmitter.addListener( handleButtonFire );

    this.disposeRectangularStickyToggleButton = () => {
      buttonModel.fireCompleteEmitter.removeListener( handleButtonFire );
      buttonModel.dispose();
    };
  }

  public override dispose(): void {
    this.disposeRectangularStickyToggleButton();
    super.dispose();
  }
}

sun.register( 'RectangularStickyToggleButton', RectangularStickyToggleButton );