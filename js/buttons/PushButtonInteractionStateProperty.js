// Copyright 2014-2017, University of Colorado Boulder

/**
 * A derived property that maps push button model states to the values needed by the button view.
 */
define( function( require ) {
  'use strict';

  // modules
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var inherit = require( 'PHET_CORE/inherit' );
  var sun = require( 'SUN/sun' );

  /**
   * @param {ButtonModel} buttonModel
   * @param {Object} [options]
   * @constructor
   */
  function PushButtonInteractionStateProperty( buttonModel, options ) {

    DerivedProperty.call(
      this,
      [ buttonModel.overProperty, buttonModel.downProperty, buttonModel.enabledProperty ],
      function( over, down, enabled ) {
        return !enabled ? 'disabled' :
               over && !down ? 'over' :
               over && down ? 'pressed' :
               'idle';
      }, options );
  }

  sun.register( 'PushButtonInteractionStateProperty', PushButtonInteractionStateProperty );

  return inherit( DerivedProperty, PushButtonInteractionStateProperty );
} );