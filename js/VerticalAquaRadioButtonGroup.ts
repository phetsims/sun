// Copyright 2013-2022, University of Colorado Boulder

/**
 * VerticalAquaRadioButtonGroup is a convenience class for creating a vertical AquaRadioButtonGroup.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../axon/js/Property.js';
import optionize from '../../phet-core/js/optionize.js';
import AquaRadioButtonGroup, { AquaRadioButtonGroupItem, AquaRadioButtonGroupOptions } from './AquaRadioButtonGroup.js';
import sun from './sun.js';

type SelfOptions = {};

export type VerticalAquaRadioButtonGroupOptions = SelfOptions & Omit<AquaRadioButtonGroupOptions, 'orientation'>;

export default class VerticalAquaRadioButtonGroup<T> extends AquaRadioButtonGroup<T> {

  /**
   * @param property
   * @param items
   * @param options
   */
  constructor( property: Property<T>, items: AquaRadioButtonGroupItem<T>[], options?: VerticalAquaRadioButtonGroupOptions ) {
    super( property, items, optionize<VerticalAquaRadioButtonGroupOptions, SelfOptions, AquaRadioButtonGroupOptions>( {
      orientation: 'vertical'
    }, options ) );
  }
}

sun.register( 'VerticalAquaRadioButtonGroup', VerticalAquaRadioButtonGroup );