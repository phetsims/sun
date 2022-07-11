// Copyright 2022, University of Colorado Boulder

/**
 * Type to annotate the constructor signature of ButtonAppearanceStratgey
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import { Color, Path } from '../../../scenery/js/imports.js';
import RadioButtonInteractionState from './RadioButtonInteractionState.js';
import ButtonInteractionState from './ButtonInteractionState.js';
import IReadOnlyProperty from '../../../axon/js/IReadOnlyProperty.js';

type TButtonAppearanceStrategy = {
  new( content: Path,
       interactionStateProperty: IReadOnlyProperty<ButtonInteractionState | RadioButtonInteractionState>,
       baseColorProperty: IReadOnlyProperty<Color>,
       options?: any ): {
    dispose?: () => void;
    maxLineWidth: number;
  };
};

export default TButtonAppearanceStrategy;