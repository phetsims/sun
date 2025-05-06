// Copyright 2014-2025, University of Colorado Boulder

/**
 * RoundToggleButton is a round toggle button that toggles the value of a Property between 2 values.
 * It has the same look for both values.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type Property from '../../../axon/js/Property.js';
import optionize from '../../../phet-core/js/optionize.js';
import sharedSoundPlayers from '../../../tambo/js/sharedSoundPlayers.js';
import type TSoundPlayer from '../../../tambo/js/TSoundPlayer.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import SunUtil from '../SunUtil.js';
import RoundButton, { type RoundButtonOptions } from './RoundButton.js';
import ToggleButtonInteractionStateProperty from './ToggleButtonInteractionStateProperty.js';
import ToggleButtonModel from './ToggleButtonModel.js';

type SelfOptions = {

  // sounds to be played on toggle transitions
  valueOffSoundPlayer?: TSoundPlayer;
  valueOnSoundPlayer?: TSoundPlayer;
};

export type RoundToggleButtonOptions = SelfOptions & RoundButtonOptions;

export default class RoundToggleButton<T> extends RoundButton {

  private readonly disposeRoundToggleButton: () => void;

  /**
   * @param property - axon Property that can be either valueOff or valueOn
   * @param valueOff - value when the button is in the off state
   * @param valueOn - value when the button is in the on state
   * @param providedOptions?
   */
  public constructor( property: Property<T>, valueOff: T, valueOn: T, providedOptions?: RoundToggleButtonOptions ) {
    assert && assert( property.valueComparisonStrategy === 'reference',
      'RoundToggleButton depends on "===" equality for value comparison' );

    const options = optionize<RoundToggleButtonOptions, SelfOptions, RoundButtonOptions>()( {

      // SelfOptions
      valueOffSoundPlayer: sharedSoundPlayers.get( 'toggleOff' ),
      valueOnSoundPlayer: sharedSoundPlayers.get( 'toggleOn' ),

      // phet-io support
      tandem: Tandem.REQUIRED,
      phetioFeatured: true,

      listenerOptions: {
        tandem: Tandem.OPT_OUT // ToggleButtonModel provides a toggledEmitter which is sufficient
      }
    }, providedOptions );

    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    const toggleButtonModel = new ToggleButtonModel( valueOff, valueOn, property, options );
    const toggleButtonInteractionStateProperty = new ToggleButtonInteractionStateProperty( toggleButtonModel );

    super( toggleButtonModel, toggleButtonInteractionStateProperty, options );

    this.addLinkedElement( property, {
      tandemName: 'property'
    } );

    assert && SunUtil.validateLinkedElementInstrumentation( this, property );

    // sound generation
    const playSounds = () => {
      if ( property.value === valueOff ) {
        options.valueOffSoundPlayer.play();
      }
      else if ( property.value === valueOn ) {
        options.valueOnSoundPlayer.play();
      }
    };
    this.buttonModel.fireCompleteEmitter.addListener( playSounds );

    this.disposeRoundToggleButton = () => {
      this.buttonModel.fireCompleteEmitter.removeListener( playSounds );
      toggleButtonModel.dispose();
    };
  }

  public override dispose(): void {
    this.disposeRoundToggleButton();
    super.dispose();
  }
}

sun.register( 'RoundToggleButton', RoundToggleButton );