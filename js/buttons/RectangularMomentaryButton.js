// Copyright 2015-2020, University of Colorado Boulder

/**
 * A rectangular momentary button: on when pressed, off when released.
 * This is the file in which the view (appearance) and model (behavior) are brought together.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import InstanceRegistry from '../../../phet-core/js/documentation/InstanceRegistry.js';
import inherit from '../../../phet-core/js/inherit.js';
import merge from '../../../phet-core/js/merge.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import MomentaryButtonInteractionStateProperty from './MomentaryButtonInteractionStateProperty.js';
import MomentaryButtonModel from './MomentaryButtonModel.js';
import RectangularButtonView from './RectangularButtonView.js';

/**
 * @param {Object} valueOff - value when the button is in the off state
 * @param {Object} valueOn - value when the button is in the on state
 * @param {Property} property
 * @param {Object} [options]
 * @constructor
 */
function RectangularMomentaryButton( valueOff, valueOn, property, options ) {

  options = merge( {
    tandem: Tandem.REQUIRED
  }, options );

  // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
  const buttonModel = new MomentaryButtonModel( valueOff, valueOn, property, options );
  RectangularButtonView.call( this, buttonModel, new MomentaryButtonInteractionStateProperty( buttonModel ), options );

  // support for binder documentation, stripped out in builds and only runs when ?binder is specified
  assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'AccordionBox', this );
}

sun.register( 'RectangularMomentaryButton', RectangularMomentaryButton );

inherit( RectangularButtonView, RectangularMomentaryButton );
export default RectangularMomentaryButton;