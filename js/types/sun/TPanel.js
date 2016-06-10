// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'PHET_IO/assertions/assertInstanceOf' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var TNode = require( 'PHET_IO/types/scenery/nodes/TNode' );

  var TPanel = phetioInherit( TNode, 'TPanel', function( panel, phetioID ) {
    TNode.call( this, panel, phetioID );
    assertInstanceOf( panel, phet.sun.Panel );
  }, {}, {
    documentation: 'A container for other TNodes'
  } );

  phetioNamespace.register( 'TPanel', TPanel );

  return TPanel;
} );

