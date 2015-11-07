// Copyright 2014-2015, University of Colorado Boulder

/**
 * Vertical separator, for use in control panels.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Line = require( 'SCENERY/nodes/Line' );

  function VSeparator( height, options ) {
    options = _.extend( {
      stroke: 'rgb(100,100,100)'
    }, options );
    Line.call( this, 0, 0, 0, height, options );
  }

  return inherit( Line, VSeparator );
} );

