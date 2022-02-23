// Copyright 2022, University of Colorado Boulder

/**
 * Type to annotate the constructor signature of ButtonAppearanceStratgey
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import IProperty from '../../../axon/js/IProperty.js';
import { Path } from '../../../scenery/js/imports.js';
import RadioButtonInteractionState from './RadioButtonInteractionState.js';

type TButtonAppearanceStrategy = {
  dispose?: () => void,
  new( content: Path,
       interactionStateProperty: IProperty<RadioButtonInteractionState>,
       baseColorProperty: IProperty<ColorDef>,
       options: any ): any
}

export default TButtonAppearanceStrategy;