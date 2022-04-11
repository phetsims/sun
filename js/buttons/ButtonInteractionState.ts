// Copyright 2022, University of Colorado Boulder

/**
 * Enumeration of the possible button interaction states
 *
 * @author John Blanco
 */

import Enumeration from '../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';
import sun from '../sun.js';

export default class ButtonInteractionState extends EnumerationValue {

  // button is just sitting there, doing nothing
  static IDLE = new ButtonInteractionState();

  // a pointer is over the button, but it is not being pressed
  static OVER = new ButtonInteractionState();

  // the button is being pressed by the user
  static PRESSED = new ButtonInteractionState();

  static enumeration = new Enumeration( ButtonInteractionState );
}

sun.register( 'ButtonInteractionState', ButtonInteractionState );
