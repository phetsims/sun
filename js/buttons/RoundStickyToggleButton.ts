// Copyright 2014-2022, University of Colorado Boulder

/**
 * RoundStickyToggleButton is a round toggle button that toggles the value of a Property between 2 values.
 * It has a different look (referred to as 'up' and 'down') for the 2 values.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import IProperty from '../../../axon/js/IProperty.js';
import optionize from '../../../phet-core/js/optionize.js';
import ISoundPlayer from '../../../tambo/js/ISoundPlayer.js';
import pushButtonSoundPlayer from '../../../tambo/js/shared-sound-players/pushButtonSoundPlayer.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import RoundButton, { RoundButtonOptions } from './RoundButton.js';
import StickyToggleButtonInteractionStateProperty from './StickyToggleButtonInteractionStateProperty.js';
import StickyToggleButtonModel from './StickyToggleButtonModel.js';

type SelfOptions = {
  soundPlayer?: ISoundPlayer;
};

export type RoundStickyToggleButtonOptions = SelfOptions & RoundButtonOptions;

export default class RoundStickyToggleButton<T> extends RoundButton {

  private readonly disposeRoundStickyToggleButton: () => void;

  /**
   * @param valueUp - value when the toggle is in the 'up' position
   * @param valueDown - value when the toggle is in the 'down' position
   * @param valueProperty - axon Property that can be either valueUp or valueDown.
   * @param providedOptions
   */
  constructor( valueUp: T, valueDown: T, valueProperty: IProperty<T>, providedOptions?: RoundStickyToggleButtonOptions ) {

    const options = optionize<RoundStickyToggleButtonOptions, SelfOptions, RoundButtonOptions>()( {

      // SelfOptions
      soundPlayer: pushButtonSoundPlayer,

      // RoundButtonOptions
      tandem: Tandem.REQUIRED
    }, providedOptions );

    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    // @ts-ignore
    const toggleButtonModel = new StickyToggleButtonModel( valueUp, valueDown, valueProperty, options );
    const stickyToggleButtonInteractionStateProperty = new StickyToggleButtonInteractionStateProperty( toggleButtonModel );

    super( toggleButtonModel, stickyToggleButtonInteractionStateProperty, options );

    // sound generation
    const playSound = () => options.soundPlayer.play();
    toggleButtonModel.produceSoundEmitter.addListener( playSound );

    // pdom - signify button is 'pressed' when down
    const setAriaPressed = ( value: T ) => this.setPDOMAttribute( 'aria-pressed', valueProperty.value === valueDown );
    valueProperty.link( setAriaPressed );

    this.disposeRoundStickyToggleButton = () => {
      valueProperty.unlink( setAriaPressed );
      toggleButtonModel.produceSoundEmitter.removeListener( playSound );
      toggleButtonModel.dispose();
    };
  }

  public override dispose(): void {
    this.disposeRoundStickyToggleButton();
    super.dispose();
  }
}

sun.register( 'RoundStickyToggleButton', RoundStickyToggleButton );