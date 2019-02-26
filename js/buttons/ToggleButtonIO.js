// Copyright 2017-2018, University of Colorado Boulder

/**
 * IO type for RectangularToggleButton|RoundStickyToggleButton|RoundToggleButton
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );
  var phetioInherit = require( 'TANDEM/phetioInherit' );
  var sun = require( 'SUN/sun' );

  /**
   * @param {RectangularToggleButton|RoundStickyToggleButton|RoundToggleButton} toggleButton
   * @param {string} phetioID
   * @constructor
   */
  function ToggleButtonIO( toggleButton, phetioID ) {
    NodeIO.call( this, toggleButton, phetioID );
  }

  phetioInherit( NodeIO, 'ToggleButtonIO', ToggleButtonIO, {}, {
    documentation: 'A button that toggles state (in/out) when pressed',
    events: [ 'toggled' ],

    validator: {
      isValidValue: instance => {
        const types = [ phet.sun.RectangularToggleButton, phet.sun.RoundStickyToggleButton, phet.sun.RoundToggleButton ];
        const definedTypes = types.filter( v => !!v );
        const matches = definedTypes.filter( v => instance instanceof v );
        return matches.length > 0;
      }
    }
  } );

  sun.register( 'ToggleButtonIO', ToggleButtonIO );

  return ToggleButtonIO;
} );