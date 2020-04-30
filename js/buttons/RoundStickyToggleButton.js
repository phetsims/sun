// Copyright 2014-2020, University of Colorado Boulder

/**
 * A round toggle button that switches the value of a property that can take on valueUp or valueDown.  It
 * sticks in the down position when pressed, popping back up when pressed
 * again.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import inherit from '../../../phet-core/js/inherit.js';
import merge from '../../../phet-core/js/merge.js';
import pushButtonSoundPlayer from '../../../tambo/js/shared-sound-players/pushButtonSoundPlayer.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import RoundButtonView from './RoundButtonView.js';
import StickyToggleButtonInteractionStateProperty from './StickyToggleButtonInteractionStateProperty.js';
import StickyToggleButtonModel from './StickyToggleButtonModel.js';
import ToggleButtonIO from './ToggleButtonIO.js';

/**
 * @param {Object} valueUp value when the toggle is in the 'up' position
 * @param {Object} valueDown value when the toggle is in the 'down' position
 * @param {Property} property axon property that can be either valueUp or valueDown.
 * @param {Object} [options]
 * @constructor
 */
function RoundStickyToggleButton( valueUp, valueDown, property, options ) {

  options = merge( {
    tandem: Tandem.REQUIRED,
    phetioType: ToggleButtonIO
  }, options );

  // @private (read-only)
  // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
  const toggleButtonModel = new StickyToggleButtonModel( valueUp, valueDown, property, options );
  const stickyToggleButtonInteractionStateProperty = new StickyToggleButtonInteractionStateProperty( toggleButtonModel );
  RoundButtonView.call( this, toggleButtonModel, stickyToggleButtonInteractionStateProperty, options );

  // sound generation
  const soundPlayer = options.soundPlayer || pushButtonSoundPlayer;
  const playSound = () => soundPlayer.play();
  toggleButtonModel.produceSoundEmitter.addListener( playSound );

  // PDOM - signify button is 'pressed' when down
  const setAriaPressed = value => this.setAccessibleAttribute( 'aria-pressed', property.value === valueDown );
  property.link( setAriaPressed );

  // @private - dispose items specific to this instance
  this.disposeRoundStickyToggleButton = function() {
    property.unlink( setAriaPressed );
    toggleButtonModel.produceSoundEmitter.removeListener( playSound );
    toggleButtonModel.dispose();
    stickyToggleButtonInteractionStateProperty.dispose();
  };
}

sun.register( 'RoundStickyToggleButton', RoundStickyToggleButton );

inherit( RoundButtonView, RoundStickyToggleButton, {
  dispose: function() {
    this.disposeRoundStickyToggleButton();
    RoundButtonView.prototype.dispose.call( this );
  }
} );

export default RoundStickyToggleButton;