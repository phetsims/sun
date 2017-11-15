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
   * Wrapper type for phet/sun's ToggleButton class.
   * @param {ToggleButton} toggleButton
   * @param {string} phetioID
   * @constructor
   */
  function TToggleButton( toggleButton, phetioID ) {
    assert && assertInstanceOf( toggleButton, [
      phet.sun.RectangularToggleButton,
      phet.sun.RoundStickyToggleButton,
      phet.sun.RoundToggleButton
    ] );
    NodeIO.call( this, toggleButton, phetioID );
  }

  phetioInherit( NodeIO, 'TToggleButton', TToggleButton, {}, {
    documentation: 'A button that toggles state (in/out) when pressed',
    events: [ 'toggled' ]
  } );


  sun.register( 'TToggleButton', TToggleButton );

  return TToggleButton;
} );