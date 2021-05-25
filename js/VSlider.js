// Copyright 2018-2021, University of Colorado Boulder

/**
 * Convenience type for vertical slider.
 * See https://github.com/phetsims/sun/issues/380
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import merge from '../../phet-core/js/merge.js';
import Orientation from '../../phet-core/js/Orientation.js';
import swapObjectKeys from '../../phet-core/js/swapObjectKeys.js';
import Slider from './Slider.js';
import sun from './sun.js';

class VSlider extends Slider {

  /**
   * @param {Property.<number>} valueProperty
   * @param {Range} range
   * @param {Object} [options]
   */
  constructor( valueProperty, range, options ) {

    assert && assert( !options || options.orientation === undefined, 'VSlider sets orientation' );

    options = merge( {
      orientation: Orientation.VERTICAL
    }, options );

    // The client should provide dimensions that are specific to a vertical slider. But Slider.js expects dimensions
    // for a horizontal slider, and then creates the vertical orientation using rotation.  So if the client provides
    // any dimensions for a vertical slider, swap those dimensions to horizontal.
    if ( options.trackSize !== undefined ) {
      options.trackSize = options.trackSize.swapped();
    }
    if ( options.thumbSize !== undefined ) {
      options.thumbSize = options.thumbSize.swapped();
    }
    swapObjectKeys( options, 'thumbTouchAreaXDilation', 'thumbTouchAreaYDilation' );
    swapObjectKeys( options, 'thumbMouseAreaXDilation', 'thumbMouseAreaYDilation' );

    super( valueProperty, range, options );

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'VSlider', this );
  }
}

sun.register( 'VSlider', VSlider );
export default VSlider;