// Copyright 2014-2017, University of Colorado Boulder

/**
 * A derived property that maps momentary button model states to the values needed by the button view.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonInteractionState = require( 'SUN/buttons/ButtonInteractionState' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var inherit = require( 'PHET_CORE/inherit' );
  var sun = require( 'SUN/sun' );

  /**
   * @param {ButtonModel} buttonModel
   * @constructor
   */
  function MomentaryButtonInteractionStateProperty( buttonModel ) {

    DerivedProperty.call(
      this,
      [ buttonModel.overProperty, buttonModel.looksPressedProperty, buttonModel.enabledProperty ],
      function( over, looksPressed, enabled ) {
        return !enabled ? ButtonInteractionState.DISABLED :
               over && !looksPressed ? ButtonInteractionState.OVER :
               looksPressed ? ButtonInteractionState.PRESSED :  // remain pressed regardless of whether 'over' is true
               ButtonInteractionState.IDLE;
      } );
  }

  sun.register( 'MomentaryButtonInteractionStateProperty', MomentaryButtonInteractionStateProperty );

  return inherit( DerivedProperty, MomentaryButtonInteractionStateProperty );
} );