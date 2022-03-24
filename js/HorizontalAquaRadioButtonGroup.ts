// Copyright 2020-2021, University of Colorado Boulder

/**
 * HorizontalAquaRadioButtonGroup is a convenience class for creating a vertical AquaRadioButtonGroup.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../axon/js/Property.js';
import optionize from '../../phet-core/js/optionize.js';
import AquaRadioButtonGroup, { AquaRadioButtonGroupItem, AquaRadioButtonGroupOptions } from './AquaRadioButtonGroup.js';
import sun from './sun.js';

type SelfOptions = {};

export type HorizontalAquaRadioButtonGroupOptions = SelfOptions & Omit<AquaRadioButtonGroupOptions, 'orientation'>;

export default class HorizontalAquaRadioButtonGroup<T> extends AquaRadioButtonGroup<T> {

  /**
   * @param property
   * @param items
   * @param options
   */
  constructor( property: Property<T>, items: AquaRadioButtonGroupItem<T>[], options?: HorizontalAquaRadioButtonGroupOptions ) {
    super( property, items, optionize<HorizontalAquaRadioButtonGroupOptions, SelfOptions, AquaRadioButtonGroupOptions>( {
      orientation: 'horizontal'
    }, options ) );
  }
}

sun.register( 'HorizontalAquaRadioButtonGroup', HorizontalAquaRadioButtonGroup );