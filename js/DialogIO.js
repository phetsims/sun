// Copyright 2018, University of Colorado Boulder

/**
 * IO type for Dialog
 * Used to live at 'JOIST/DialogIO'. Moved to 'SUN/DialogIO' on 4/10/2018
 *
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  var NodeIO = require( 'SCENERY/nodes/NodeIO' );
  var phetioInherit = require( 'TANDEM/phetioInherit' );
  var sun = require( 'SUN/sun' );

  // ifphetio
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );

  /**
   * IO type for phet/sun's Dialog
   * @param {Dialog} dialog - instance of Dialog
   * @param {string} phetioID - identifier string
   * @constructor
   */
  function DialogIO( dialog, phetioID ) {
    assert && assertInstanceOf( dialog, phet.sun.Dialog );
    NodeIO.call( this, dialog, phetioID );
  }

  phetioInherit( NodeIO, 'DialogIO', DialogIO, {}, {
    documentation: 'A dialog panel'
  } );

  sun.register( 'DialogIO', DialogIO );

  return DialogIO;
} );
