// Copyright 2018-2023, University of Colorado Boulder

/**
 * Convenience type for vertical slider.
 * See https://github.com/phetsims/sun/issues/380
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import Range from '../../dot/js/Range.js';
import Orientation from '../../phet-core/js/Orientation.js';
import { default as Slider, SliderOptions } from './Slider.js';
import sun from './sun.js';
import optionize, { EmptySelfOptions } from '../../phet-core/js/optionize.js';
import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import LinkableProperty from '../../axon/js/LinkableProperty.js';

type SelfOptions = EmptySelfOptions;

export type VSliderOptions = SelfOptions & StrictOmit<SliderOptions, 'orientation'>;

export default class VSlider extends Slider {

  public constructor( valueProperty: LinkableProperty<number>, range: Range, options?: VSliderOptions ) {

    options = optionize<VSliderOptions, SelfOptions, SliderOptions>()( {
      orientation: Orientation.VERTICAL
    }, options );

    super( valueProperty, range, options );

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'VSlider', this );
  }
}

sun.register( 'VSlider', VSlider );
