// Copyright 2022-2025, University of Colorado Boulder

/**
 * Type to annotate the constructor signature of ContentAppearanceStratgey
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import type TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import type Node from '../../../scenery/js/nodes/Node.js';
import type RadioButtonInteractionState from './RadioButtonInteractionState.js';

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