// Copyright 2015-2020, University of Colorado Boulder

/**
 * A round momentary button: on when pressed, off when released.
 * This is the file in which the view (appearance) and model (behavior) are brought together.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import inherit from '../../../phet-core/js/inherit.js';
import merge from '../../../phet-core/js/merge.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import MomentaryButtonInteractionStateProperty from './MomentaryButtonInteractionStateProperty.js';
import MomentaryButtonModel from './MomentaryButtonModel.js';
import RoundButtonView from './RoundButtonView.js';
import RoundMomentaryButtonIO from './RoundMomentaryButtonIO.js';

/**
 * @param {Object} valueOff - value when the button is in the off state
 * @param {Object} valueOn - value when the button is in the on state
 * @param {Property} property
 * @param {Object} [options]
 * @constructor
 */
function RoundMomentaryButton( valueOff, valueOn, property, options ) {
  options = merge( {
    tandem: Tandem.REQUIRED,
    phetioType: RoundMomentaryButtonIO
  }, options );

  // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
  this.buttonModel = new MomentaryButtonModel( valueOff, valueOn, property, options );
  RoundButtonView.call( this, this.buttonModel, new MomentaryButtonInteractionStateProperty( this.buttonModel ), options );
}

sun.register( 'RoundMomentaryButton', RoundMomentaryButton );

inherit( RoundButtonView, RoundMomentaryButton, {

  // @public
  dispose: function() {
    this.buttonModel.dispose(); //TODO fails with assertions enable, see sun#212
    RoundButtonView.prototype.dispose.call( this );
  }
} );

export default RoundMomentaryButton;