// Copyright 2002-2013, University of Colorado Boulder

/**
 * An invisible and very narrow rectangle used for creating vertical space
 * when laying out panels.
 */
define( function( require ) {
  'use strict';

  // Imports
  var inherit = require( 'PHET_CORE/inherit' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // Constants, change if you need to see the struts.
  var FILL = 'rgba( 0, 0, 0, 0 )';
  var WIDTH = 1E-5;

  function VStrut( height ) {
    Rectangle.call( this, 0, 0, WIDTH, height, 0, 0, { fill: FILL } );
  }

  return inherit( Rectangle, VStrut );
} );

