// Copyright 2014-2022, University of Colorado Boulder

/**
 * A DerivedProperty that maps ToggleButtonModel states to the states needed by the button view.
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import sun from '../sun.js';
import ButtonInteractionState from './ButtonInteractionState.js';
import ToggleButtonModel from './ToggleButtonModel.js';

export default class ToggleButtonInteractionStateProperty<T> extends DerivedProperty<ButtonInteractionState, [ boolean, boolean ]> {
  constructor( toggleButtonModel: ToggleButtonModel<T> ) {
    super(
      [ toggleButtonModel.looksOverProperty, toggleButtonModel.looksPressedProperty ],
      ( looksOver: boolean, looksPressed: boolean ) => {
        return looksOver && !looksPressed ? ButtonInteractionState.OVER :
               looksPressed ? ButtonInteractionState.PRESSED :
               ButtonInteractionState.IDLE;
      },
      { valueType: ButtonInteractionState }
    );
  }
}

sun.register( 'ToggleButtonInteractionStateProperty', ToggleButtonInteractionStateProperty );