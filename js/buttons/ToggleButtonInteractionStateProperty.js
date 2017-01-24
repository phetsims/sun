// Copyright 2014-2015, University of Colorado Boulder

/**
 * A derived property that maps sticky toggle button model states to the values needed by the button view.
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
  function ToggleButtonInteractionStateProperty( buttonModel ) {

    DerivedProperty.call(
      this,
      [ buttonModel.overProperty, buttonModel.downProperty, buttonModel.enabledProperty ],
      function( over, down, enabled ) {
        return !enabled ? 'disabled' :
               over && !(down ) ? 'over' :
               down ? 'pressed' :
               'idle';
      }
    );
  }

  sun.register( 'ToggleButtonInteractionStateProperty', ToggleButtonInteractionStateProperty );

  return inherit( DerivedProperty, ToggleButtonInteractionStateProperty );
} );