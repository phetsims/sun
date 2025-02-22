// Copyright 2020-2025, University of Colorado Boulder

/**
 * HorizontalAquaRadioButtonGroup is a convenience class for creating a vertical AquaRadioButtonGroup.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import type PhetioProperty from '../../axon/js/PhetioProperty.js';
import optionize, { type EmptySelfOptions } from '../../phet-core/js/optionize.js';
import type StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import AquaRadioButtonGroup, { type AquaRadioButtonGroupItem, type AquaRadioButtonGroupOptions } from './AquaRadioButtonGroup.js';
import sun from './sun.js';

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