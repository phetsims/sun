// Copyright 2002-2014, University of Colorado Boulder

/**
 * A derived property that maps radio button group member model states to the values
 * needed by the button view.
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );

  function RadioButtonInteractionStateProperty( buttonModel ) {
    DerivedProperty.call(
      this,
      [ buttonModel.overProperty, buttonModel.downProperty, buttonModel.enabledProperty, buttonModel.selectorProperty ],
      function( over, down, enabled, propertyValue ) {
        var isSelected = ( propertyValue === buttonModel.selectedValue );
        return !enabled && isSelected ? 'disabled-selected' :
               !enabled ? 'disabled-deselected' :
               over && !(down || isSelected) ? 'over' :
               over && down ? 'pressed' :
               isSelected ? 'selected' :
               'deselected';
      } );
  }

  return inherit( DerivedProperty, RadioButtonInteractionStateProperty );
} );