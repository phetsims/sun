// Copyright 2017-2018, University of Colorado Boulder

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
  var phetioInherit = require( 'TANDEM/phetioInherit' );
  var sun = require( 'SUN/sun' );

  /**
   * @param {OnOffSwitch} onOffSwitch
   * @param {string} phetioID
   * @constructor
   */
  function OnOffSwitchIO( onOffSwitch, phetioID ) {
    NodeIO.call( this, onOffSwitch, phetioID );
  }

  phetioInherit( NodeIO, 'OnOffSwitchIO', OnOffSwitchIO, {}, {
    documentation: 'A traditional switch component',
    events: [ 'toggled' ],
    validator: { isValidValue: v => v instanceof phet.sun.OnOffSwitch }
  } );

  sun.register( 'OnOffSwitchIO', OnOffSwitchIO );

  return OnOffSwitchIO;
} );

