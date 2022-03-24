// Copyright 2022, University of Colorado Boulder

/**
 * Type to annotate the constructor signature of ContentAppearanceStratgey
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import IProperty from '../../../axon/js/IProperty.js';
import { Node } from '../../../scenery/js/imports.js';
import RadioButtonInteractionState from './RadioButtonInteractionState.js';

type TContentAppearanceStrategy = {
  dispose?: () => void;
  new( content: Node,
       interactionStateProperty: IProperty<RadioButtonInteractionState>,
       options: any ): any;
};

export default TContentAppearanceStrategy;