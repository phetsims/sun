// Copyright 2013-2024, University of Colorado Boulder

/**
 * VerticalAquaRadioButtonGroup is a convenience class for creating a vertical AquaRadioButtonGroup.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import PhetioProperty from '../../axon/js/PhetioProperty.js';
import optionize, { EmptySelfOptions } from '../../phet-core/js/optionize.js';
import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import AquaRadioButtonGroup, { AquaRadioButtonGroupItem, AquaRadioButtonGroupOptions } from './AquaRadioButtonGroup.js';
import sun from './sun.js';

type SelfOptions = EmptySelfOptions;

export type VerticalAquaRadioButtonGroupOptions = SelfOptions & StrictOmit<AquaRadioButtonGroupOptions, 'orientation'>;

export default class VerticalAquaRadioButtonGroup<T> extends AquaRadioButtonGroup<T> {

  public constructor( property: PhetioProperty<T>, items: AquaRadioButtonGroupItem<T>[], options?: VerticalAquaRadioButtonGroupOptions ) {
    super( property, items, optionize<VerticalAquaRadioButtonGroupOptions, SelfOptions, AquaRadioButtonGroupOptions>()( {
      orientation: 'vertical',
      align: 'left'
    }, options ) );
  }
}

sun.register( 'VerticalAquaRadioButtonGroup', VerticalAquaRadioButtonGroup );