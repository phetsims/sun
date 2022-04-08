// Copyright 2014-2021, University of Colorado Boulder

/**
 * A DerivedProperty that maps PushButtonModel states to the states needed by the button view.
 */

import DerivedProperty, { DerivedPropertyOptions } from '../../../axon/js/DerivedProperty.js';
import sun from '../sun.js';
import ButtonInteractionState from './ButtonInteractionState.js';
import PushButtonModel from './PushButtonModel.js';

type SelfOptions = {};

export type PushButtonInteractionStatePropertyOptions = SelfOptions & DerivedPropertyOptions<ButtonInteractionState>;

class PushButtonInteractionStateProperty extends DerivedProperty<ButtonInteractionState, [ boolean, boolean, boolean, boolean ]> {
  constructor( buttonModel: PushButtonModel ) {
    super(
      [ buttonModel.focusedProperty, buttonModel.overProperty, buttonModel.looksOverProperty, buttonModel.looksPressedProperty ],
      ( focused: boolean, over: boolean, looksOver: boolean, looksPressed: boolean ) => {
        return looksOver && !looksPressed ? ButtonInteractionState.OVER :
               ( over || focused ) && looksPressed ? ButtonInteractionState.PRESSED :
               ButtonInteractionState.IDLE;
      },
      { valueType: ButtonInteractionState }
    );
  }
}

sun.register( 'PushButtonInteractionStateProperty', PushButtonInteractionStateProperty );
export default PushButtonInteractionStateProperty;