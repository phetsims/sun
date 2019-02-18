// Copyright 2014-2019, University of Colorado Boulder

/**
 * A derived property that maps push button model states to the values needed by the button view.
 */
define( function( require ) {
  'use strict';

  // modules
  const ButtonInteractionState = require( 'SUN/buttons/ButtonInteractionState' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const sun = require( 'SUN/sun' );

  class PushButtonInteractionStateProperty extends DerivedProperty {

    /**
     * @param {ButtonModel} buttonModel
     * @param {Object} [options]
     */
    constructor( buttonModel, options ) {
      super( [ buttonModel.overProperty, buttonModel.looksPressedProperty, buttonModel.enabledProperty ],
        ( over, looksPressed, enabled ) => {
          return !enabled ? ButtonInteractionState.DISABLED :
                 over && !looksPressed ? ButtonInteractionState.OVER :
                 over && looksPressed ? ButtonInteractionState.PRESSED :
                 ButtonInteractionState.IDLE;
        }, options );
    }
  }

  return sun.register( 'PushButtonInteractionStateProperty', PushButtonInteractionStateProperty );
} );