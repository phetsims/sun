// Copyright 2017-2019, University of Colorado Boulder

/**
 * IO type for RoundMomentaryButton
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const ObjectIO = require( 'TANDEM/types/ObjectIO' );
  const NodeIO = require( 'SCENERY/nodes/NodeIO' );
  const sun = require( 'SUN/sun' );

  class RoundMomentaryButtonIO extends NodeIO {}

  RoundMomentaryButtonIO.documentation = 'Button that performs an action while it is being pressed, and stops the action when released';
  RoundMomentaryButtonIO.events = [ 'pressed', 'released', 'releasedDisabled' ];
  RoundMomentaryButtonIO.validator = { isValidValue: v => v instanceof phet.sun.RoundMomentaryButton };
  RoundMomentaryButtonIO.typeName = 'RoundMomentaryButtonIO';
  ObjectIO.validateSubtype( RoundMomentaryButtonIO );

  return sun.register( 'RoundMomentaryButtonIO', RoundMomentaryButtonIO );
} );