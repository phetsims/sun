// Copyright 2014-2015, University of Colorado Boulder

/**
 * A derived property that maps momentary button model states to the values needed by the button view.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var sun = require( 'SUN/sun' );

  /**
   * @param {ButtonModel} buttonModel
   * @constructor
   */
  function MomentaryButtonInteractionStateProperty( buttonModel ) {

    DerivedProperty.call(
      this,
      [ buttonModel.overProperty, buttonModel.downProperty, buttonModel.enabledProperty ],
      function( over, down, enabled ) {
        return !enabled ? 'disabled' :
               over && !down ? 'over' :
               down ? 'pressed' :  // remain pressed regardless of whether 'over' is true
               'idle';
      } );
  }

  sun.register( 'MomentaryButtonInteractionStateProperty', MomentaryButtonInteractionStateProperty );

  return inherit( DerivedProperty, MomentaryButtonInteractionStateProperty );
} );