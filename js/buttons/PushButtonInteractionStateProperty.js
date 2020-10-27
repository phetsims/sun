// Copyright 2014-2020, University of Colorado Boulder

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
      isValidValue: value => ButtonInteractionState.includes( value )
    }, options );

    super(
      [ buttonModel.overProperty, buttonModel.looksPressedProperty ],
      ( over, looksPressed ) => {
        return over && !looksPressed ? ButtonInteractionState.OVER :
               over && looksPressed ? ButtonInteractionState.PRESSED :
               ButtonInteractionState.IDLE;
      },
      options
    );
  }
}

sun.register( 'PushButtonInteractionStateProperty', PushButtonInteractionStateProperty );
export default PushButtonInteractionStateProperty;