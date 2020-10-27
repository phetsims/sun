// Copyright 2018-2020, University of Colorado Boulder

/**
 * enum of the possible button interaction states
 * @author John Blanco
 */

import sun from '../sun.js';

const ButtonInteractionState = {

  // button is just sitting there, doing nothing
  IDLE: 'IDLE',

  // a pointer is over the button, but it is not being pressed
  OVER: 'OVER',

  // the button is being pressed by the user
  PRESSED: 'PRESSED'
};

// verify that enum is immutable, without the runtime penalty in production code
if ( assert ) { Object.freeze( ButtonInteractionState ); }

sun.register( 'ButtonInteractionState', ButtonInteractionState );

export default ButtonInteractionState;