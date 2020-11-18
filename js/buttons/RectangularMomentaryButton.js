// Copyright 2015-2020, University of Colorado Boulder

/**
 * RectangularMomentaryButton is a rectangular momentary button that toggles a Property between 2 values.
 * The 'off value' is the value when the button is not pressed.
 * The 'on value' is the value when the button is pressed.
 *
 * TODO: Not supported with alternative input, see https://github.com/phetsims/scenery/issues/1117
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import InstanceRegistry from '../../../phet-core/js/documentation/InstanceRegistry.js';
import merge from '../../../phet-core/js/merge.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import MomentaryButtonInteractionStateProperty from './MomentaryButtonInteractionStateProperty.js';
import MomentaryButtonModel from './MomentaryButtonModel.js';
import RectangularButton from './RectangularButton.js';

class RectangularMomentaryButton extends RectangularButton {

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
    this.disposeRectangularMomentaryButton = () => {
      buttonModel.dispose();
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'RectangularMomentaryButton', this );
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeRectangularMomentaryButton();
    super.dispose();
  }
}

sun.register( 'RectangularMomentaryButton', RectangularMomentaryButton );
export default RectangularMomentaryButton;