// Copyright 2014-2022, University of Colorado Boulder

/**
 * A round toggle button that toggles the value of a boolean Property.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import IProperty from '../../../axon/js/IProperty.js';
import sun from '../sun.js';
import RoundStickyToggleButton, { RoundStickyToggleButtonOptions } from './RoundStickyToggleButton.js';

type SelfOptions = {};

export type BooleanRoundStickyToggleButtonOptions = SelfOptions & RoundStickyToggleButtonOptions;

export default class BooleanRoundStickyToggleButton extends RoundStickyToggleButton<boolean> {
  public constructor( booleanProperty: IProperty<boolean>, providedOptions?: BooleanRoundStickyToggleButtonOptions ) {
    super( false, true, booleanProperty, providedOptions );
  }
}

sun.register( 'BooleanRoundStickyToggleButton', BooleanRoundStickyToggleButton );