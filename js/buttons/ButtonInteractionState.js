// Copyright 2018, University of Colorado Boulder

/**
 * enum of the possible button interaction states
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  var sun = require( 'SUN/sun' );

  var ButtonInteractionState = {
    DISABLED: 'DISABLED',
    DISABLED_PRESSED: 'DISABLED_PRESSED',
    IDLE: 'IDLE',
    OVER: 'OVER',
    PRESSED: 'PRESSED'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( ButtonInteractionState ); }

  sun.register( 'ButtonInteractionState', ButtonInteractionState );

  return ButtonInteractionState;
} );

