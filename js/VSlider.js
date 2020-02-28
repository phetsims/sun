// Copyright 2018-2020, University of Colorado Boulder

/**
 * Convenience type for vertical slider.
 * See https://github.com/phetsims/sun/issues/380
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import inherit from '../../phet-core/js/inherit.js';
import merge from '../../phet-core/js/merge.js';
import swapObjectKeys from '../../phet-core/js/swapObjectKeys.js';
import Slider from './Slider.js';
import sun from './sun.js';

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

inherit( Slider, VSlider );
export default VSlider;