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
    IDLE: 'IDLE',

    // a pointer is over the button, but not pressing it
    OVER: 'OVER',

    // the button is pressed, generally because the user has clicked on it or touched it
    PRESSED: 'PRESSED',

    // the button is disabled
    DISABLED: 'DISABLED',

    // the button is disabled, but was already pressed when that happened, so it is also pressed
    DISABLED_PRESSED: 'DISABLED_PRESSED'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( ButtonInteractionState ); }

  sun.register( 'ButtonInteractionState', ButtonInteractionState );

  return ButtonInteractionState;
} );

