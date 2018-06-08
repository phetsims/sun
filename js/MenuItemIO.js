// Copyright 2017-2018, University of Colorado Boulder

/**
 * IO type for MenuItem
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
   * @param {MenuItem} menuItem
   * @param {string} phetioID
   * @constructor
   */
  function MenuItemIO( menuItem, phetioID ) {
    assert && assertInstanceOf( menuItem, phet.sun.MenuItem );
    NodeIO.call( this, menuItem, phetioID );
  }

  phetioInherit( NodeIO, 'MenuItemIO', MenuItemIO, {}, {
    documentation: 'The item buttons shown in a popup menu',
    events: [ 'fired' ]
  } );

  sun.register( 'MenuItemIO', MenuItemIO );

  return MenuItemIO;
} );
