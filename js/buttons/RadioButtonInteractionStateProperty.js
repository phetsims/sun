// Copyright 2014-2015, University of Colorado Boulder

/**
 * A derived property that maps radio button group member model states to the values
 * needed by the button view.
 */
define( function( require ) {
  'use strict';

  // modules
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var inherit = require( 'PHET_CORE/inherit' );
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
        return !enabled && isSelected ? 'disabled-selected' :
               !enabled ? 'disabled-deselected' :
               over && !(down || isSelected) ? 'over' :
               over && down ? 'pressed' :
               isSelected ? 'selected' :
               'deselected';
      } );
  }

  sun.register( 'RadioButtonInteractionStateProperty', RadioButtonInteractionStateProperty );

  return inherit( DerivedProperty, RadioButtonInteractionStateProperty );
} );