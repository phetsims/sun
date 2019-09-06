// Copyright 2017-2019, University of Colorado Boulder

/**
 * IO type for OnOffSwitch
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );
  const ObjectIO = require( 'TANDEM/types/ObjectIO' );
  var sun = require( 'SUN/sun' );

  class OnOffSwitchIO extends NodeIO {}

  OnOffSwitchIO.documentation = 'A traditional switch component';
  OnOffSwitchIO.events = [ 'toggled' ];
  OnOffSwitchIO.validator = { isValidValue: v => v instanceof phet.sun.OnOffSwitch };
  OnOffSwitchIO.typeName = 'OnOffSwitchIO';
  ObjectIO.validateSubtype( OnOffSwitchIO );

  return sun.register( 'OnOffSwitchIO', OnOffSwitchIO );
} );

