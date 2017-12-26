// Copyright 2017, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var sun = require( 'SUN/sun' );

  /**
   * Wrapper type for phet/sun's RoundMomentaryButton class.
   * @param {RoundMomentaryButton} roundMomentaryButton
   * @param {string} phetioID
   * @constructor
   */
  function RoundMomentaryButtonIO( roundMomentaryButton, phetioID ) {
    assert && assertInstanceOf( roundMomentaryButton, phet.sun.RoundMomentaryButton );
    NodeIO.call( this, roundMomentaryButton, phetioID );
  }

  phetioInherit( NodeIO, 'RoundMomentaryButtonIO', RoundMomentaryButtonIO, {}, {
    documentation: 'Button that performs an action while it is being pressed, and stops the action when released',
    events: [ 'pressed', 'released', 'releasedDisabled' ]
  } );

  sun.register( 'RoundMomentaryButtonIO', RoundMomentaryButtonIO );

  return RoundMomentaryButtonIO;
} );