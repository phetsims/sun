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

  function StickyToggleButtonInteractionState( buttonModel ) {
    DerivedProperty.call(
      this,
      [ buttonModel.overProperty, buttonModel.downProperty, buttonModel.enabledProperty, buttonModel.valueProperty ],
      function( over, down, enabled, propertyValue ) {
        var toggled = propertyValue === buttonModel.valueB;
        return !enabled && toggled ? 'disabled-pressed' :
               !enabled ? 'disabled' :
               over && !(down || toggled) ? 'over' :
               over && (down || toggled) ? 'pressed' :
               toggled ? 'pressed' :
               'idle';
      } );
  }

  return inherit( DerivedProperty, StickyToggleButtonInteractionState );
} );