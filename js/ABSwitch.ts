// Copyright 2014-2023, University of Colorado Boulder

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
const DEFAULT_SET_ENABLED = ( label: Node, enabled: boolean ) => {
  label.opacity = enabled ? 1.0 : SceneryConstants.DISABLED_OPACITY;
};

type SelfOptions = {

  // options passed to ToggleSwitch
  toggleSwitchOptions?: ToggleSwitchOptions;

  // method of making the labels look disabled
  setEnabled?: ( labelNode: Node, enabled: boolean ) => void;

  // if true, this.center will be at the center of the ToggleSwitch
  centerOnSwitch?: boolean;
};

export type ABSwitchOptions = SelfOptions & HBoxOptions;

export default class ABSwitch<T> extends HBox {

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
      setEnabled: DEFAULT_SET_ENABLED,
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

    const propertyListener = ( value: T ) => {
      if ( options.setEnabled ) {
        options.setEnabled( labelA, value === valueA );
        options.setEnabled( labelB, value === valueB );
      }
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
      this.onInputEmitter.dispose();
      labelA.removeInputListener( pressListenerA );
      labelB.removeInputListener( pressListenerB );
      pressListenerA.dispose();
      pressListenerB.dispose();
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'ABSwitch', this );
  }

  public override dispose(): void {
    this.disposeABSwitch();
    super.dispose();
  }
}

sun.register( 'ABSwitch', ABSwitch );