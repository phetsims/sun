// Copyright 2002-2014, University of Colorado Boulder

/**
 * A derived property that maps push button model states to the values needed
 * by the button view.
 */
define( function( require ) {
  'use strict';

  // Imports
  var inherit = require( 'PHET_CORE/inherit' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );

  function PushButtonInteractionStateProperty( buttonModel ) {
    DerivedProperty.call(
      this,
      [ buttonModel.overProperty, buttonModel.downProperty, buttonModel.enabledProperty ],
      function( over, down, enabled ) {
        return !enabled ? 'disabled' :
               over && !down ? 'over' :
               over && down ? 'pressed' :
               'idle';
      } );
    // Turn off data logging for this property, since it isn't that useful;
    this.setSendPhetEvents( false );
  }

  return inherit( DerivedProperty, PushButtonInteractionStateProperty );
} );