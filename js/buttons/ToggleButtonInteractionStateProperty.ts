// Copyright 2014-2025, University of Colorado Boulder

/**
 * A DerivedProperty that maps ToggleButtonModel states to the states needed by the button view.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { DerivedProperty2 } from '../../../axon/js/DerivedProperty.js';
import sun from '../sun.js';
import ButtonInteractionState from './ButtonInteractionState.js';
import type ToggleButtonModel from './ToggleButtonModel.js';

export default class ToggleButtonInteractionStateProperty<T> extends DerivedProperty2<ButtonInteractionState, boolean, boolean> {
  public constructor( toggleButtonModel: ToggleButtonModel<T> ) {
    super(
      [ toggleButtonModel.isOverOrFocusedProperty, toggleButtonModel.looksPressedProperty ],
      ( overOrFocused, looksPressed ) => {
        return overOrFocused && !looksPressed ? ButtonInteractionState.OVER :
               looksPressed ? ButtonInteractionState.PRESSED :
               ButtonInteractionState.IDLE;
      },
      { valueType: ButtonInteractionState }
    );
  }
}

sun.register( 'ToggleButtonInteractionStateProperty', ToggleButtonInteractionStateProperty );