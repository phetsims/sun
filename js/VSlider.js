// Copyright 2018-2019, University of Colorado Boulder

/**
 * Convenience type for vertical slider.
 * See https://github.com/phetsims/sun/issues/380
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const InstanceRegistry = require( 'PHET_CORE/documentation/InstanceRegistry' );
  const merge = require( 'PHET_CORE/merge' );
  const swapObjectKeys = require( 'PHET_CORE/swapObjectKeys' );
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

    options = merge( {
      orientation: 'vertical'
    }, options );

    // swap dimensions because Slider.js expects these set up as dimensions for a horizontal slider.
    // These aren't specified in options above, because we want to check against undefined and to use Slider.js defaults.
    if ( options.trackSize !== undefined ) {
      options.trackSize = options.trackSize.flipped();
    }
    if ( options.thumbSize !== undefined ) {
      options.thumbSize = options.thumbSize.flipped();
    }

    swapObjectKeys( options, 'thumbTouchAreaXDilation', 'thumbTouchAreaYDilation' );
    swapObjectKeys( options, 'thumbMouseAreaXDilation', 'thumbMouseAreaYDilation' );

    Slider.call( this, valueProperty, range, options );

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'VSlider', this );
  }

  sun.register( 'VSlider', VSlider );

  return inherit( Slider, VSlider );
} );