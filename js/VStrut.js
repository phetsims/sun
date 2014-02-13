// Copyright 2002-2013, University of Colorado Boulder

/**
 * An invisible line used for creating vertical space when laying out panels.
 */
define( function( require ) {
  'use strict';

  // Imports
  var inherit = require( 'PHET_CORE/inherit' );
  var Line = require( 'SCENERY/nodes/Line' );

  function VStrut( height ) {
    Line.call( this, 0, 0, 0, height );
  }

  return inherit( Line, VStrut );
} );

