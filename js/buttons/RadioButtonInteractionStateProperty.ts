// Copyright 2014-2025, University of Colorado Boulder

/**
 * A DerivedProperty that maps ButtonModel states to the states needed by the radio button view.
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import { DerivedProperty5 } from '../../../axon/js/DerivedProperty.js';
import type TProperty from '../../../axon/js/TProperty.js';
import sun from '../sun.js';
import type ButtonModel from './ButtonModel.js';
import RadioButtonInteractionState from './RadioButtonInteractionState.js';

export default class RadioButtonInteractionStateProperty<T> extends DerivedProperty5<RadioButtonInteractionState, boolean, boolean, boolean, boolean, T> {

  /**
   * @param buttonModel
   * @param property - the axon Property set by the button
   * @param value - the value set by the button
   */
  public constructor( buttonModel: ButtonModel, property: TProperty<T>, value: T ) {
    super(
      [ buttonModel.focusedProperty, buttonModel.overProperty, buttonModel.isOverOrFocusedProperty, buttonModel.looksPressedProperty, property ],
      ( focused, over, overOrFocused, looksPressed, propertyValue ) => {
        const isSelected = ( propertyValue === value );
        return overOrFocused && !( looksPressed || isSelected ) ? RadioButtonInteractionState.OVER :
               ( over || focused ) && looksPressed ? RadioButtonInteractionState.PRESSED :
               isSelected ? RadioButtonInteractionState.SELECTED :
               RadioButtonInteractionState.DESELECTED;
      },
      { valueType: RadioButtonInteractionState }
    );
  }
}

sun.register( 'RadioButtonInteractionStateProperty', RadioButtonInteractionStateProperty );