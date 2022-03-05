// Copyright 2022, University of Colorado Boulder

/**
 * Type to annotate the constructor signature of ButtonAppearanceStratgey
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import IProperty from '../../../axon/js/IProperty.js';
import Property from '../../../axon/js/Property.js';
import { Color, PaintableNode } from '../../../scenery/js/imports.js';
import RadioButtonInteractionState from './RadioButtonInteractionState.js';
import ButtonInteractionState from './ButtonInteractionState.js';

type TButtonAppearanceStrategy = {
  dispose?: () => void,
  new( content: PaintableNode,
       interactionStateProperty: IProperty<ButtonInteractionState | RadioButtonInteractionState>,
       baseColorProperty: Property<Color>,
       options?: any ): any
}

export default TButtonAppearanceStrategy;