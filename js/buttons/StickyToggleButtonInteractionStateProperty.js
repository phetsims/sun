// Copyright 2014-2021, University of Colorado Boulder

/**
 * A DerivedProperty the maps sticky toggle button model states to the values needed by the button view.
 *
 * @author John Blanco
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import sun from '../sun.js';
import ButtonInteractionState from './ButtonInteractionState.js';

class StickyToggleButtonInteractionStateProperty extends DerivedProperty {

  /**
   * @param {ButtonModel} buttonModel
   * @constructor
   */
  constructor( buttonModel ) {

    const options = { valueType: ButtonInteractionState };

    super(
      [ buttonModel.focusedProperty, buttonModel.overProperty, buttonModel.looksOverProperty, buttonModel.looksPressedProperty, buttonModel.valueProperty ],
      ( focused, over, looksOver, looksPressed, propertyValue ) => {
        const isValueDown = ( propertyValue === buttonModel.valueDown );
        return looksOver && !( looksPressed || isValueDown ) ? ButtonInteractionState.OVER :
               ( over || focused ) && ( looksPressed || isValueDown ) ? ButtonInteractionState.PRESSED :
               isValueDown ? ButtonInteractionState.PRESSED :
               ButtonInteractionState.IDLE;
      },
      options
    );
  }
}

sun.register( 'StickyToggleButtonInteractionStateProperty', StickyToggleButtonInteractionStateProperty );
export default StickyToggleButtonInteractionStateProperty;