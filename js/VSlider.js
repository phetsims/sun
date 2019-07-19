// Copyright 2018-2019, University of Colorado Boulder

/**
 * Convenience type for vertical slider.
 * See https://github.com/phetsims/sun/issues/380
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
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
  function VSlider( valueProperty, range, options ) {

    assert && assert( !options || options.orientation === undefined, 'VSlider sets orientation' );

    Slider.call( this, valueProperty, range, _.extend( {
      orientation: 'vertical'
    }, options ) );

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'VSlider', this );
  }

  sun.register( 'VSlider', VSlider );

  return inherit( Slider, VSlider );
} );