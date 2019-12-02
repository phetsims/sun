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
  const Dimension2 = require( 'DOT/Dimension2' );
  const inherit = require( 'PHET_CORE/inherit' );
  const InstanceRegistry = require( 'PHET_CORE/documentation/InstanceRegistry' );
  const merge = require( 'PHET_CORE/merge' );
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
      options.trackSize = new Dimension2( options.trackSize.height, options.trackSize.width );
    }
    if ( options.thumbSize !== undefined ) {
      options.thumbSize = new Dimension2( options.thumbSize.height, options.thumbSize.width );
    }
    Slider.call( this, valueProperty, range, options );

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'VSlider', this );
  }

  sun.register( 'VSlider', VSlider );

  return inherit( Slider, VSlider );
} );