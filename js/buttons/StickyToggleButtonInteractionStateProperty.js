// Copyright 2014-2020, University of Colorado Boulder

/**
 * A derived property the maps sticky toggle button model states to the values needed by the button view.
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import sun from '../sun.js';
import ButtonInteractionState from './ButtonInteractionState.js';

class StickyToggleButtonInteractionStateProperty extends DerivedProperty {

  /**
   * @param {ButtonModel} buttonModel
   * @constructor
   */
  constructor( buttonModel ) {

    super( [ buttonModel.overProperty, buttonModel.looksPressedProperty, buttonModel.enabledProperty, buttonModel.valueProperty ],
      ( over, looksPressed, enabled, propertyValue ) => {
        const isValueDown = propertyValue === buttonModel.valueDown;
        return !enabled && isValueDown ? ButtonInteractionState.DISABLED_PRESSED :
               !enabled ? ButtonInteractionState.DISABLED :
               over && !( looksPressed || isValueDown ) ? ButtonInteractionState.OVER :
               over && ( looksPressed || isValueDown ) ? ButtonInteractionState.PRESSED :
               isValueDown ? ButtonInteractionState.PRESSED :
               ButtonInteractionState.IDLE;
      } );
  }
}

sun.register( 'StickyToggleButtonInteractionStateProperty', StickyToggleButtonInteractionStateProperty );
export default StickyToggleButtonInteractionStateProperty;