// Copyright 2018, University of Colorado Boulder

/**
 * Convenience type for vertical slider.
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
   * @param {Range} range
   * @param {Object} [options]
   * @constructor
   */
  function VSlider( valueProperty, range, options ) {

    assert && assert( !options || options.orientation === undefined, 'VSlider sets orientation' );

    Slider.call( this, valueProperty, range, _.extend( {
      orientation: 'vertical'
    }, options ) );
  }

  sun.register( 'VSlider', VSlider );

  return inherit( Slider, VSlider );
} );