// Copyright 2014-2024, University of Colorado Boulder

/**
 * RoundStickyToggleButton is a round toggle button that toggles the value of a Property between 2 values.
 * It has a different look (referred to as 'up' and 'down') for the 2 values.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import TProperty from '../../../axon/js/TProperty.js';
import optionize from '../../../phet-core/js/optionize.js';
import sharedSoundPlayers from '../../../tambo/js/sharedSoundPlayers.js';
import TSoundPlayer from '../../../tambo/js/TSoundPlayer.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import RoundButton, { RoundButtonOptions } from './RoundButton.js';
import StickyToggleButtonInteractionStateProperty from './StickyToggleButtonInteractionStateProperty.js';
import StickyToggleButtonModel from './StickyToggleButtonModel.js';

type SelfOptions = {
  soundPlayer?: TSoundPlayer;
};

export type RoundStickyToggleButtonOptions = SelfOptions & RoundButtonOptions;

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

      // RoundButtonOptions
      tandem: Tandem.REQUIRED,

      // pdom
      ariaRole: 'switch'
    }, providedOptions );

    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    const toggleButtonModel = new StickyToggleButtonModel( valueUp, valueDown, valueProperty, options );
    const stickyToggleButtonInteractionStateProperty = new StickyToggleButtonInteractionStateProperty( toggleButtonModel );

    super( toggleButtonModel, stickyToggleButtonInteractionStateProperty, options );

    // sound generation
    const playSound = () => options.soundPlayer.play();
    toggleButtonModel.produceSoundEmitter.addListener( playSound );

    // pdom - Signify button is 'pressed' when down. Use both aria-pressed and aria-checked
    // because that sounds best in NVDA.
    const updateAria = () => {
      this.setPDOMAttribute( 'aria-pressed', valueProperty.value === valueDown );
      this.setPDOMAttribute( 'aria-checked', valueProperty.value === valueDown );
    };
    valueProperty.link( updateAria );

    this.disposeRoundStickyToggleButton = () => {
      valueProperty.unlink( updateAria );
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