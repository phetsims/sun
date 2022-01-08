// Copyright 2018-2021, University of Colorado Boulder

/**
 * Convenience type for horizontal slider.
 * See https://github.com/phetsims/sun/issues/380
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

// For TypeScript support
import Range from '../../dot/js/Range.js'; // eslint-disable-line no-unused-vars
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import merge from '../../phet-core/js/merge.js';
import Orientation from '../../phet-core/js/Orientation.js';
import Slider from './Slider.js';
import sun from './sun.js';

class HSlider extends Slider {

  /**
   * @param {Property.<number>} valueProperty
   * @param {Range|null} range
   * @param {Object} [options]
   */
  constructor( valueProperty, range, options ) {

    assert && assert( !options || options.orientation === undefined, 'HSlider sets orientation' );

    super( valueProperty, range, merge( {
      orientation: Orientation.HORIZONTAL
    }, options ) );

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'HSlider', this );
  }
}

sun.register( 'HSlider', HSlider );
export default HSlider;