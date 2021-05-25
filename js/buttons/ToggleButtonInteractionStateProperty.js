// Copyright 2014-2021, University of Colorado Boulder

/**
 * A DerivedProperty that maps sticky toggle button model states to the values needed by the button view.
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import sun from '../sun.js';
import ButtonInteractionState from './ButtonInteractionState.js';

class ToggleButtonInteractionStateProperty extends DerivedProperty {

  /**
   * @param {ButtonModel} buttonModel
   */
  constructor( buttonModel ) {

    const options = { valueType: ButtonInteractionState };

    super(
      [ buttonModel.looksOverProperty, buttonModel.looksPressedProperty ],
      ( looksOver, looksPressed ) => {
        return looksOver && !looksPressed ? ButtonInteractionState.OVER :
               looksPressed ? ButtonInteractionState.PRESSED :
               ButtonInteractionState.IDLE;
      },
      options
    );
  }
}

sun.register( 'ToggleButtonInteractionStateProperty', ToggleButtonInteractionStateProperty );
export default ToggleButtonInteractionStateProperty;