// Copyright 2018, University of Colorado Boulder

/**
 * enum of the possible button interaction states
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  var sun = require( 'SUN/sun' );

  var ButtonInteractionState = {

    // button is just sitting there, doing nothing
    IDLE: 'idle',

    // a pointer is over the button, but not pressing it
    OVER: 'over',

    // the button is pressed, generally because the user has clicked on it or touched it
    PRESSED: 'pressed',

    // the button is disabled
    DISABLED: 'disabled',

    // the button is disabled, but was already pressed when that happened, so it is also pressed
    DISABLED_PRESSED: 'disabled-pressed'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( ButtonInteractionState ); }

  sun.register( 'ButtonInteractionState', ButtonInteractionState );

  return ButtonInteractionState;
} );

