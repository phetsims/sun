// Copyright 2014-2020, University of Colorado Boulder

/**
 * Horizontal separator, for use in control panels.
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

  /**
   * @param {number} width
   * @param {Object} [options]
   * @constructor
   */
  function HSeparator( width, options ) {
    options = merge( {
      stroke: 'rgb(100,100,100)'
    }, options );

    Line.call( this, 0, 0, width, 0, options );
  }

  sun.register( 'HSeparator', HSeparator );

  return inherit( Line, HSeparator );
} );
