// Copyright 2014-2021, University of Colorado Boulder

/**
 * A DerivedProperty that maps push button model states to the values needed by the button view.
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import merge from '../../../phet-core/js/merge.js';
import sun from '../sun.js';
import ButtonInteractionState from './ButtonInteractionState.js';

class PushButtonInteractionStateProperty extends DerivedProperty {

  /**
   * @param {ButtonModel} buttonModel
   * @param {Object} [options]
   */
  constructor( buttonModel, options ) {

    options = merge( {
      valueType: ButtonInteractionState
    }, options );

    super(
      [ buttonModel.focusedProperty, buttonModel.overProperty, buttonModel.looksOverProperty, buttonModel.looksPressedProperty ],
      ( focused, over, looksOver, looksPressed ) => {
        return looksOver && !looksPressed ? ButtonInteractionState.OVER :
               ( over || focused ) && looksPressed ? ButtonInteractionState.PRESSED :
               ButtonInteractionState.IDLE;
      },
      options
    );
  }
}

sun.register( 'PushButtonInteractionStateProperty', PushButtonInteractionStateProperty );
export default PushButtonInteractionStateProperty;