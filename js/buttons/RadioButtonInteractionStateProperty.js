// Copyright 2014-2017, University of Colorado Boulder

/**
 * A derived property that maps radio button group member model states to the values needed by the button view.
 *
 * @author Aaron Davis (PhET Interactive Simulations)
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
   * @param {Property.<Object>} property - the axon Property set by the button
   * @param {Object} value - the value set by the button
   * @constructor
   */
  function RadioButtonInteractionStateProperty( buttonModel, property, value ) {

    DerivedProperty.call(
      this,
      [ buttonModel.overProperty, buttonModel.downProperty, buttonModel.enabledProperty, property ],
      function( over, down, enabled, propertyValue ) {
        var isSelected = ( propertyValue === value );
        return !enabled && isSelected ? RadioButtonInteractionState.DISABLED_SELECTED :
               !enabled ? RadioButtonInteractionState.DISABLED_DESELECTED :
               over && !( down || isSelected ) ? RadioButtonInteractionState.OVER :
               over && down ? RadioButtonInteractionState.PRESSED :
               isSelected ? RadioButtonInteractionState.SELECTED :
               RadioButtonInteractionState.DESELECTED;
      } );
  }

  sun.register( 'RadioButtonInteractionStateProperty', RadioButtonInteractionStateProperty );

  return inherit( DerivedProperty, RadioButtonInteractionStateProperty );
} );