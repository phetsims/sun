// Copyright 2014-2022, University of Colorado Boulder

/**
 * ABSwitch is a control for switching between 2 choices, referred to as 'A' & 'B'.
 * Choice 'A' is to the left of the switch, choice 'B' is to the right.
 * This decorates ToggleSwitch with labels.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import IProperty from '../../axon/js/IProperty.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import merge from '../../phet-core/js/merge.js';
import optionize from '../../phet-core/js/optionize.js';
import { Line, Node, NodeOptions, PressListener, SceneryConstants } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import sun from './sun.js';
import ToggleSwitch, { ToggleSwitchOptions } from './ToggleSwitch.js';

// constants

// Uses opacity as the default method of indicating whether a {Node} label is {boolean} enabled.
const DEFAULT_SET_ENABLED = ( label: Node, enabled: boolean ) => {
  label.opacity = enabled ? 1.0 : SceneryConstants.DISABLED_OPACITY;
};

type SelfOptions = {

  // options passed to ToggleSwitch
  toggleSwitchOptions?: ToggleSwitchOptions;

  // space between labels and switch
  xSpacing?: number;

  // method of making the labels look disabled
  setEnabled?: ( labelNode: Node, enabled: boolean ) => void;

  // if true, centerX will be at the centerX of the ToggleSwitch
  centerOnButton?: boolean;
};

export type ABSwitchOptions = SelfOptions & NodeOptions;

export default class ABSwitch<T> extends Node {

  private readonly disposeABSwitch: () => void;

  /**
   * @param property - value of the current choice
   * @param valueA - value for choice 'A'
   * @param labelA - label for choice 'A'
   * @param valueB - value for choice 'B'
   * @param labelB - label for choice 'B'
   * @param providedOptions
   */
  public constructor( property: IProperty<T>, valueA: T, labelA: Node, valueB: T, labelB: Node, providedOptions?: ABSwitchOptions ) {

    // PhET-iO requirements
    assert && assert( labelA.tandem, 'labelA must have a tandem' );
    assert && assert( labelB.tandem, 'labelB must have a tandem' );

    // default option values
    const options = optionize<ABSwitchOptions, SelfOptions, NodeOptions>()( {

      // SelfOptions
      toggleSwitchOptions: {
        enabledPropertyOptions: {
          phetioFeatured: false // ABSwitch has an enabledProperty that is preferred to the sub-component's
        }
      },
      xSpacing: 8,
      setEnabled: DEFAULT_SET_ENABLED,
      centerOnButton: false,

      // NodeOptions
      cursor: 'pointer',
      disabledOpacity: SceneryConstants.DISABLED_OPACITY,

      // phet-io
      tandem: Tandem.REQUIRED,
      visiblePropertyOptions: { phetioFeatured: true },
      phetioEnabledPropertyInstrumented: true // opt into default PhET-iO instrumented enabledProperty
    }, providedOptions );

    super();

    const toggleSwitch = new ToggleSwitch<T>( property, valueA, valueB, merge( {
      tandem: options.tandem.createTandem( 'toggleSwitch' )
    }, options.toggleSwitchOptions ) );

    // rendering order
    this.addChild( toggleSwitch );
    this.addChild( labelA );
    this.addChild( labelB );

    // layout: 'A' on the left, 'B' on the right
    labelA.right = toggleSwitch.left - options.xSpacing;
    labelA.centerY = toggleSwitch.centerY;
    labelB.left = toggleSwitch.right + options.xSpacing;
    labelB.centerY = toggleSwitch.centerY;

    // add a horizontal strut that will cause the 'centerX' of this node to be at the center of the button
    if ( options.centerOnButton ) {
      const additionalWidth = Math.abs( labelA.width - labelB.width );
      const strut = new Line( 0, 0, this.width + additionalWidth, 0 );
      this.addChild( strut );
      strut.moveToBack();
      if ( labelA.width < labelB.width ) {
        strut.left = labelA.left - ( additionalWidth / 2 );
      }
      else {
        strut.left = labelA.left;
      }
    }

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
        if ( property.value !== valueA ) {
          toggleSwitch.switchToLeftSoundPlayer.play();
        }
        property.value = valueA;
      },
      tandem: labelA.tandem.createTandem( 'pressListener' )
    } );
    labelA.addInputListener( pressListenerA ); // removeInputListener on dispose

    const pressListenerB = new PressListener( {
      release: () => {
        if ( property.value !== valueB ) {
          toggleSwitch.switchToRightSoundPlayer.play();
        }
        property.value = valueB;
      },
      tandem: labelB.tandem.createTandem( 'pressListener' )
    } );
    labelB.addInputListener( pressListenerB ); // removeInputListener on dispose

    this.disposeABSwitch = () => {
      property.unlink( propertyListener );
      toggleSwitch.dispose();
      labelA.removeInputListener( pressListenerA );
      labelB.removeInputListener( pressListenerB );
      pressListenerA.dispose();
      pressListenerB.dispose();
    };

    this.mutate( options );

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'ABSwitch', this );
  }

  public override dispose(): void {
    this.disposeABSwitch();
    super.dispose();
  }
}

sun.register( 'ABSwitch', ABSwitch );