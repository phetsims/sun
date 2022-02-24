// Copyright 2022, University of Colorado Boulder

/**
 * enum of the possible interaction states for the radio buttons
 * @author John Blanco
 */

import Enumeration from '../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';
import sun from '../sun.js';

class RadioButtonInteractionState extends EnumerationValue {

  // the button is selected
  static SELECTED = new RadioButtonInteractionState();

  // the button is deselected
  static DESELECTED = new RadioButtonInteractionState();

  // a pointer is over the button, but it is not being pressed and is not selected
  static OVER = new RadioButtonInteractionState();

  // the button is being pressed by the user
  static PRESSED = new RadioButtonInteractionState();

  static enumeration = new Enumeration( RadioButtonInteractionState );
}

sun.register( 'RadioButtonInteractionState', RadioButtonInteractionState );

export default RadioButtonInteractionState;