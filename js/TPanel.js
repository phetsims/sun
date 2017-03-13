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
  var sun = require( 'SUN/sun' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var TNode = require( 'SCENERY/nodes/TNode' );

  /**
   * Wrapper type for phet/sun's Panel class.
   * @param panel
   * @param phetioID
   * @constructor
   */
  function TPanel( panel, phetioID ) {
    TNode.call( this, panel, phetioID );
    assertInstanceOf( panel, phet.sun.Panel );
  }

  phetioInherit( TNode, 'TPanel', TPanel, {}, {
    documentation: 'A container for other TNodes'
  } );

  sun.register( 'TPanel', TPanel );

  return TPanel;
} );

