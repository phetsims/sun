// Copyright 2018-2020, University of Colorado Boulder

/**
 * Enumeration of the possible button interaction states
 *
 * @author John Blanco
 */

import Enumeration from '../../../phet-core/js/Enumeration.js';
import sun from '../sun.js';

const ButtonInteractionState = Enumeration.byKeys( [

  // button is just sitting there, doing nothing
  'IDLE',

  // a pointer is over the button, but it is not being pressed
  'OVER',

  // the button is being pressed by the user
  'PRESSED'
] );

sun.register( 'ButtonInteractionState', ButtonInteractionState );

export default ButtonInteractionState;