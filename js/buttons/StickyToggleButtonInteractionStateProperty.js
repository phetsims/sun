// Copyright 2014-2020, University of Colorado Boulder

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

    const options = {
      isValidValue: value => ButtonInteractionState.includes( value )
    };

    super(
      [ buttonModel.overProperty, buttonModel.looksPressedProperty, buttonModel.valueProperty ],
      ( over, looksPressed, propertyValue ) => {
        const isValueDown = ( propertyValue === buttonModel.valueDown );
        return over && !( looksPressed || isValueDown ) ? ButtonInteractionState.OVER :
               over && ( looksPressed || isValueDown ) ? ButtonInteractionState.PRESSED :
               isValueDown ? ButtonInteractionState.PRESSED :
               ButtonInteractionState.IDLE;
      },
      options
    );
  }
}

sun.register( 'StickyToggleButtonInteractionStateProperty', StickyToggleButtonInteractionStateProperty );
export default StickyToggleButtonInteractionStateProperty;