// Copyright 2018-2020, University of Colorado Boulder

/**
 * Convenience type for horizontal slider.
 * See https://github.com/phetsims/sun/issues/380
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import inherit from '../../phet-core/js/inherit.js';
import merge from '../../phet-core/js/merge.js';
import Slider from './Slider.js';
import sun from './sun.js';

/**
 * @param {Property.<number>} valueProperty
 * @param {Range} range
 * @param {Object} [options]
 * @constructor
 */
function HSlider( valueProperty, range, options ) {

  assert && assert( !options || options.orientation === undefined, 'HSlider sets orientation' );

  Slider.call( this, valueProperty, range, merge( {
    orientation: 'horizontal'
  }, options ) );

  // support for binder documentation, stripped out in builds and only runs when ?binder is specified
  assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'HSlider', this );
}

sun.register( 'HSlider', HSlider );

inherit( Slider, HSlider );
export default HSlider;