// Copyright 2014-2020, University of Colorado Boulder

/**
 * A derived property that maps push button model states to the values needed by the button view.
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import sun from '../sun.js';
import ButtonInteractionState from './ButtonInteractionState.js';

class PushButtonInteractionStateProperty extends DerivedProperty {

  /**
   * @param {ButtonModel} buttonModel
   * @param {Object} [options]
   */
  constructor( buttonModel, options ) {
    super( [ buttonModel.overProperty, buttonModel.looksPressedProperty, buttonModel.enabledProperty ],
      ( over, looksPressed, enabled ) => {
        return !enabled ? ButtonInteractionState.DISABLED :
               over && !looksPressed ? ButtonInteractionState.OVER :
               over && looksPressed ? ButtonInteractionState.PRESSED :
               ButtonInteractionState.IDLE;
      }, options );
  }
}

sun.register( 'PushButtonInteractionStateProperty', PushButtonInteractionStateProperty );
export default PushButtonInteractionStateProperty;