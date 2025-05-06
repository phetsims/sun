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
import sharedSoundPlayers from '../../../tambo/js/sharedSoundPlayers.js';
import type TSoundPlayer from '../../../tambo/js/TSoundPlayer.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import RectangularButton, { type RectangularButtonOptions } from './RectangularButton.js';
import StickyToggleButtonInteractionStateProperty from './StickyToggleButtonInteractionStateProperty.js';
import StickyToggleButtonModel from './StickyToggleButtonModel.js';

type SelfOptions = {
  soundPlayer?: TSoundPlayer;
};

export type RectangularStickyToggleButtonOptions = SelfOptions & RectangularButtonOptions;

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
      ariaRole: 'switch'
    }, providedOptions );

    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    const buttonModel = new StickyToggleButtonModel( valueUp, valueDown, valueProperty, providedOptions );
    const stickyToggleButtonInteractionStateProperty = new StickyToggleButtonInteractionStateProperty( buttonModel );

    super( buttonModel, stickyToggleButtonInteractionStateProperty, options );

    // sound generation
    const playSound = () => options.soundPlayer.play();
    buttonModel.fireCompleteEmitter.addListener( playSound );

    // pdom - Signify button is 'pressed' when down. Use both aria-pressed and aria-checked
    // because that sounds best in NVDA.
    const updateAria = () => {
      this.setPDOMAttribute( 'aria-pressed', valueProperty.value === valueDown );
      this.setPDOMAttribute( 'aria-checked', valueProperty.value === valueDown );
    };
    valueProperty.link( updateAria );

    this.disposeRectangularStickyToggleButton = () => {
      valueProperty.unlink( updateAria );
      buttonModel.fireCompleteEmitter.removeListener( playSound );
      buttonModel.dispose();
    };
  }

  public override dispose(): void {
    this.disposeRectangularStickyToggleButton();
    super.dispose();
  }
}

sun.register( 'RectangularStickyToggleButton', RectangularStickyToggleButton );