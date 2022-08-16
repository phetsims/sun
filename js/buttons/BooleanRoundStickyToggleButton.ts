// Copyright 2014-2022, University of Colorado Boulder

/**
 * A round toggle button that toggles the value of a boolean Property.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import TProperty from '../../../axon/js/TProperty.js';
import { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import sun from '../sun.js';
import RoundStickyToggleButton, { RoundStickyToggleButtonOptions } from './RoundStickyToggleButton.js';

type SelfOptions = EmptySelfOptions;

export type BooleanRoundStickyToggleButtonOptions = SelfOptions & RoundStickyToggleButtonOptions;

export default class BooleanRoundStickyToggleButton extends RoundStickyToggleButton<boolean> {
  public constructor( booleanProperty: TProperty<boolean>, providedOptions?: BooleanRoundStickyToggleButtonOptions ) {
    super( booleanProperty, false, true, providedOptions );
  }
}

sun.register( 'BooleanRoundStickyToggleButton', BooleanRoundStickyToggleButton );