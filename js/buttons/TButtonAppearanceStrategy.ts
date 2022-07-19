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
  stroke?: IPaint;
  lineWidth?: number;
  overFill?: IPaint;
  overStroke?: IPaint;
  deselectedStroke?: IPaint;
  selectedStroke?: IPaint;
  selectedLineWidth?: number;
  deselectedLineWidth?: number;
  overLineWidth?: number;
  deselectedButtonOpacity?: number;
  overButtonOpacity?: number;
  selectedButtonOpacity?: number;
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