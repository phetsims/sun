// Copyright 2018-2024, University of Colorado Boulder

/**
 * Convenience type for vertical slider.
 * See https://github.com/phetsims/sun/issues/380
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import PhetioProperty from '../../axon/js/PhetioProperty.js';
import Range from '../../dot/js/Range.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { EmptySelfOptions } from '../../phet-core/js/optionize.js';
import Orientation from '../../phet-core/js/Orientation.js';
import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import { default as Slider, SliderOptions } from './Slider.js';
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