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

  /**
   * IO type for phet/sun's Dialog
   * @param {Dialog} dialog - instance of Dialog
   * @param {string} phetioID - identifier string
   * @constructor
   */
  function DialogIO( dialog, phetioID ) {
    NodeIO.call( this, dialog, phetioID );
  }

  phetioInherit( NodeIO, 'DialogIO', DialogIO, {}, {
    documentation: 'A dialog panel',
    validator: { isValidValue: v => v instanceof phet.sun.Dialog }
  } );

  sun.register( 'DialogIO', DialogIO );

  return DialogIO;
} );
