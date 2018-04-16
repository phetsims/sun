// Copyright 2018, University of Colorado Boulder

/**
 * enum of the possible interaction states for the radio buttons
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  var sun = require( 'SUN/sun' );

  var RadioButtonInteractionState = {

    // the button is selected and enabled
    SELECTED: 'SELECTED',

    // the button is not selected but is enabled
    DESELECTED: 'DESELECTED',

    // the button is being pressed by the user
    PRESSED: 'PRESSED',

    // a pointer is over the button, but it is not being pressed
    OVER: 'OVER',

    // the button is disabled but is currently selected
    DISABLED_SELECTED: 'DISABLED_SELECTED',

    // the button is disabled and is not selected
    DISABLED_DESELECTED: 'DISABLED_DESELECTED'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( RadioButtonInteractionState ); }

  sun.register( 'RadioButtonInteractionState', RadioButtonInteractionState );

  return RadioButtonInteractionState;
} );
