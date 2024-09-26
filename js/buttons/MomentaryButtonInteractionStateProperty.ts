// Copyright 2014-2024, University of Colorado Boulder

/**
 * A DerivedProperty that maps MomentaryButtonModel states to the states needed by the button view.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { DerivedProperty3 } from '../../../axon/js/DerivedProperty.js';
import sun from '../sun.js';
import ButtonInteractionState from './ButtonInteractionState.js';
import MomentaryButtonModel from './MomentaryButtonModel.js';

export default class MomentaryButtonInteractionStateProperty<T> extends DerivedProperty3<ButtonInteractionState, boolean, boolean, T> {
  public constructor( buttonModel: MomentaryButtonModel<T> ) {
    super(
      [ buttonModel.looksOverProperty, buttonModel.looksPressedProperty, buttonModel.valueProperty ],
      ( looksOver, looksPressed, buttonValue ) => {
        const pressedOrLooksPressed = ( buttonValue === buttonModel.valueOn ) || looksPressed;
        return looksOver && !pressedOrLooksPressed ? ButtonInteractionState.OVER :
               pressedOrLooksPressed ? ButtonInteractionState.PRESSED :  // remain pressed regardless of whether 'over' is true
               ButtonInteractionState.IDLE;
      },
      { valueType: ButtonInteractionState }
    );
  }
}

sun.register( 'MomentaryButtonInteractionStateProperty', MomentaryButtonInteractionStateProperty );