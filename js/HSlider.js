// Copyright 2018, University of Colorado Boulder

/**
 * Convenience type for horizontal slider.
 * See https://github.com/phetsims/sun/issues/380
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Slider = require( 'SUN/Slider' );
  var sun = require( 'SUN/sun' );

  /**
   * @param {Property.<number>} valueProperty
   * @param {{min:number, max:number}|Range} range
   * @param {Object} [options]
   * @constructor
   */
  function HSlider( valueProperty, range, options ) {

    assert && assert( !options || options.orientation === undefined, 'HSlider sets orientation' );

    Slider.call( this, valueProperty, range, _.extend( {
      orientation: 'horizontal'
    }, options ) );
  }

  sun.register( 'HSlider', HSlider );

  return inherit( Slider, HSlider );
} );