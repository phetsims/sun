// Copyright 2018-2022, University of Colorado Boulder

/**
 * Convenience type for horizontal slider.
 * See https://github.com/phetsims/sun/issues/380
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Range from '../../dot/js/Range.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import Orientation from '../../phet-core/js/Orientation.js';
import Slider, { SliderOptions } from './Slider.js';
import sun from './sun.js';
import optionize from '../../phet-core/js/optionize.js';
import { EmptySelfOptions } from '../../phet-core/js/optionize.js';
import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import Property from '../../axon/js/Property.js';

type SelfOptions = EmptySelfOptions;

export type HSliderOptions = SelfOptions & StrictOmit<SliderOptions, 'orientation'>;

export default class HSlider extends Slider {

  public constructor( valueProperty: Property<number>, range: Range, options?: HSliderOptions ) {

    super( valueProperty, range, optionize<HSliderOptions, SelfOptions, SliderOptions>()( {
      orientation: Orientation.HORIZONTAL
    }, options ) );

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    // @ts-ignore chipper query parameters
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'HSlider', this );
  }
}

sun.register( 'HSlider', HSlider );
