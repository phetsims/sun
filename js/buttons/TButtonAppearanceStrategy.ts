// Copyright 2022, University of Colorado Boulder

/**
 * Type to annotate the constructor signature of ButtonAppearanceStrategy
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import IReadOnlyProperty from '../../../axon/js/IReadOnlyProperty.js';
import { Color, IPaint, Path } from '../../../scenery/js/imports.js';
import ButtonInteractionState from './ButtonInteractionState.js';
import RadioButtonInteractionState from './RadioButtonInteractionState.js';

export type TButtonAppearanceStrategyOptions = {

  // These two act as defaults for the other strokes and line widths when provided, as sort of "convenience options".
  stroke?: IPaint;
  lineWidth?: number;

  // Fill, stroke, line width, and opacity values for the various button states.
  overFill?: IPaint;
  overStroke?: IPaint;
  overLineWidth?: number;
  overButtonOpacity?: number;
  selectedStroke?: IPaint;
  selectedLineWidth?: number;
  selectedButtonOpacity?: number;
  deselectedStroke?: IPaint;
  deselectedLineWidth?: number;
  deselectedButtonOpacity?: number;
};

type TButtonAppearanceStrategy = {
  new( content: Path,
       interactionStateProperty: IReadOnlyProperty<ButtonInteractionState | RadioButtonInteractionState>,
       baseColorProperty: IReadOnlyProperty<Color>,
       options?: TButtonAppearanceStrategyOptions ): {
    dispose?: () => void;
    maxLineWidth: number;
  };
};

export default TButtonAppearanceStrategy;