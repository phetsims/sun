// Copyright 2014-2020, University of Colorado Boulder

/**
 * A rectangular toggle button that switches the value of a property between 2 values.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import inherit from '../../../phet-core/js/inherit.js';
import merge from '../../../phet-core/js/merge.js';
import toggleOffSoundPlayer from '../../../tambo/js/shared-sound-players/toggleOffSoundPlayer.js';
import toggleOnSoundPlayer from '../../../tambo/js/shared-sound-players/toggleOnSoundPlayer.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import RectangularButtonView from './RectangularButtonView.js';
import ToggleButtonInteractionStateProperty from './ToggleButtonInteractionStateProperty.js';
import ToggleButtonIO from './ToggleButtonIO.js';
import ToggleButtonModel from './ToggleButtonModel.js';

/**
 * @param {Object} valueOff - value when the button is in the off state
 * @param {Object} valueOn - value when the button is in the on state
 * @param {Property} property - axon Property that can be either valueOff or valueOn
 * @param {Object} [options]
 * @constructor
 */
function RectangularToggleButton( valueOff, valueOn, property, options ) {

  options = merge( {

    // {Playable|null} - sounds to be played on toggle transitions, use Playable.NO_SOUND to disable
    valueOffSoundPlayer: null,
    valueOnSoundPlayer: null,

    // phet-io support
    tandem: Tandem.REQUIRED,
    phetioType: ToggleButtonIO
  }, options );

  // @public (phet-io)
  // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
  this.toggleButtonModel = new ToggleButtonModel( valueOff, valueOn, property, options );
  const toggleButtonInteractionStateProperty = new ToggleButtonInteractionStateProperty( this.toggleButtonModel );
  RectangularButtonView.call( this, this.toggleButtonModel, toggleButtonInteractionStateProperty, options );

  this.addLinkedElement( property, {
    tandem: options.tandem.createTandem( 'property' )
  } );

  // sound generation
  const valueOffSoundPlayer = options.valueOffSoundPlayer || toggleOffSoundPlayer;
  const valueOnSoundPlayer = options.valueOnSoundPlayer || toggleOnSoundPlayer;
  const playSounds = () => {
    if ( property.value === valueOff ) {
      valueOffSoundPlayer.play();
    }
    else if ( property.value === valueOn ) {
      valueOnSoundPlayer.play();
    }
  };
  this.buttonModel.produceSoundEmitter.addListener( playSounds );

  // @private
  this.disposeRectangularToggleButton = function() {
    this.toggleButtonModel.dispose();
    this.buttonModel.produceSoundEmitter.removeListener( playSounds );
    toggleButtonInteractionStateProperty.dispose();
  };
}

sun.register( 'RectangularToggleButton', RectangularToggleButton );

inherit( RectangularButtonView, RectangularToggleButton, {

  /**
   * @public
   */
  dispose: function() {
    this.disposeRectangularToggleButton();
    RectangularButtonView.prototype.dispose.call( this );
  }
} );

export default RectangularToggleButton;