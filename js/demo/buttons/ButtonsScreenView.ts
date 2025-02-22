// Copyright 2014-2025, University of Colorado Boulder

/**
 * Main ScreenView container for demonstrating and testing the various buttons.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import { type EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import type PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import sun from '../../sun.js';
import DemosScreenView, { type DemosScreenViewOptions } from '../DemosScreenView.js';
import demoAquaRadioButtonGroup from './demoAquaRadioButtonGroup.js';
import demoMomentaryButtons from './demoMomentaryButtons.js';
import demoPushButtons from './demoPushButtons.js';
import demoRadioButtons from './demoRadioButtons.js';
import demoRectangularRadioButtonGroup from './demoRectangularRadioButtonGroup.js';
import demoToggleButtons from './demoToggleButtons.js';

type SelfOptions = EmptySelfOptions;
type ButtonsScreenViewOptions = SelfOptions & PickRequired<DemosScreenViewOptions, 'tandem'>;

export default class ButtonsScreenView extends DemosScreenView {
  public constructor( providedOptions: ButtonsScreenViewOptions ) {

    // To add a demo, add an entry here of type DemoItemData.
    const demos = [
      { label: 'AquaRadioButtonGroup', createNode: demoAquaRadioButtonGroup },
      { label: 'MomentaryButtons', createNode: demoMomentaryButtons },
      { label: 'PushButtons', createNode: demoPushButtons },
      { label: 'RadioButtons', createNode: demoRadioButtons },
      { label: 'RadioButtons', createNode: demoRadioButtons },
      { label: 'RectangularRadioButtonGroup', createNode: demoRectangularRadioButtonGroup },
      { label: 'ToggleButtons', createNode: demoToggleButtons }
    ];

    super( demos, providedOptions );
  }
}

sun.register( 'ButtonsScreenView', ButtonsScreenView );