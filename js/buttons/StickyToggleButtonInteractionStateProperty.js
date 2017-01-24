// Copyright 2014-2015, University of Colorado Boulder

/**
 * A derived property the maps sticky toggle button model states to the values
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
  function StickyToggleButtonInteractionStateProperty( buttonModel ) {

    DerivedProperty.call(
      this,
      [ buttonModel.overProperty, buttonModel.downProperty, buttonModel.enabledProperty, buttonModel.valueProperty ],
      function( over, down, enabled, propertyValue ) {
        var isValueDown = propertyValue === buttonModel.valueDown;
        return !enabled && isValueDown ? 'disabled-pressed' :
               !enabled ? 'disabled' :
               over && !(down || isValueDown) ? 'over' :
               over && (down || isValueDown) ? 'pressed' :
               isValueDown ? 'pressed' :
               'idle';
      } );
  }

  sun.register( 'StickyToggleButtonInteractionStateProperty', StickyToggleButtonInteractionStateProperty );

  return inherit( DerivedProperty, StickyToggleButtonInteractionStateProperty );
} );