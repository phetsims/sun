// Copyright 2014-2017, University of Colorado Boulder

/**
 * a derived property that maps radio button group member model states to the values needed by the button view
 */
define( function( require ) {
  'use strict';

  // modules
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var inherit = require( 'PHET_CORE/inherit' );
  var RadioButtonInteractionState = require( 'SUN/buttons/RadioButtonInteractionState' );
  var sun = require( 'SUN/sun' );

  /**
   * @param {ButtonModel} buttonModel
   * @constructor
   */
  function RadioButtonInteractionStateProperty( buttonModel ) {

    DerivedProperty.call(
      this,
      [ buttonModel.overProperty, buttonModel.downProperty, buttonModel.enabledProperty, buttonModel.selectorProperty ],
      function( over, down, enabled, propertyValue ) {
        var isSelected = ( propertyValue === buttonModel.selectedValue );
        return !enabled && isSelected ? RadioButtonInteractionState.DISABLED_SELECTED :
               !enabled ? RadioButtonInteractionState.DISABLED_DESELECTED :
               over && !(down || isSelected) ? RadioButtonInteractionState.OVER :
               over && down ? RadioButtonInteractionState.PRESSED :
               isSelected ? RadioButtonInteractionState.SELECTED :
               RadioButtonInteractionState.DESELECTED;
      } );
  }

  sun.register( 'RadioButtonInteractionStateProperty', RadioButtonInteractionStateProperty );

  return inherit( DerivedProperty, RadioButtonInteractionStateProperty );
} );