// Copyright 2022, University of Colorado Boulder

/**
 * Type to annotate the constructor signature of ButtonAppearanceStratgey
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import IProperty from '../../../axon/js/IProperty.js';
import { Color, Path } from '../../../scenery/js/imports.js';
import RadioButtonInteractionState from './RadioButtonInteractionState.js';
import ButtonInteractionState from './ButtonInteractionState.js';

type TButtonAppearanceStrategy = {
  new( content: Path,
       interactionStateProperty: IProperty<ButtonInteractionState | RadioButtonInteractionState>,
       baseColorProperty: IProperty<Color>,
       options?: any ): {
    dispose?: () => void;
    maxLineWidth: number;
  };
}

export default TButtonAppearanceStrategy;