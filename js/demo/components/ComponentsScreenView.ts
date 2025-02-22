// Copyright 2015-2025, University of Colorado Boulder

/**
 * Demonstration of misc sun UI components.
 * Demos are selected from a combo box, and are instantiated on demand.
 * Use the 'component' query parameter to set the initial selection of the combo box.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { type EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import type PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import sun from '../../sun.js';
import DemosScreenView, { type DemosScreenViewOptions } from '../DemosScreenView.js';
import demoABSwitch from './demoABSwitch.js';
import demoAccordionBox from './demoAccordionBox.js';
import demoAlignGroup from './demoAlignGroup.js';
import demoCarousel from './demoCarousel.js';
import demoCheckbox from './demoCheckbox.js';
import demoComboBox from './demoComboBox.js';
import demoNumberPicker from './demoNumberPicker.js';
import demoNumberSpinner from './demoNumberSpinner.js';
import demoOnOffSwitch from './demoOnOffSwitch.js';
import demoPageControl from './demoPageControl.js';
import { demoHSlider, demoVSlider } from './demoSlider.js';
import demoToggleSwitch from './demoToggleSwitch.js';

type SelfOptions = EmptySelfOptions;
type ComponentsScreenViewOptions = SelfOptions & PickRequired<DemosScreenViewOptions, 'tandem'>;

export default class ComponentsScreenView extends DemosScreenView {

  public constructor( options: ComponentsScreenViewOptions ) {

    // To add a demo, add an entry here of type DemoItemData.
    const demos = [
      { label: 'ABSwitch', createNode: demoABSwitch },
      { label: 'Carousel', createNode: demoCarousel },
      { label: 'Checkbox', createNode: demoCheckbox },
      { label: 'ComboBox', createNode: demoComboBox },
      { label: 'HSlider', createNode: demoHSlider },
      { label: 'VSlider', createNode: demoVSlider },
      { label: 'OnOffSwitch', createNode: demoOnOffSwitch },
      { label: 'PageControl', createNode: demoPageControl },
      { label: 'NumberPicker', createNode: demoNumberPicker },
      { label: 'NumberSpinner', createNode: demoNumberSpinner },
      { label: 'AlignGroup', createNode: demoAlignGroup },
      { label: 'AccordionBox', createNode: demoAccordionBox },
      { label: 'ToggleSwitch', createNode: demoToggleSwitch }
    ];

    super( demos, options );
  }
}

sun.register( 'ComponentsScreenView', ComponentsScreenView );