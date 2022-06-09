// Copyright 2014-2022, University of Colorado Boulder

/**
 * A DerivedProperty that maps MomentaryButtonModel states to the states needed by the button view.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { DerivedProperty2 } from '../../../axon/js/DerivedProperty.js';
import sun from '../sun.js';
import ButtonInteractionState from './ButtonInteractionState.js';
import MomentaryButtonModel from './MomentaryButtonModel.js';

export default class MomentaryButtonInteractionStateProperty<T> extends DerivedProperty2<ButtonInteractionState, boolean, boolean> {
  public constructor( buttonModel: MomentaryButtonModel<T> ) {
    super(
      [ buttonModel.looksOverProperty, buttonModel.looksPressedProperty ],
      ( looksOver, looksPressed ) => {
        return looksOver && !looksPressed ? ButtonInteractionState.OVER :
               looksPressed ? ButtonInteractionState.PRESSED :  // remain pressed regardless of whether 'over' is true
               ButtonInteractionState.IDLE;
      },
      { valueType: ButtonInteractionState }
    );
  }
}

sun.register( 'MomentaryButtonInteractionStateProperty', MomentaryButtonInteractionStateProperty );