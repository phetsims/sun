// Copyright 2014-2018, University of Colorado Boulder

/**
 * A derived property the maps sticky toggle button model states to the values
 * needed by the button view.
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
  function StickyToggleButtonInteractionStateProperty( buttonModel ) {

    DerivedProperty.call(
      this,
      [ buttonModel.overProperty, buttonModel.looksPressedProperty, buttonModel.enabledProperty, buttonModel.valueProperty ],
      function( over, looksPressed, enabled, propertyValue ) {
        var isValueDown = propertyValue === buttonModel.valueDown;
        return !enabled && isValueDown ? ButtonInteractionState.DISABLED_PRESSED :
               !enabled ? ButtonInteractionState.DISABLED :
               over && !( looksPressed || isValueDown ) ? ButtonInteractionState.OVER :
               over && ( looksPressed || isValueDown ) ? ButtonInteractionState.PRESSED :
               isValueDown ? ButtonInteractionState.PRESSED :
               ButtonInteractionState.IDLE;
      } );
  }

  sun.register( 'StickyToggleButtonInteractionStateProperty', StickyToggleButtonInteractionStateProperty );

  return inherit( DerivedProperty, StickyToggleButtonInteractionStateProperty );
} );