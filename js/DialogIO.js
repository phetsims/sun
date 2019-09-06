// Copyright 2018-2019, University of Colorado Boulder

/**
 * IO type for Dialog
 * Used to live at 'JOIST/DialogIO'. Moved to 'SUN/DialogIO' on 4/10/2018
 *
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  var NodeIO = require( 'SCENERY/nodes/NodeIO' );
  const ObjectIO = require( 'TANDEM/types/ObjectIO' );
  var sun = require( 'SUN/sun' );

  class DialogIO extends NodeIO {}

  DialogIO.documentation = 'A dialog panel';
  DialogIO.validator = { isValidValue: v => v instanceof phet.sun.Dialog };
  DialogIO.typeName = 'DialogIO';
  ObjectIO.validateSubtype( DialogIO );

  return sun.register( 'DialogIO', DialogIO );
} );