// Copyright 2014-2024, University of Colorado Boulder

/**
 * ABSwitch is a control for switching between 2 choices, referred to as 'A' & 'B'.
 * Choice 'A' is to the left of the switch, choice 'B' is to the right.
 * This decorates ToggleSwitch with labels.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../axon/js/Property.js';
import Emitter from '../../axon/js/Emitter.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import { AlignBox, AlignGroup, HBox, HBoxOptions, Node, PressListener, SceneryConstants } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import sun from './sun.js';
import ToggleSwitch, { ToggleSwitchOptions } from './ToggleSwitch.js';
import TEmitter from '../../axon/js/TEmitter.js';

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

  // if true, this.center will be at the center of the ToggleSwitch
  centerOnSwitch?: boolean;
};

export type ABSwitchOptions = SelfOptions & HBoxOptions;

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
        tandem: options.tandem.createTandem( 'toggleSwitch' )
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

    const propertyListener = () => this.updateLabelsEnabled();
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
      this.onInputEmitter.dispose();
      labelA.removeInputListener( pressListenerA );
      labelB.removeInputListener( pressListenerB );
      pressListenerA.dispose();
      pressListenerB.dispose();
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet?.chipper?.queryParameters?.binder && InstanceRegistry.registerDataURL( 'sun', 'ABSwitch', this );
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