// Copyright 2014-2022, University of Colorado Boulder

/**
 * A DerivedProperty that maps ToggleButtonModel states to the states needed by the button view.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { DerivedProperty2 } from '../../../axon/js/DerivedProperty.js';
import sun from '../sun.js';
import ButtonInteractionState from './ButtonInteractionState.js';
import ToggleButtonModel from './ToggleButtonModel.js';

export default class ToggleButtonInteractionStateProperty<T> extends DerivedProperty2<ButtonInteractionState, boolean, boolean> {
  public constructor( toggleButtonModel: ToggleButtonModel<T> ) {
    super(
      [ toggleButtonModel.looksOverProperty, toggleButtonModel.looksPressedProperty ],
      ( looksOver, looksPressed ) => {
        return looksOver && !looksPressed ? ButtonInteractionState.OVER :
               looksPressed ? ButtonInteractionState.PRESSED :
               ButtonInteractionState.IDLE;
      },
      { valueType: ButtonInteractionState }
    );
  }
}

sun.register( 'ToggleButtonInteractionStateProperty', ToggleButtonInteractionStateProperty );