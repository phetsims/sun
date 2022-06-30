// Copyright 2014-2022, University of Colorado Boulder

/**
 * Main ScreenView container for demonstrating and testing the various buttons.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import EmptyObjectType from '../../../../phet-core/js/types/EmptyObjectType.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import sun from '../../sun.js';
import DemosScreenView, { DemosScreenViewOptions } from '../DemosScreenView.js';
import demoAquaRadioButtonGroup from './demoAquaRadioButtonGroup.js';
import demoRadioButtons from './demoRadioButtons.js';
import demoToggleButtons from './demoToggleButtons.js';
import demoMomentaryButtons from './demoMomentaryButtons.js';
import demoPushButtons from './demoPushButtons.js';

type SelfOptions = EmptyObjectType;
type ButtonsScreenViewOptions = SelfOptions & PickRequired<DemosScreenViewOptions, 'tandem'>;

export default class ButtonsScreenView extends DemosScreenView {
  public constructor( providedOptions: ButtonsScreenViewOptions ) {
    super( [
      { label: 'AquaRadioButtonGroup', createNode: demoAquaRadioButtonGroup },
      { label: 'MomentaryButtons', createNode: demoMomentaryButtons },
      { label: 'PushButtons', createNode: demoPushButtons },
      { label: 'RadioButtons', createNode: demoRadioButtons },
      { label: 'ToggleButtons', createNode: demoToggleButtons }
    ], providedOptions );
  }
}

sun.register( 'ButtonsScreenView', ButtonsScreenView );