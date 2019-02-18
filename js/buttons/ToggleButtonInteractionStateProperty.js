// Copyright 2014-2019, University of Colorado Boulder

/**
 * A derived property that maps sticky toggle button model states to the values needed by the button view.
 */
define( require => {
  'use strict';

  // modules
  const ButtonInteractionState = require( 'SUN/buttons/ButtonInteractionState' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const sun = require( 'SUN/sun' );

  class ToggleButtonInteractionStateProperty extends DerivedProperty {

    /**
     * @param {ButtonModel} buttonModel
     */
    constructor( buttonModel ) {
      super( [ buttonModel.overProperty, buttonModel.looksPressedProperty, buttonModel.enabledProperty ],
        ( over, looksPressed, enabled ) => {
          return !enabled ? ButtonInteractionState.DISABLED :
                 over && !( looksPressed ) ? ButtonInteractionState.OVER :
                 looksPressed ? ButtonInteractionState.PRESSED :
                 ButtonInteractionState.IDLE;
        }
      );
    }
  }

  return sun.register( 'ToggleButtonInteractionStateProperty', ToggleButtonInteractionStateProperty );
} );