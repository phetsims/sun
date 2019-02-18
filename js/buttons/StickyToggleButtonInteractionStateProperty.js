// Copyright 2014-2019, University of Colorado Boulder

/**
 * A derived property the maps sticky toggle button model states to the values needed by the button view.
 */
define( function( require ) {
  'use strict';

  // modules
  const ButtonInteractionState = require( 'SUN/buttons/ButtonInteractionState' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const sun = require( 'SUN/sun' );

  class StickyToggleButtonInteractionStateProperty extends DerivedProperty {

    /**
     * @param {ButtonModel} buttonModel
     * @constructor
     */
    constructor( buttonModel ) {

      super( [ buttonModel.overProperty, buttonModel.looksPressedProperty, buttonModel.enabledProperty, buttonModel.valueProperty ],
        ( over, looksPressed, enabled, propertyValue ) => {
          const isValueDown = propertyValue === buttonModel.valueDown;
          return !enabled && isValueDown ? ButtonInteractionState.DISABLED_PRESSED :
                 !enabled ? ButtonInteractionState.DISABLED :
                 over && !( looksPressed || isValueDown ) ? ButtonInteractionState.OVER :
                 over && ( looksPressed || isValueDown ) ? ButtonInteractionState.PRESSED :
                 isValueDown ? ButtonInteractionState.PRESSED :
                 ButtonInteractionState.IDLE;
        } );
    }
  }

  return sun.register( 'StickyToggleButtonInteractionStateProperty', StickyToggleButtonInteractionStateProperty );
} );