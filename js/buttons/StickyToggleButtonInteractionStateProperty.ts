// Copyright 2014-2022, University of Colorado Boulder

/**
 * A DerivedProperty that maps StickyToggleButtonModel states to the states needed by the button view.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import { DerivedProperty5 } from '../../../axon/js/DerivedProperty.js';
import sun from '../sun.js';
import ButtonInteractionState from './ButtonInteractionState.js';
import StickyToggleButtonModel from './StickyToggleButtonModel.js';

export default class StickyToggleButtonInteractionStateProperty<T> extends DerivedProperty5<ButtonInteractionState, boolean, boolean, boolean, boolean, T> {
  public constructor( buttonModel: StickyToggleButtonModel<T> ) {
    super(
      [ buttonModel.focusedProperty, buttonModel.overProperty, buttonModel.looksOverProperty,
        buttonModel.looksPressedProperty, buttonModel.valueProperty ],
      ( focused, over, looksOver, looksPressed, propertyValue ) => {
        const isValueDown = ( propertyValue === buttonModel.valueDown );
        return looksOver && !( looksPressed || isValueDown ) ? ButtonInteractionState.OVER :
               ( over || focused ) && ( looksPressed || isValueDown ) ? ButtonInteractionState.PRESSED :
               isValueDown ? ButtonInteractionState.PRESSED :
               ButtonInteractionState.IDLE;
      },
      { valueType: ButtonInteractionState }
    );
  }
}

sun.register( 'StickyToggleButtonInteractionStateProperty', StickyToggleButtonInteractionStateProperty );