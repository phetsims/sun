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
import sun from '../sun.js';
import RoundButton, { type RoundButtonOptions } from './RoundButton.js';
import StickyToggleButtonInteractionStateProperty from './StickyToggleButtonInteractionStateProperty.js';
import StickyToggleButtonModel from './StickyToggleButtonModel.js';

type SelfOptions = {
  soundPlayer?: TSoundPlayer;

  // Determines the ARIA role and state attributes for the button in the accessibility tree.
  //
  // - 'toggle' (default): Sets role to 'button' (implicit) and applies the `aria-pressed` attribute, reflecting the toggle state.
  // - 'switch': Sets role to 'switch' and applies the `aria-checked` attribute, reflecting the switch state.
  // - 'button': Sets role to 'button' (implicit) with no state attribute (`aria-pressed` or `aria-checked` are not set).
  accessibleRoleConfiguration?: 'toggle' | 'switch' | 'button';
};

export type RoundStickyToggleButtonOptions = SelfOptions & StrictOmit<RoundButtonOptions, 'ariaRole'>;

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
      accessibleRoleConfiguration: 'toggle'
    }, providedOptions );

    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    const toggleButtonModel = new StickyToggleButtonModel( valueUp, valueDown, valueProperty, options );
    const stickyToggleButtonInteractionStateProperty = new StickyToggleButtonInteractionStateProperty( toggleButtonModel );

    super( toggleButtonModel, stickyToggleButtonInteractionStateProperty, options );

    // sound generation
    const playSound = () => options.soundPlayer.play();
    toggleButtonModel.fireCompleteEmitter.addListener( playSound );

    this.ariaRole = options.accessibleRoleConfiguration === 'switch' ? 'switch' : null;

    // pdom - Signify button is 'checked' or 'pressed' when down. A screen reader will
    // announce information like "on" or "off" with these attributes.
    const updateAria = () => {
      if ( options.accessibleRoleConfiguration === 'toggle' ) {
        this.setPDOMAttribute( 'aria-pressed', valueProperty.value === valueDown );
      }
      else if ( options.accessibleRoleConfiguration === 'switch' ) {
        this.setPDOMAttribute( 'aria-checked', valueProperty.value === valueDown );
      }
    };
    valueProperty.link( updateAria );

    this.disposeRoundStickyToggleButton = () => {
      valueProperty.unlink( updateAria );
      toggleButtonModel.fireCompleteEmitter.removeListener( playSound );
      toggleButtonModel.dispose();
    };
  }

  public override dispose(): void {
    this.disposeRoundStickyToggleButton();
    super.dispose();
  }
}

sun.register( 'RoundStickyToggleButton', RoundStickyToggleButton );