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
  var phetioNamespace = require( 'ifphetio!PHET_IO/phetioNamespace' );
  var TNode = require( 'SCENERY/nodes/TNode' );
  var toEventOnEmit = require( 'ifphetio!PHET_IO/events/toEventOnEmit' );


  /**
   * Wrapper type for phet/sun's MenuItem
   * @param menuItem
   * @param phetioID
   * @constructor
   */
  function TMenuItem( menuItem, phetioID ) {
    assertInstanceOf( menuItem, phet.scenery.Node );
    TNode.call( this, menuItem, phetioID );

    // MenuItem from Sun, it is defined in PhetMenu.js and does not have its own type

    toEventOnEmit(
      menuItem.startedCallbacksForFiredEmitter,
      menuItem.endedCallbacksForFiredEmitter,
      'user',
      phetioID,
      TMenuItem,
      'fired' );
  }

  phetioInherit( TNode, 'TMenuItem', TMenuItem, {}, {
    documentation: 'The item buttons shown in a popup menu',
    events: [ 'fired' ]
  } );

  phetioNamespace.register( 'TMenuItem', TMenuItem );

  return TMenuItem;
} );
