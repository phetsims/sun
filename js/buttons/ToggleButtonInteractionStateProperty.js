// Copyright 2014-2018, University of Colorado Boulder

/**
 * A derived property that maps sticky toggle button model states to the values needed by the button view.
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonInteractionState = require( 'SUN/buttons/ButtonInteractionState' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var inherit = require( 'PHET_CORE/inherit' );
  var sun = require( 'SUN/sun' );

  /**
   * @param {ButtonModel} buttonModel
   * @constructor
   */
  function ToggleButtonInteractionStateProperty( buttonModel ) {

    DerivedProperty.call(
      this,
      [ buttonModel.overProperty, buttonModel.looksPressedProperty, buttonModel.enabledProperty ],
      function( over, looksPressed, enabled ) {
        return !enabled ? ButtonInteractionState.DISABLED :
               over && !( looksPressed ) ? ButtonInteractionState.OVER :
               looksPressed ? ButtonInteractionState.PRESSED :
               ButtonInteractionState.IDLE;
      }
    );
  }

  sun.register( 'ToggleButtonInteractionStateProperty', ToggleButtonInteractionStateProperty );

  return inherit( DerivedProperty, ToggleButtonInteractionStateProperty );
} );