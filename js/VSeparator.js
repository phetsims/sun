// Copyright 2014-2019, University of Colorado Boulder

/**
 * Vertical separator, for use in control panels.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const Line = require( 'SCENERY/nodes/Line' );
  const merge = require( 'PHET_CORE/merge' );
  const sun = require( 'SUN/sun' );

  function VSeparator( height, options ) {
    options = merge( {
      stroke: 'rgb(100,100,100)'
    }, options );

    Line.call( this, 0, 0, 0, height, options );
  }

  sun.register( 'VSeparator', VSeparator );

  return inherit( Line, VSeparator );
} );

