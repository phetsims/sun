// Copyright 2022, University of Colorado Boulder

/**
 * Type to annotate the constructor signature of ContentAppearanceStratgey
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import { Node } from '../../../scenery/js/imports.js';
import RadioButtonInteractionState from './RadioButtonInteractionState.js';

export type TContentAppearanceStrategyOptions = {
  deselectedContentOpacity?: number;
  overContentOpacity?: number;
  selectedContentOpacity?: number;
};

type TContentAppearanceStrategy = {
  new( content: Node,
       interactionStateProperty: TReadOnlyProperty<RadioButtonInteractionState>,
       options?: TContentAppearanceStrategyOptions ): {
    dispose?: () => void;
  };
};

export default TContentAppearanceStrategy;