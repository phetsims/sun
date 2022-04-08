// Copyright 2014-2021, University of Colorado Boulder

/**
 * A DerivedProperty that maps momentary button model states to the values needed by the button view.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import sun from '../sun.js';
import ButtonInteractionState from './ButtonInteractionState.js';

class MomentaryButtonInteractionStateProperty extends DerivedProperty {

  /**
   * @param {ButtonModel} buttonModel
   */
  constructor( buttonModel ) {

    const options = { valueType: ButtonInteractionState };

    super(
      [ buttonModel.looksOverProperty, buttonModel.looksPressedProperty ],
      ( looksOver, looksPressed ) => {
        return looksOver && !looksPressed ? ButtonInteractionState.OVER :
               looksPressed ? ButtonInteractionState.PRESSED :  // remain pressed regardless of whether 'over' is true
               ButtonInteractionState.IDLE;
      },
      options
    );
  }
}

sun.register( 'MomentaryButtonInteractionStateProperty', MomentaryButtonInteractionStateProperty );
export default MomentaryButtonInteractionStateProperty;