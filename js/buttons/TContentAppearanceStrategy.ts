// Copyright 2022, University of Colorado Boulder

/**
 * Type to annotate the constructor signature of ContentAppearanceStratgey
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import IReadOnlyProperty from '../../../axon/js/IReadOnlyProperty.js';
import { Node } from '../../../scenery/js/imports.js';
import RadioButtonInteractionState from './RadioButtonInteractionState.js';

export type TContentAppearanceStrategyOptions = {
  deselectedContentOpacity?: number;
  overContentOpacity?: number;
  selectedContentOpacity?: number;
};

type TContentAppearanceStrategy = {
  new( content: Node,
       interactionStateProperty: IReadOnlyProperty<RadioButtonInteractionState>,
       options?: TContentAppearanceStrategyOptions ): {
    dispose?: () => void;
  };
};

export default TContentAppearanceStrategy;