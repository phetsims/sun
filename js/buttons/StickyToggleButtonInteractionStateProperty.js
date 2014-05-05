// Copyright 2002-2014, University of Colorado Boulder

/**
 * A derived property the maps sticky toggle button model states to the values
 * needed by the button view.
 */
define( function( require ) {
  'use strict';

  // Imports
  var inherit = require( 'PHET_CORE/inherit' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );

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

  return inherit( DerivedProperty, StickyToggleButtonInteractionStateProperty );
} );