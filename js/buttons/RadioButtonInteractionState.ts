// Copyright 2022, University of Colorado Boulder

/**
 * enum of the possible interaction states for the radio buttons
 * @author John Blanco
 */

import Enumeration from '../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';
import sun from '../sun.js';

export default class RadioButtonInteractionState extends EnumerationValue {

  // the button is selected
  public static readonly SELECTED = new RadioButtonInteractionState();

  // the button is deselected
  public static readonly DESELECTED = new RadioButtonInteractionState();

  // a pointer is over the button, but it is not being pressed and is not selected
  public static readonly OVER = new RadioButtonInteractionState();

  // the button is being pressed by the user
  public static readonly PRESSED = new RadioButtonInteractionState();

  public static readonly enumeration = new Enumeration( RadioButtonInteractionState );
}

sun.register( 'RadioButtonInteractionState', RadioButtonInteractionState );
