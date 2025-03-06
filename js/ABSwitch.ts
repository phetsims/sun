// Copyright 2014-2025, University of Colorado Boulder

/**
 * ABSwitch is a control for switching between 2 choices, referred to as 'A' & 'B'.
 * Choice 'A' is to the left of the switch, choice 'B' is to the right.
 * This decorates ToggleSwitch with labels.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Emitter from '../../axon/js/Emitter.js';
import PatternStringProperty from '../../axon/js/PatternStringProperty.js';
import type Property from '../../axon/js/Property.js';
import type TEmitter from '../../axon/js/TEmitter.js';
import type TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import type StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import { findStringProperty } from '../../scenery/js/accessibility/pdom/findStringProperty.js';
import ParallelDOM, { type TrimParallelDOMOptions } from '../../scenery/js/accessibility/pdom/ParallelDOM.js';
import AlignGroup from '../../scenery/js/layout/constraints/AlignGroup.js';
import AlignBox from '../../scenery/js/layout/nodes/AlignBox.js';
import HBox, { type HBoxOptions } from '../../scenery/js/layout/nodes/HBox.js';
import PressListener from '../../scenery/js/listeners/PressListener.js';
import type Node from '../../scenery/js/nodes/Node.js';
import SceneryConstants from '../../scenery/js/SceneryConstants.js';
import Tandem from '../../tandem/js/Tandem.js';
import sun from './sun.js';
import SunStrings from './SunStrings.js';
import ToggleSwitch, { type ToggleSwitchOptions } from './ToggleSwitch.js';

// constants

// Uses opacity as the default method of indicating whether a {Node} label is {boolean} enabled.
const DEFAULT_SET_LABEL_ENABLED = ( label: Node, enabled: boolean ) => {
  label.opacity = enabled ? 1.0 : SceneryConstants.DISABLED_OPACITY;
};

type SelfOptions = {

  // options passed to ToggleSwitch
  toggleSwitchOptions?: ToggleSwitchOptions;

  // method of making a label look disabled
  setLabelEnabled?: ( labelNode: Node, enabled: boolean ) => void;

  // Accessible names for each value. They will be inserted into a pattern string for the accessible name
  // of the ABSwitch. If not provided, ABSwitch will try to find default values from the label Nodes. The
  // final string will look like:
  // "{{valueAAccessibleName}}, Switch to {{valueBAccessibleName}}"
  valueAAccessibleName?: TReadOnlyProperty<string> | string | null;
  valueBAccessibleName?: TReadOnlyProperty<string> | string | null;

  // if true, this.center will be at the center of the ToggleSwitch
  centerOnSwitch?: boolean;
};

// Accessible name for the ABSwitch is created by combining the accessible names of the labels. See options.
export type ABSwitchOptions = SelfOptions & StrictOmit<TrimParallelDOMOptions<HBoxOptions>, 'accessibleName'>;

export default class ABSwitch<T> extends HBox {

  private readonly property: Property<T>;
  private readonly valueA: T;
  private readonly valueB: T;
  private readonly labelA: Node;
  private readonly labelB: Node;
  private readonly toggleSwitch: ToggleSwitch<T>;
  private readonly setLabelEnabled: ( labelNode: Node, enabled: boolean ) => void;
  private readonly disposeABSwitch: () => void;

  // Emits on input that results in a change to the Property value, after the Property has changed.
  public readonly onInputEmitter: TEmitter = new Emitter();

  /**
   * @param property - value of the current choice
   * @param valueA - value for choice 'A'
   * @param labelA - label for choice 'A'
   * @param valueB - value for choice 'B'
   * @param labelB - label for choice 'B'
   * @param providedOptions
   */
  public constructor( property: Property<T>, valueA: T, labelA: Node, valueB: T, labelB: Node, providedOptions?: ABSwitchOptions ) {
    assert && assert( property.valueComparisonStrategy === 'reference',
      'ABSwitch depends on "===" equality for value comparison' );

    // PhET-iO requirements
    assert && assert( labelA.tandem, 'labelA must have a tandem' );
    assert && assert( labelB.tandem, 'labelB must have a tandem' );

    // default option values
    const options = optionize<ABSwitchOptions, SelfOptions, HBoxOptions>()( {

      // SelfOptions
      toggleSwitchOptions: {
        enabledPropertyOptions: {
          phetioFeatured: false // ABSwitch has an enabledProperty that is preferred to the sub-component's
        }
      },
      setLabelEnabled: DEFAULT_SET_LABEL_ENABLED,
      centerOnSwitch: false,
      valueAAccessibleName: null,
      valueBAccessibleName: null,

      // HBoxOptions
      cursor: 'pointer',
      disabledOpacity: SceneryConstants.DISABLED_OPACITY,
      spacing: 8,

      // phet-io
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'Switch',
      visiblePropertyOptions: { phetioFeatured: true },
      phetioEnabledPropertyInstrumented: true // opt into default PhET-iO instrumented enabledProperty
    }, providedOptions );

    const toggleSwitch = new ToggleSwitch<T>( property, valueA, valueB,
      combineOptions<ToggleSwitchOptions>( {
        tandem: options.tandem.createTandem( 'toggleSwitch' ),

        // Aria switch attributes do not accurately describe switches with more than a binary state.
        // Instead, custom accessible names are used to describe the switch state.
        accessibleSwitch: false
      }, options.toggleSwitchOptions ) );

    let nodeA = labelA;
    let nodeB = labelB;
    if ( options.centerOnSwitch ) {

      // Make both labels have the same effective size, so that this.center is at the center of toggleSwitch.
      const alignGroup = new AlignGroup();
      nodeA = new AlignBox( labelA, {
        group: alignGroup,
        xAlign: 'right'
      } );
      nodeB = new AlignBox( labelB, {
        group: alignGroup,
        xAlign: 'left'
      } );
    }

    options.children = [ nodeA, toggleSwitch, nodeB ];

    super( options );

    this.property = property;
    this.valueA = valueA;
    this.valueB = valueB;
    this.labelA = labelA;
    this.labelB = labelB;
    this.toggleSwitch = toggleSwitch;
    this.setLabelEnabled = options.setLabelEnabled;

    // pdom - Setting accessibleHelpText on ABSwitch forwards the values to the actual ToggleSwitch.
    ParallelDOM.forwardHelpText( this, toggleSwitch );

    // Find accessible names from the labels if optional values were not provided.
    const valueAAccessibleName = options.valueAAccessibleName || findStringProperty( labelA );
    const valueBAccessibleName = options.valueBAccessibleName || findStringProperty( labelB );

    // PatternStringProperties for each switch value so that the accessible name will also change when changing locales.
    const valueASelectedAccessibleNameStringProperty = new PatternStringProperty( SunStrings.a11y.aBSwitch.accessibleNamePatternStringProperty, {
      selectedValue: valueAAccessibleName,
      otherValue: valueBAccessibleName
    } );
    const valueBSelectedAccessibleNameStringProperty = new PatternStringProperty( SunStrings.a11y.aBSwitch.accessibleNamePatternStringProperty, {
      selectedValue: valueBAccessibleName,
      otherValue: valueAAccessibleName
    } );

    const propertyListener = ( value: T ) => {
      this.updateLabelsEnabled();
      toggleSwitch.accessibleName = value === valueA ? valueASelectedAccessibleNameStringProperty : valueBSelectedAccessibleNameStringProperty;
    };
    property.link( propertyListener ); // unlink on dispose

    // click on labels to select
    const pressListenerA = new PressListener( {
      release: () => {
        const oldValue = property.value;
        property.value = valueA;
        if ( oldValue !== valueA ) {
          this.onInputEmitter.emit();
        }
      },
      tandem: labelA.tandem.createTandem( 'pressListener' )
    } );
    labelA.addInputListener( pressListenerA ); // removeInputListener on dispose

    const pressListenerB = new PressListener( {
      release: () => {
        const oldValue = property.value;
        property.value = valueB;
        if ( oldValue !== valueB ) {
          this.onInputEmitter.emit();
        }
      },
      tandem: labelB.tandem.createTandem( 'pressListener' )
    } );
    labelB.addInputListener( pressListenerB ); // removeInputListener on dispose

    // The toggleSwitch input triggers ABSwitch input.
    toggleSwitch.onInputEmitter.addListener( () => this.onInputEmitter.emit() );

    // Wire up sound on input
    this.onInputEmitter.addListener( () => {
      if ( property.value === valueB ) {
        toggleSwitch.switchToRightSoundPlayer.play();
      }
      if ( property.value === valueA ) {
        toggleSwitch.switchToLeftSoundPlayer.play();
      }
    } );

    this.disposeABSwitch = () => {
      property.unlink( propertyListener );
      toggleSwitch.dispose();
      valueASelectedAccessibleNameStringProperty.dispose();
      valueBSelectedAccessibleNameStringProperty.dispose();
      this.onInputEmitter.dispose();
      labelA.removeInputListener( pressListenerA );
      labelB.removeInputListener( pressListenerB );
      pressListenerA.dispose();
      pressListenerB.dispose();
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && window.phet?.chipper?.queryParameters?.binder && InstanceRegistry.registerDataURL( 'sun', 'ABSwitch', this );
  }

  public override dispose(): void {
    this.disposeABSwitch();
    super.dispose();
  }


  /**
   * Provide a custom look for when this switch is disabled. We are overriding the default implementation so that
   * the unselected label does not appear to be doubly disabled when the ABSwitch is disabled.
   * See https://github.com/phetsims/sun/issues/853
   */
  protected override onEnabledPropertyChange( enabled: boolean ): void {
    !enabled && this.interruptSubtreeInput();
    this.inputEnabled = enabled;
    this.toggleSwitch.enabled = enabled;
    this.updateLabelsEnabled();
  }

  /**
   * Updates the enabled state of the labels based on the current value of the associated Property.
   * The selected label will appear to be enabled, while the unselected label will appear to be disabled.
   * If the ABSwitch itself is disabled, both labels will appear to be disabled.
   */
  private updateLabelsEnabled(): void {
    this.setLabelEnabled( this.labelA, this.enabled && this.property.value === this.valueA );
    this.setLabelEnabled( this.labelB, this.enabled && this.property.value === this.valueB );
  }
}

sun.register( 'ABSwitch', ABSwitch );