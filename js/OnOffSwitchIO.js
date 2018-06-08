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
  var sun = require( 'SUN/sun' );

  // ifphetio
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  
  /**
   * @param {OnOffSwitch} onOffSwitch
   * @param {string} phetioID
   * @constructor
   */
  function OnOffSwitchIO( onOffSwitch, phetioID ) {
    assert && assertInstanceOf( onOffSwitch, phet.sun.OnOffSwitch );
    NodeIO.call( this, onOffSwitch, phetioID );
  }

  phetioInherit( NodeIO, 'OnOffSwitchIO', OnOffSwitchIO, {}, {
    documentation: 'A traditional switch component',
    events: [ 'toggled' ]
  } );

  sun.register( 'OnOffSwitchIO', OnOffSwitchIO );

  return OnOffSwitchIO;
} );

