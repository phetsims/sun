// Copyright 2018-2025, University of Colorado Boulder

/**
 * Convenience type for vertical slider.
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
import { default as Slider, type SliderOptions } from './Slider.js';
import sun from './sun.js';

type SelfOptions = EmptySelfOptions;

export type VSliderOptions = SelfOptions & StrictOmit<SliderOptions, 'orientation'>;

export default class VSlider extends Slider {

  public constructor( valueProperty: PhetioProperty<number>, range: Range, options?: VSliderOptions ) {

    options = optionize<VSliderOptions, SelfOptions, SliderOptions>()( {
      orientation: Orientation.VERTICAL
    }, options );

    super( valueProperty, range, options );

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && window.phet?.chipper?.queryParameters?.binder && InstanceRegistry.registerDataURL( 'sun', 'VSlider', this );
  }
}

sun.register( 'VSlider', VSlider );