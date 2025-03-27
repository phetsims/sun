// Copyright 2014-2025, University of Colorado Boulder

/**
 * A DerivedProperty that maps PushButtonModel states to the states needed by the button view.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import { DerivedProperty4, type DerivedPropertyOptions } from '../../../axon/js/DerivedProperty.js';
import { type EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import sun from '../sun.js';
import ButtonInteractionState from './ButtonInteractionState.js';
import type PushButtonModel from './PushButtonModel.js';

type SelfOptions = EmptySelfOptions;

export type PushButtonInteractionStatePropertyOptions = SelfOptions & DerivedPropertyOptions<ButtonInteractionState>;

export default class PushButtonInteractionStateProperty extends DerivedProperty4<ButtonInteractionState, boolean, boolean, boolean, boolean> {
  public constructor( buttonModel: PushButtonModel ) {
    super(
      [ buttonModel.focusedProperty, buttonModel.overProperty, buttonModel.isOverOrFocusedProperty, buttonModel.looksPressedProperty ],
      ( focused, over, overOrFocused, looksPressed ) => {
        return overOrFocused && !looksPressed ? ButtonInteractionState.OVER :
               ( over || focused ) && looksPressed ? ButtonInteractionState.PRESSED :
               ButtonInteractionState.IDLE;
      },
      { valueType: ButtonInteractionState }
    );
  }
}

sun.register( 'PushButtonInteractionStateProperty', PushButtonInteractionStateProperty );