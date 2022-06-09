// Copyright 2020-2022, University of Colorado Boulder

/**
 * HorizontalAquaRadioButtonGroup is a convenience class for creating a vertical AquaRadioButtonGroup.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import IProperty from '../../axon/js/IProperty.js';
import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import optionize from '../../phet-core/js/optionize.js';
import AquaRadioButtonGroup, { AquaRadioButtonGroupItem, AquaRadioButtonGroupOptions } from './AquaRadioButtonGroup.js';
import sun from './sun.js';

type SelfOptions = {};

export type HorizontalAquaRadioButtonGroupOptions = SelfOptions & StrictOmit<AquaRadioButtonGroupOptions, 'orientation'>;

export default class HorizontalAquaRadioButtonGroup<T> extends AquaRadioButtonGroup<T> {
  public constructor( property: IProperty<T>, items: AquaRadioButtonGroupItem<T>[], options?: HorizontalAquaRadioButtonGroupOptions ) {
    super( property, items, optionize<HorizontalAquaRadioButtonGroupOptions, SelfOptions, AquaRadioButtonGroupOptions>()( {
      orientation: 'horizontal'
    }, options ) );
  }
}

sun.register( 'HorizontalAquaRadioButtonGroup', HorizontalAquaRadioButtonGroup );