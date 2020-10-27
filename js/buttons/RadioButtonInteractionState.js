// Copyright 2018-2020, University of Colorado Boulder

/**
 * enum of the possible interaction states for the radio buttons
 * @author John Blanco
 */

import Enumeration from '../../../phet-core/js/Enumeration.js';
import sun from '../sun.js';

const RadioButtonInteractionState = Enumeration.byKeys( [

  // the button is selected
  'SELECTED',

  // the button is deselected
  'DESELECTED',

  // a pointer is over the button, but it is not being pressed and is not selected
  'OVER',

  // the button is being pressed by the user
  'PRESSED'
] );

sun.register( 'RadioButtonInteractionState', RadioButtonInteractionState );

export default RadioButtonInteractionState;