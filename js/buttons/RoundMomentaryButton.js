// Copyright 2015-2020, University of Colorado Boulder

/**
 * A round momentary button: on when pressed, off when released.
 * This is the file in which the view (appearance) and model (behavior) are brought together.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../phet-core/js/merge.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Tandem from '../../../tandem/js/Tandem.js';
import IOType from '../../../tandem/js/types/IOType.js';
import sun from '../sun.js';
import MomentaryButtonInteractionStateProperty from './MomentaryButtonInteractionStateProperty.js';
import MomentaryButtonModel from './MomentaryButtonModel.js';
import RoundButtonView from './RoundButtonView.js';

class RoundMomentaryButton extends RoundButtonView {

  /**
   * @param {Object} valueOff - value when the button is in the off state
   * @param {Object} valueOn - value when the button is in the on state
   * @param {Property} property
   * @param {Object} [options]
   */
  constructor( valueOff, valueOn, property, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED,
      phetioType: RoundMomentaryButton.RoundMomentaryButtonIO
    }, options );

    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    const buttonModel = new MomentaryButtonModel( valueOff, valueOn, property, options );

    super( buttonModel, new MomentaryButtonInteractionStateProperty( buttonModel ), options );

    // @public
    this.buttonModel = buttonModel;
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.buttonModel.dispose(); //TODO fails with assertions enable, see sun#212
    super.dispose();
  }
}

RoundMomentaryButton.RoundMomentaryButtonIO = new IOType( 'RoundMomentaryButtonIO', {
  valueType: RoundMomentaryButton,
  supertype: Node.NodeIO,
  documentation: 'Button that performs an action while it is being pressed, and stops the action when released',
  events: [ 'pressed', 'released', 'releasedDisabled' ]
} );

sun.register( 'RoundMomentaryButton', RoundMomentaryButton );
export default RoundMomentaryButton;