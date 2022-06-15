// Copyright 2014-2022, University of Colorado Boulder

/**
 * A DerivedProperty that maps PushButtonModel states to the states needed by the button view.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import { DerivedProperty4, DerivedPropertyOptions } from '../../../axon/js/DerivedProperty.js';
import EmptyObjectType from '../../../phet-core/js/types/EmptyObjectType.js';
import sun from '../sun.js';
import ButtonInteractionState from './ButtonInteractionState.js';
import PushButtonModel from './PushButtonModel.js';

type SelfOptions = EmptyObjectType;

export type PushButtonInteractionStatePropertyOptions = SelfOptions & DerivedPropertyOptions<ButtonInteractionState>;

export default class PushButtonInteractionStateProperty extends DerivedProperty4<ButtonInteractionState, boolean, boolean, boolean, boolean> {
  public constructor( buttonModel: PushButtonModel ) {
    super(
      [ buttonModel.focusedProperty, buttonModel.overProperty, buttonModel.looksOverProperty, buttonModel.looksPressedProperty ],
      ( focused, over, looksOver, looksPressed ) => {
        return looksOver && !looksPressed ? ButtonInteractionState.OVER :
               ( over || focused ) && looksPressed ? ButtonInteractionState.PRESSED :
               ButtonInteractionState.IDLE;
      },
      { valueType: ButtonInteractionState }
    );
  }
}

sun.register( 'PushButtonInteractionStateProperty', PushButtonInteractionStateProperty );