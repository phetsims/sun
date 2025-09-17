// Copyright 2014-2025, University of Colorado Boulder

/**
 * RectangularToggleButton is a rectangular toggle button that toggles the value of a Property between 2 values.
 * It has the same look for both values.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type Property from '../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import affirm from '../../../perennial-alias/js/browser-and-node/affirm.js';
import optionize from '../../../phet-core/js/optionize.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import sharedSoundPlayers from '../../../tambo/js/sharedSoundPlayers.js';
import type TSoundPlayer from '../../../tambo/js/TSoundPlayer.js';
import Tandem from '../../../tandem/js/Tandem.js';
import { ResolvedResponse } from '../../../utterance-queue/js/ResponsePacket.js';
import sun from '../sun.js';
import RectangularButton, { type RectangularButtonOptions } from './RectangularButton.js';
import ToggleButtonInteractionStateProperty from './ToggleButtonInteractionStateProperty.js';
import ToggleButtonModel from './ToggleButtonModel.js';

type SelfOptions = {

  // sounds to be played on toggle transitions
  valueOffSoundPlayer?: TSoundPlayer;
  valueOnSoundPlayer?: TSoundPlayer;

  accessibleContextResponseOff?: ResolvedResponse | TReadOnlyProperty<ResolvedResponse>;
  accessibleContextResponseOn?: ResolvedResponse | TReadOnlyProperty<ResolvedResponse>;
};

export type RectangularToggleButtonOptions = SelfOptions & StrictOmit<RectangularButtonOptions, 'accessibleContextResponse'>;

export default class RectangularToggleButton<T> extends RectangularButton {

  private readonly disposeRectangularToggleButton: () => void;

  /**
   * @param property - axon Property that can be either valueOff or valueOn
   * @param valueOff - value when the button is in the off state
   * @param valueOn - value when the button is in the on state
   * @param [providedOptions]
   */
  public constructor( property: Property<T>, valueOff: T, valueOn: T, providedOptions?: RectangularButtonOptions ) {
    affirm( property.valueComparisonStrategy === 'reference',
      'RectangularToggleButton depends on "===" equality for value comparison' );

    const options = optionize<RectangularToggleButtonOptions, SelfOptions, RectangularButtonOptions>()( {

      // {TSoundPlayer} - sounds to be played on toggle transitions
      valueOffSoundPlayer: sharedSoundPlayers.get( 'toggleOff' ),
      valueOnSoundPlayer: sharedSoundPlayers.get( 'toggleOn' ),

      // a11y
      accessibleContextResponseOn: null,
      accessibleContextResponseOff: null,

      // phet-io support
      tandem: Tandem.REQUIRED,
      phetioFeatured: true,

      listenerOptions: {
        tandem: Tandem.OPT_OUT // ToggleButtonModel provides a toggledEmitter which is sufficient
      }
    }, providedOptions );

    options.accessibleContextResponse = () => {

      // This is called after the property has taken the new value
      return property.value === valueOn ? options.accessibleContextResponseOn : options.accessibleContextResponseOff;
    };

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
    this.buttonModel.fireCompleteEmitter.addListener( playSounds );

    this.disposeRectangularToggleButton = () => {
      this.buttonModel.fireCompleteEmitter.removeListener( playSounds );
      toggleButtonModel.dispose();
    };
  }

  public override dispose(): void {
    this.disposeRectangularToggleButton();
    super.dispose();
  }
}

sun.register( 'RectangularToggleButton', RectangularToggleButton );