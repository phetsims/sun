// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertions/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var sun = require( 'SUN/sun' );
  var TNode = require( 'SCENERY/nodes/TNode' );
  var toEventOnEmit = require( 'ifphetio!PHET_IO/toEventOnEmit' );


  /**
   * Wrapper type for phet/sun's MenuItem
   * @param menuItem
   * @param phetioID
   * @constructor
   */
  function TMenuItem( menuItem, phetioID ) {
    assertInstanceOf( menuItem, phet.sun.MenuItem );
    TNode.call( this, menuItem, phetioID );

    // MenuItem from Sun, it is defined in PhetMenu.js and does not have its own type

    toEventOnEmit(
      menuItem.startedCallbacksForFiredEmitter,
      menuItem.endedCallbacksForFiredEmitter,
      'user',
      phetioID,
      this.constructor,
      'fired' );
  }

  phetioInherit( TNode, 'TMenuItem', TMenuItem, {}, {
    documentation: 'The item buttons shown in a popup menu',
    events: [ 'fired' ]
  } );

  sun.register( 'TMenuItem', TMenuItem );

  return TMenuItem;
} );
