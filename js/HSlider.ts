// Copyright 2018-2025, University of Colorado Boulder

/**
 * Convenience type for horizontal slider.
 * See https://github.com/phetsims/sun/issues/380
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import type PhetioProperty from '../../axon/js/PhetioProperty.js';
import type Range from '../../dot/js/Range.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { type EmptySelfOptions } from '../../phet-core/js/optionize.js';
import Orientation from '../../phet-core/js/Orientation.js';
import type StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import Slider, { type SliderOptions } from './Slider.js';
import sun from './sun.js';

type SelfOptions = EmptySelfOptions;

export type HSliderOptions = SelfOptions & StrictOmit<SliderOptions, 'orientation'>;

export default class HSlider extends Slider {

  public constructor( valueProperty: PhetioProperty<number>, range: Range, options?: HSliderOptions ) {

    super( valueProperty, range, optionize<HSliderOptions, SelfOptions, SliderOptions>()( {
      orientation: Orientation.HORIZONTAL
    }, options ) );

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && window.phet?.chipper?.queryParameters?.binder && InstanceRegistry.registerDataURL( 'sun', 'HSlider', this );
  }
}

sun.register( 'HSlider', HSlider );