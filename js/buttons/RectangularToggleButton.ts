// Copyright 2014-2024, University of Colorado Boulder

/**
 * RectangularToggleButton is a rectangular toggle button that toggles the value of a Property between 2 values.
 * It has the same look for both values.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import optionize from '../../../phet-core/js/optionize.js';
import sharedSoundPlayers from '../../../tambo/js/sharedSoundPlayers.js';
import TSoundPlayer from '../../../tambo/js/TSoundPlayer.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import RectangularButton, { RectangularButtonOptions } from './RectangularButton.js';
import ToggleButtonInteractionStateProperty from './ToggleButtonInteractionStateProperty.js';
import ToggleButtonModel from './ToggleButtonModel.js';

type SelfOptions = {

  // sounds to be played on toggle transitions
  valueOffSoundPlayer?: TSoundPlayer;
  valueOnSoundPlayer?: TSoundPlayer;
};

export type RectangularToggleButtonOptions = SelfOptions & RectangularButtonOptions;

export default class RectangularToggleButton<T> extends RectangularButton {

  private readonly disposeRectangularToggleButton: () => void;

  /**
   * @param property - axon Property that can be either valueOff or valueOn
   * @param valueOff - value when the button is in the off state
   * @param valueOn - value when the button is in the on state
   * @param [providedOptions]
   */
  public constructor( property: Property<T>, valueOff: T, valueOn: T, providedOptions?: RectangularButtonOptions ) {
    assert && assert( property.valueComparisonStrategy === 'reference',
      'RectangularToggleButton depends on "===" equality for value comparison' );

    const options = optionize<RectangularToggleButtonOptions, SelfOptions, RectangularButtonOptions>()( {

      // {TSoundPlayer} - sounds to be played on toggle transitions
      valueOffSoundPlayer: sharedSoundPlayers.get( 'toggleOff' ),
      valueOnSoundPlayer: sharedSoundPlayers.get( 'toggleOn' ),

      // phet-io support
      tandem: Tandem.REQUIRED,
      phetioFeatured: true
    }, providedOptions );

    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    const toggleButtonModel = new ToggleButtonModel( valueOff, valueOn, property, options );
    const toggleButtonInteractionStateProperty = new ToggleButtonInteractionStateProperty( toggleButtonModel );

    super( toggleButtonModel, toggleButtonInteractionStateProperty, options );

    this.addLinkedElement( property, {
      tandemName: 'property'
    } );

    // sound generation
    const playSounds = () => {
      if ( property.value === valueOff ) {
        options.valueOffSoundPlayer.play();
      }
      else if ( property.value === valueOn ) {
        options.valueOnSoundPlayer.play();
      }
    };
    this.buttonModel.produceSoundEmitter.addListener( playSounds );

    this.disposeRectangularToggleButton = () => {
      this.buttonModel.produceSoundEmitter.removeListener( playSounds );
      toggleButtonModel.dispose();
    };
  }

  public override dispose(): void {
    this.disposeRectangularToggleButton();
    super.dispose();
  }
}

sun.register( 'RectangularToggleButton', RectangularToggleButton );