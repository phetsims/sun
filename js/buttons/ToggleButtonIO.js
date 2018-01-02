// Copyright 2017, University of Colorado Boulder

/**
 * IO type for RectangularToggleButton|RoundStickyToggleButton|RoundToggleButton
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
   * @param {RectangularToggleButton|RoundStickyToggleButton|RoundToggleButton} toggleButton
   * @param {string} phetioID
   * @constructor
   */
  function ToggleButtonIO( toggleButton, phetioID ) {
    assert && assertInstanceOf( toggleButton, [
      phet.sun.RectangularToggleButton,
      phet.sun.RoundStickyToggleButton,
      phet.sun.RoundToggleButton
    ] );
    NodeIO.call( this, toggleButton, phetioID );
  }

  phetioInherit( NodeIO, 'ToggleButtonIO', ToggleButtonIO, {}, {
    documentation: 'A button that toggles state (in/out) when pressed',
    events: [ 'toggled' ]
  } );

  sun.register( 'ToggleButtonIO', ToggleButtonIO );

  return ToggleButtonIO;
} );