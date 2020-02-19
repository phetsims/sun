// Copyright 2020, University of Colorado Boulder

/**
 * IO type for ToggleSwitch
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const NodeIO = require( 'SCENERY/nodes/NodeIO' );
  const ObjectIO = require( 'TANDEM/types/ObjectIO' );
  const sun = require( 'SUN/sun' );

  class ToggleSwitchIO extends NodeIO {}

  ToggleSwitchIO.documentation = 'a switch that toggles between 2 values';
  ToggleSwitchIO.events = [ 'toggledAction' ];
  ToggleSwitchIO.validator = { isValidValue: v => v instanceof phet.sun.ToggleSwitch };
  ToggleSwitchIO.typeName = 'ToggleSwitchIO';
  ObjectIO.validateSubtype( ToggleSwitchIO );

  return sun.register( 'ToggleSwitchIO', ToggleSwitchIO );
} );

