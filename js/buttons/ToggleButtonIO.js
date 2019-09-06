// Copyright 2017-2019, University of Colorado Boulder

/**
 * IO type for RectangularToggleButton|RoundStickyToggleButton|RoundToggleButton
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  const ObjectIO = require( 'TANDEM/types/ObjectIO' );
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );
  var sun = require( 'SUN/sun' );

  class ToggleButtonIO extends NodeIO {}

  ToggleButtonIO.documentation = 'A button that toggles state (in/out) when pressed';
  ToggleButtonIO.events = [ 'toggled' ];

  ToggleButtonIO.validator = {
    isValidValue: instance => {
      const types = [ phet.sun.RectangularToggleButton, phet.sun.RoundStickyToggleButton, phet.sun.RoundToggleButton ];
      const definedTypes = types.filter( v => !!v );
      const matches = definedTypes.filter( v => instance instanceof v );
      return matches.length > 0;
    }
  };
  ToggleButtonIO.typeName = 'ToggleButtonIO';
  ObjectIO.validateSubtype( ToggleButtonIO );

  return sun.register( 'ToggleButtonIO', ToggleButtonIO );
} );