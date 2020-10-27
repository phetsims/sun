// Copyright 2014-2020, University of Colorado Boulder

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
    super( [ buttonModel.overProperty, buttonModel.looksPressedProperty ],
      ( over, looksPressed ) => {
        return over && !looksPressed ? ButtonInteractionState.OVER :
               looksPressed ? ButtonInteractionState.PRESSED :  // remain pressed regardless of whether 'over' is true
               ButtonInteractionState.IDLE;
      } );
  }
}

sun.register( 'MomentaryButtonInteractionStateProperty', MomentaryButtonInteractionStateProperty );
export default MomentaryButtonInteractionStateProperty;