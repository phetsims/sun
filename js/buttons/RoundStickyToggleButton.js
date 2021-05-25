// Copyright 2014-2021, University of Colorado Boulder

/**
 * RoundStickyToggleButton is a round toggle button that toggles the value of a Property between 2 values.
 * It has a different look (referred to as 'up' and 'down') for the 2 values.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import pushButtonSoundPlayer from '../../../tambo/js/shared-sound-players/pushButtonSoundPlayer.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import RoundButton from './RoundButton.js';
import StickyToggleButtonInteractionStateProperty from './StickyToggleButtonInteractionStateProperty.js';
import StickyToggleButtonModel from './StickyToggleButtonModel.js';
import ToggleButtonIO from './ToggleButtonIO.js';

class RoundStickyToggleButton extends RoundButton {

  /**
   * @param {Object} valueUp value when the toggle is in the 'up' position
   * @param {Object} valueDown value when the toggle is in the 'down' position
   * @param {Property} property axon Property that can be either valueUp or valueDown.
   * @param {Object} [options]
   */
  constructor( valueUp, valueDown, property, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED,
      phetioType: ToggleButtonIO
    }, options );

    // @private (read-only)
    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    const toggleButtonModel = new StickyToggleButtonModel( valueUp, valueDown, property, options );
    const stickyToggleButtonInteractionStateProperty = new StickyToggleButtonInteractionStateProperty( toggleButtonModel );

    super( toggleButtonModel, stickyToggleButtonInteractionStateProperty, options );

    // sound generation
    const soundPlayer = options.soundPlayer || pushButtonSoundPlayer;
    const playSound = () => soundPlayer.play();
    toggleButtonModel.produceSoundEmitter.addListener( playSound );

    // pdom - signify button is 'pressed' when down
    const setAriaPressed = value => this.setPDOMAttribute( 'aria-pressed', property.value === valueDown );
    property.link( setAriaPressed );

    // @private - dispose items specific to this instance
    this.disposeRoundStickyToggleButton = () => {
      property.unlink( setAriaPressed );
      toggleButtonModel.produceSoundEmitter.removeListener( playSound );
      toggleButtonModel.dispose();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeRoundStickyToggleButton();
    super.dispose();
  }
}

sun.register( 'RoundStickyToggleButton', RoundStickyToggleButton );
export default RoundStickyToggleButton;