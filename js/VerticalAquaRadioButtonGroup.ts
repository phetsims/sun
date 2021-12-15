// Copyright 2013-2021, University of Colorado Boulder

/**
 * VerticalAquaRadioButtonGroup is a convenience class for creating a vertical AquaRadioButtonGroup.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../axon/js/Property.js';
import merge from '../../phet-core/js/merge.js';
import AquaRadioButtonGroup, { AquaRadioButtonGroupItem, AquaRadioButtonGroupOptions } from './AquaRadioButtonGroup.js';
import sun from './sun.js';

type VerticalAquaRadioButtonGroupOptions = Omit< AquaRadioButtonGroupOptions, 'orientation' >;

class VerticalAquaRadioButtonGroup<T> extends AquaRadioButtonGroup<T> {

  /**
   * @param property
   * @param items
   * @param options
   */
  constructor( property: Property<T>, items: AquaRadioButtonGroupItem<T>[], options?: VerticalAquaRadioButtonGroupOptions ) {
    super( property, items, merge( {
      orientation: 'vertical'
    }, options ) );
  }
}

sun.register( 'VerticalAquaRadioButtonGroup', VerticalAquaRadioButtonGroup );
export default VerticalAquaRadioButtonGroup;
export type { VerticalAquaRadioButtonGroupOptions };