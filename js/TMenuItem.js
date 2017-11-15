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
   * Wrapper type for phet/sun's MenuItem
   * @param menuItem
   * @param phetioID
   * @constructor
   */
  function TMenuItem( menuItem, phetioID ) {
    assert && assertInstanceOf( menuItem, phet.sun.MenuItem );
    NodeIO.call( this, menuItem, phetioID );
  }

  phetioInherit( NodeIO, 'TMenuItem', TMenuItem, {}, {
    documentation: 'The item buttons shown in a popup menu',
    events: [ 'fired' ]
  } );

  sun.register( 'TMenuItem', TMenuItem );

  return TMenuItem;
} );
