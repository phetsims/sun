// Copyright 2015-2020, University of Colorado Boulder

/**
 * RoundMomentaryButton is a round momentary button that toggles a Property between 2 values.
 * The 'off value' is the value when the button is not pressed.
 * The 'on value' is the value when the button is pressed.
 *
 * TODO: Not supported with alternative input, see https://github.com/phetsims/scenery/issues/1117
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../phet-core/js/merge.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import MomentaryButtonInteractionStateProperty from './MomentaryButtonInteractionStateProperty.js';
import MomentaryButtonModel from './MomentaryButtonModel.js';
import RoundButton from './RoundButton.js';

class RoundMomentaryButton extends RoundButton {

  /**
   * @param {Object} valueOff - value when the button is in the off state
   * @param {Object} valueOn - value when the button is in the on state
   * @param {Property} property
   * @param {Object} [options]
   */
  constructor( valueOff, valueOn, property, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED
    }, options );

    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    const buttonModel = new MomentaryButtonModel( valueOff, valueOn, property, options );

    super( buttonModel, new MomentaryButtonInteractionStateProperty( buttonModel ), options );

    // @private
    this.disposeRoundMomentaryButton = () => {
      buttonModel.dispose();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeRoundMomentaryButton();
    super.dispose();
  }
}

sun.register( 'RoundMomentaryButton', RoundMomentaryButton );
export default RoundMomentaryButton;