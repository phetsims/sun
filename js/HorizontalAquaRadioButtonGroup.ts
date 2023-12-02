// Copyright 2020-2023, University of Colorado Boulder

/**
 * HorizontalAquaRadioButtonGroup is a convenience class for creating a vertical AquaRadioButtonGroup.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import optionize, { EmptySelfOptions } from '../../phet-core/js/optionize.js';
import AquaRadioButtonGroup, { AquaRadioButtonGroupItem, AquaRadioButtonGroupOptions } from './AquaRadioButtonGroup.js';
import sun from './sun.js';
import PhetioProperty from '../../axon/js/PhetioProperty.js';

type SelfOptions = EmptySelfOptions;

export type HorizontalAquaRadioButtonGroupOptions = SelfOptions & StrictOmit<AquaRadioButtonGroupOptions, 'orientation'>;

export default class HorizontalAquaRadioButtonGroup<T> extends AquaRadioButtonGroup<T> {
  public constructor( property: PhetioProperty<T>, items: AquaRadioButtonGroupItem<T>[], options?: HorizontalAquaRadioButtonGroupOptions ) {
    super( property, items, optionize<HorizontalAquaRadioButtonGroupOptions, SelfOptions, AquaRadioButtonGroupOptions>()( {
      orientation: 'horizontal'
    }, options ) );
  }
}

sun.register( 'HorizontalAquaRadioButtonGroup', HorizontalAquaRadioButtonGroup );