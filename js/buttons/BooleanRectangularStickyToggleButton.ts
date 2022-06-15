// Copyright 2014-2022, University of Colorado Boulder

/**
 * A rectangular toggle button that switches the value of a boolean Property.  It sticks in the down position when
 * pressed, popping back up when pressed again.
 *
 * This class inherits from the more general RectangularStickyToggleButton, which can take any values.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import IProperty from '../../../axon/js/IProperty.js';
import EmptyObjectType from '../../../phet-core/js/types/EmptyObjectType.js';
import sun from '../sun.js';
import RectangularStickyToggleButton, { RectangularStickyToggleButtonOptions } from './RectangularStickyToggleButton.js';

type SelfOptions = EmptyObjectType;

export type BooleanRectangularStickyToggleButtonOptions = SelfOptions & RectangularStickyToggleButtonOptions;

export default class BooleanRectangularStickyToggleButton extends RectangularStickyToggleButton<boolean> {
  public constructor( booleanProperty: IProperty<boolean>, providedOptions?: BooleanRectangularStickyToggleButtonOptions ) {
    super( false, true, booleanProperty, providedOptions );
  }
}

sun.register( 'BooleanRectangularStickyToggleButton', BooleanRectangularStickyToggleButton );