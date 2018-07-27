// Copyright 2017-2018, University of Colorado Boulder

/**
 * IO type for RoundPushButton|RectangularPushButton
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );
  var sun = require( 'SUN/sun' );

  // ifphetio
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );

  /**
   * @param {RoundPushButton|RectangularPushButton} button
   * @param {string} phetioID
   * @constructor
   */
  function PushButtonIO( button, phetioID ) {
    NodeIO.call( this, button, phetioID );
    assert && assertInstanceOf( button, phet.sun.RoundPushButton, phet.sun.RectangularPushButton );
  }

  phetioInherit( NodeIO, 'PushButtonIO', PushButtonIO, {}, {
    documentation: 'A pressable button in the simulation',
    events: [ 'fired' ]
  } );

  sun.register( 'PushButtonIO', PushButtonIO );

  return PushButtonIO;
} );