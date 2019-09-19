// Copyright 2018-2019, University of Colorado Boulder

/**
 * Convenience type for horizontal slider.
 * See https://github.com/phetsims/sun/issues/380
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const InstanceRegistry = require( 'PHET_CORE/documentation/InstanceRegistry' );
  const Slider = require( 'SUN/Slider' );
  const sun = require( 'SUN/sun' );

  /**
   * @param {Property.<number>} valueProperty
   * @param {Range} range
   * @param {Object} [options]
   * @constructor
   */
  function HSlider( valueProperty, range, options ) {

    assert && assert( !options || options.orientation === undefined, 'HSlider sets orientation' );

    Slider.call( this, valueProperty, range, _.extend( {
      orientation: 'horizontal'
    }, options ) );

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'HSlider', this );
  }

  sun.register( 'HSlider', HSlider );

  return inherit( Slider, HSlider );
} );