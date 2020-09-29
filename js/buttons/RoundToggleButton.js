// Copyright 2014-2020, University of Colorado Boulder

/**
 * A round toggle button that switches the value of a property between 2 values.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import toggleOffSoundPlayer from '../../../tambo/js/shared-sound-players/toggleOffSoundPlayer.js';
import toggleOnSoundPlayer from '../../../tambo/js/shared-sound-players/toggleOnSoundPlayer.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import RoundButtonView from './RoundButtonView.js';
import ToggleButtonInteractionStateProperty from './ToggleButtonInteractionStateProperty.js';
import ToggleButtonIO from './ToggleButtonIO.js';
import ToggleButtonModel from './ToggleButtonModel.js';

class RoundToggleButton extends RoundButtonView {

  /**
   * @param {Object} valueOff - value when the button is in the off state
   * @param {Object} valueOn - value when the button is in the on state
   * @param {Property} property - axon Property that can be either valueOff or valueOn
   * @param {Object} [options]
   */
  constructor( valueOff, valueOn, property, options ) {

    options = merge( {

      // {Playable} - sounds to be played on toggle transitions
      valueOffSoundPlayer: toggleOffSoundPlayer,
      valueOnSoundPlayer: toggleOnSoundPlayer,

      // phet-io support
      tandem: Tandem.REQUIRED,
      phetioType: ToggleButtonIO
    }, options );

    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    const toggleButtonModel = new ToggleButtonModel( valueOff, valueOn, property, options );
    const toggleButtonInteractionStateProperty = new ToggleButtonInteractionStateProperty( toggleButtonModel );

    super( toggleButtonModel, toggleButtonInteractionStateProperty, options );

    this.addLinkedElement( property, {
      tandem: options.tandem.createTandem( 'property' )
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

    // @private
    this.disposeRoundToggleButton = () => {
      this.toggleButtonModel.dispose();
      this.buttonModel.produceSoundEmitter.removeListener( playSounds );
      toggleButtonInteractionStateProperty.dispose();
    };

    // @public (phet-io)
    this.toggleButtonModel = toggleButtonModel;
  }

  /**
   * @public
   */
  dispose() {
    this.disposeRoundToggleButton();
    super.dispose();
  }
}

sun.register( 'RoundToggleButton', RoundToggleButton );
export default RoundToggleButton;