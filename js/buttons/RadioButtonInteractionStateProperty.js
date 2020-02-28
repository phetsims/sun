// Copyright 2014-2020, University of Colorado Boulder

/**
 * A derived property that maps radio button group member model states to the values needed by the button view.
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

    super( [ buttonModel.overProperty, buttonModel.looksPressedProperty, buttonModel.enabledProperty, property ],
      ( over, looksPressed, enabled, propertyValue ) => {
        const isSelected = ( propertyValue === value );
        return !enabled && isSelected ? RadioButtonInteractionState.DISABLED_SELECTED :
               !enabled ? RadioButtonInteractionState.DISABLED_DESELECTED :
               over && !( looksPressed || isSelected ) ? RadioButtonInteractionState.OVER :
               over && looksPressed ? RadioButtonInteractionState.PRESSED :
               isSelected ? RadioButtonInteractionState.SELECTED :
               RadioButtonInteractionState.DESELECTED;
      } );
  }
}

sun.register( 'RadioButtonInteractionStateProperty', RadioButtonInteractionStateProperty );
export default RadioButtonInteractionStateProperty;