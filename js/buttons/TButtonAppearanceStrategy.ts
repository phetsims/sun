// Copyright 2022, University of Colorado Boulder

/**
 * Type to annotate the constructor signature of ButtonAppearanceStrategy
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import { Color, TPaint, Path } from '../../../scenery/js/imports.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import ButtonInteractionState from './ButtonInteractionState.js';
import RadioButtonInteractionState from './RadioButtonInteractionState.js';

export type TButtonAppearanceStrategyOptions = {

  // These two act as defaults for the other strokes and line widths when provided, as sort of "convenience options".
  stroke?: TPaint;
  lineWidth?: number;

  // Fill, stroke, line width, and opacity values for the various button states.
  overFill?: TPaint;
  overStroke?: TPaint;
  overLineWidth?: number;
  overButtonOpacity?: number;
  selectedStroke?: TPaint;
  selectedLineWidth?: number;
  selectedButtonOpacity?: number;
  deselectedStroke?: TPaint;
  deselectedLineWidth?: number;
  deselectedButtonOpacity?: number;
};

type TButtonAppearanceStrategy = {
  new( content: Path,
       interactionStateProperty: TReadOnlyProperty<ButtonInteractionState | RadioButtonInteractionState>,
       baseColorProperty: TReadOnlyProperty<Color>,
       options?: TButtonAppearanceStrategyOptions ): {
    dispose?: () => void;
    maxLineWidth: number;
  };
};

export default TButtonAppearanceStrategy;