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
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var sun = require( 'SUN/sun' );
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );

  /**
   * Wrapper type for phet/sun's RoundMomentaryButton class.
   * @param momentaryButton
   * @param phetioID
   * @constructor
   */
  function RoundMomentaryButtonIO( momentaryButton, phetioID ) {
    assert && assertInstanceOf( momentaryButton, phet.sun.RoundMomentaryButton );
    NodeIO.call( this, momentaryButton, phetioID );
  }

  phetioInherit( NodeIO, 'RoundMomentaryButtonIO', RoundMomentaryButtonIO, {}, {
    documentation: 'Button that performs an action while it is being pressed, and stops the action when released',
    events: [ 'pressed', 'released', 'releasedDisabled' ]
  } );

  sun.register( 'RoundMomentaryButtonIO', RoundMomentaryButtonIO );

  return RoundMomentaryButtonIO;
} );