// Copyright 2018-2022, University of Colorado Boulder

/**
 * Convenience type for vertical slider.
 * See https://github.com/phetsims/sun/issues/380
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import IProperty from '../../axon/js/IProperty.js';
import Range from '../../dot/js/Range.js';
import merge from '../../phet-core/js/merge.js';
import Orientation from '../../phet-core/js/Orientation.js';
import { default as Slider, SliderOptions } from './Slider.js';
import sun from './sun.js';
import IntentionalAny from '../../phet-core/js/types/IntentionalAny.js';

export type VSliderOptions = Omit<SliderOptions, 'orientation'>;

class VSlider extends Slider {

  constructor( valueProperty: IProperty<number>, range: Range, options?: VSliderOptions ) {

    assert && assert( !options || ( options as IntentionalAny ).orientation === undefined, 'VSlider sets orientation' );

    options = merge( {
      orientation: Orientation.VERTICAL
    }, options );

    super( valueProperty, range, options );

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    // @ts-ignore chipper query parameters
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'VSlider', this );
  }
}

sun.register( 'VSlider', VSlider );
export default VSlider;