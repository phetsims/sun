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

  function ToggleButtonInteractionState( buttonModel ) {
    DerivedProperty.call(
      this,
      [ buttonModel.overProperty, buttonModel.downProperty, buttonModel.enabledProperty],
      function( over, down, enabled ) {
        return !enabled ? 'disabled' :
               over && !(down ) ? 'over' :
               down ? 'pressed' :
               'idle';
      } );
  }

  return inherit( DerivedProperty, ToggleButtonInteractionState );
} );