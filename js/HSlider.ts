// Copyright 2018-2022, University of Colorado Boulder

/**
 * Convenience type for horizontal slider.
 * See https://github.com/phetsims/sun/issues/380
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import IProperty from '../../axon/js/IProperty.js';
import Range from '../../dot/js/Range.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import IntentionalAny from '../../phet-core/js/types/IntentionalAny.js';
import merge from '../../phet-core/js/merge.js';
import Orientation from '../../phet-core/js/Orientation.js';
import Slider, { SliderOptions } from './Slider.js';
import sun from './sun.js';

export type HSliderOptions = Omit<SliderOptions, 'orientation'>;

export default class HSlider extends Slider {

  constructor( valueProperty: IProperty<number>, range: Range, options?: HSliderOptions ) {

    assert && assert( !options || ( options as IntentionalAny ).orientation === undefined, 'HSlider sets orientation' );

    super( valueProperty, range, merge( {
      orientation: Orientation.HORIZONTAL
    }, options ) );

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    // @ts-ignore chipper query parameters
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'HSlider', this );
  }
}

sun.register( 'HSlider', HSlider );
