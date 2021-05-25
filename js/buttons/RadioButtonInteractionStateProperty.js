// Copyright 2014-2021, University of Colorado Boulder

/**
 * A DerivedProperty that maps radio button group member model states to the values needed by the button view.
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import sun from '../sun.js';
import RadioButtonInteractionState from './RadioButtonInteractionState.js';

class RadioButtonInteractionStateProperty extends DerivedProperty {

  /**
   * @param {ButtonModel} buttonModel
   * @param {Property.<Object>} property - the axon Property set by the button
   * @param {Object} value - the value set by the button
   */
  constructor( buttonModel, property, value ) {

    const options = { valueType: RadioButtonInteractionState };

    super(
      [ buttonModel.focusedProperty, buttonModel.overProperty, buttonModel.looksOverProperty, buttonModel.looksPressedProperty, property ],
      ( focused, over, looksOver, looksPressed, propertyValue ) => {
        const isSelected = ( propertyValue === value );
        return looksOver && !( looksPressed || isSelected ) ? RadioButtonInteractionState.OVER :
               ( over || focused ) && looksPressed ? RadioButtonInteractionState.PRESSED :
               isSelected ? RadioButtonInteractionState.SELECTED :
               RadioButtonInteractionState.DESELECTED;
      },
      options
    );
  }
}

sun.register( 'RadioButtonInteractionStateProperty', RadioButtonInteractionStateProperty );
export default RadioButtonInteractionStateProperty;