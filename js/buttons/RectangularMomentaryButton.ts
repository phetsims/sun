// Copyright 2015-2025, University of Colorado Boulder

/**
 * RectangularMomentaryButton is a rectangular momentary button that toggles a Property between 2 values.
 * The 'off value' is the value when the button is not pressed.
 * The 'on value' is the value when the button is pressed.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import type TProperty from '../../../axon/js/TProperty.js';
import InstanceRegistry from '../../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../../phet-core/js/optionize.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import sharedSoundPlayers from '../../../tambo/js/sharedSoundPlayers.js';
import type TSoundPlayer from '../../../tambo/js/TSoundPlayer.js';
import Tandem from '../../../tandem/js/Tandem.js';
import { TAlertable } from '../../../utterance-queue/js/Utterance.js';
import sun from '../sun.js';
import MomentaryButtonInteractionStateProperty from './MomentaryButtonInteractionStateProperty.js';
import MomentaryButtonModel from './MomentaryButtonModel.js';
import RectangularButton, { type RectangularButtonOptions } from './RectangularButton.js';

type SelfOptions = {
  valueOffSoundPlayer?: TSoundPlayer;
  valueOnSoundPlayer?: TSoundPlayer;

  // The accessibleContextResponse that is spoken when the button is pressed, after the value is set to valueOn.
  accessibleContextResponseOn?: TAlertable;

  // The accessibleContextResponse that is spoken when the button is released, after the value is set to valueOff.
  accessibleContextResponseOff?: TAlertable;
};

// Momentary buttons will always be "toggle" role for accessibility purposes.
export type RectangularMomentaryButtonOptions = SelfOptions & StrictOmit<RectangularButtonOptions, 'accessibleContextResponse' | 'accessibleRoleConfiguration'>;

export default class RectangularMomentaryButton<T> extends RectangularButton {

  private readonly disposeRectangularMomentaryButton: () => void;

  /**
   * @param property
   * @param valueOff - value when the button is in the off state
   * @param valueOn - value when the button is in the on state
   * @param [providedOptions?]
   */
  public constructor( property: TProperty<T>, valueOff: T, valueOn: T, providedOptions?: RectangularMomentaryButtonOptions ) {

    const options = optionize<RectangularMomentaryButtonOptions, SelfOptions, RectangularButtonOptions>()( {

      // SelfOptions
      valueOffSoundPlayer: sharedSoundPlayers.get( 'toggleOff' ),
      valueOnSoundPlayer: sharedSoundPlayers.get( 'toggleOn' ),

      accessibleContextResponseOn: null,
      accessibleContextResponseOff: null,
      accessibleRoleConfiguration: 'toggle',

      tandem: Tandem.REQUIRED
    }, providedOptions );

    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    const buttonModel = new MomentaryButtonModel( valueOff, valueOn, property, options );

    super( buttonModel, new MomentaryButtonInteractionStateProperty( buttonModel ), options );

    // sound and accessibility
    const handleButtonFire = () => {
      if ( property.value === valueOff ) {
        options.valueOffSoundPlayer.play();
        this.addAccessibleContextResponse( options.accessibleContextResponseOff, { flush: true } );
      }
      else if ( property.value === valueOn ) {
        options.valueOnSoundPlayer.play();
        this.addAccessibleContextResponse( options.accessibleContextResponseOn, { flush: true } );
      }
    };
    this.buttonModel.fireCompleteEmitter.addListener( handleButtonFire );

    this.disposeRectangularMomentaryButton = () => {
      buttonModel.fireCompleteEmitter.removeListener( handleButtonFire );
      buttonModel.dispose();
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && window.phet?.chipper?.queryParameters?.binder && InstanceRegistry.registerDataURL( 'sun', 'RectangularMomentaryButton', this );
  }

  public override dispose(): void {
    this.disposeRectangularMomentaryButton();
    super.dispose();
  }
}

sun.register( 'RectangularMomentaryButton', RectangularMomentaryButton );