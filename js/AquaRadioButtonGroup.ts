// Copyright 2013-2022, University of Colorado Boulder

/**
 * AquaRadioButtonGroup creates a group of AquaRadioButtons and manages their layout.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import EmptyObjectType from '../../phet-core/js/types/EmptyObjectType.js';
import dotRandom from '../../dot/js/dotRandom.js';
import optionize from '../../phet-core/js/optionize.js';
import { FlowBox, FlowBoxOptions, HStrut, Node, PDOMPeer, SceneryConstants, SceneryEvent } from '../../scenery/js/imports.js';
import multiSelectionSoundPlayerFactory from '../../tambo/js/multiSelectionSoundPlayerFactory.js';
import Tandem from '../../tandem/js/Tandem.js';
import AquaRadioButton, { AquaRadioButtonOptions } from './AquaRadioButton.js';
import sun from './sun.js';
import Property from '../../axon/js/Property.js';

// pdom - An id for each instance of AquaRadioButtonGroup, passed to individual buttons in the group.
// Each button in a radio button group must have the same "name" attribute to be considered in a group, otherwise
// arrow keys will navigate all radio type inputs in the document.
let instanceCount = 0;

// constants
// to prefix instanceCount in case there are different kinds of "groups"
const CLASS_NAME = 'AquaRadioButtonGroup';

// a subset of AquaRadioButtonOptions is allowed
type SubsetOfAquaRadioButtonOptions = StrictOmit<AquaRadioButtonOptions, 'a11yNameAttribute' | 'labelContent' | 'soundPlayer' | 'tandem'>;

type SelfOptions = {

  // options propagated to AquaRadioButton instances
  radioButtonOptions?: SubsetOfAquaRadioButtonOptions | null;

  // Dilation of pointer areas for each radio button.
  // These are not part of radioButtonOptions because AquaRadioButton has no pointerArea options.
  // X dilation is ignored for orientation === 'horizontal'.
  // Y dilation is ignored for orientation === 'vertical'.
  touchAreaXDilation?: number;
  touchAreaYDilation?: number;
  mouseAreaXDilation?: number;
  mouseAreaYDilation?: number;
};

export type AquaRadioButtonGroupOptions = SelfOptions & StrictOmit<FlowBoxOptions, 'children'>;

export type AquaRadioButtonGroupItem<T> = {
  value: T; // value associated with the button
  node: Node; // label for the button
  tandemName?: string; // name of the tandem for PhET-iO
  labelContent?: string; // label for a11y
};

export default class AquaRadioButtonGroup<T> extends FlowBox {

  private readonly radioButtons: AquaRadioButton<T>[];
  private readonly disposeAquaRadioButtonGroup: () => void;

  public constructor( property: Property<T>, items: AquaRadioButtonGroupItem<T>[], providedOptions?: AquaRadioButtonGroupOptions ) {

    instanceCount++;

    const options = optionize<AquaRadioButtonGroupOptions, SelfOptions, FlowBoxOptions>()( {

      // AquaRadioButtonGroupOptions
      radioButtonOptions: null,
      touchAreaXDilation: 0,
      touchAreaYDilation: 0,
      mouseAreaXDilation: 0,
      mouseAreaYDilation: 0,

      // FlowBoxOptions
      orientation: 'vertical', // Aqua radio buttons are typically vertical, rarely horizontal
      spacing: 3, // space between each button, perpendicular to options.orientation
      disabledOpacity: SceneryConstants.DISABLED_OPACITY,

      // phet-io
      tandem: Tandem.REQUIRED,
      visiblePropertyOptions: { phetioFeatured: true },
      phetioEnabledPropertyInstrumented: true, // opt into default PhET-iO instrumented enabledProperty

      // pdom
      tagName: 'ul',
      labelTagName: 'h3',
      ariaRole: 'radiogroup',
      groupFocusHighlight: true
    }, providedOptions );

    // Determine the max item width
    const maxItemWidth = _.maxBy( items, ( item: AquaRadioButtonGroupItem<T> ) => item.node.width )!.node.width;

    // Create a radio button for each item
    const radioButtons: AquaRadioButton<T>[] = [];
    for ( let i = 0; i < items.length; i++ ) {
      const item = items[ i ];

      // Content for the radio button.
      // For vertical orientation, add an invisible strut, so that buttons have uniform width.
      const content = ( options.orientation === 'vertical' ) ?
                      new Node( { children: [ new HStrut( maxItemWidth ), item.node ] } ) :
                      item.node;

      const radioButton = new AquaRadioButton( property, item.value, content,
        optionize<SubsetOfAquaRadioButtonOptions, EmptyObjectType, AquaRadioButtonOptions>()( {
          a11yNameAttribute: CLASS_NAME + instanceCount,
          labelContent: item.labelContent || null,
          soundPlayer: multiSelectionSoundPlayerFactory.getSelectionSoundPlayer( i ),

          // Instead of using Tandem.REQUIRED, use the same tandem that is passed into the group, helping to support Tandem.OPT_OUT
          tandem: options.tandem.createTandem( item.tandemName || `placeHolder${dotRandom.nextInt( 1000000 )}RadioButton` )
        }, options.radioButtonOptions! ) );

      // set pointer areas
      if ( options.orientation === 'vertical' ) {
        radioButton.mouseArea = radioButton.localBounds.dilatedXY( options.mouseAreaXDilation, options.spacing / 2 );
        radioButton.touchArea = radioButton.localBounds.dilatedXY( options.touchAreaXDilation, options.spacing / 2 );
      }
      else {
        radioButton.mouseArea = radioButton.localBounds.dilatedXY( options.spacing / 2, options.mouseAreaYDilation );
        radioButton.touchArea = radioButton.localBounds.dilatedXY( options.spacing / 2, options.touchAreaYDilation );
      }

      radioButtons.push( radioButton );
    }
    options.children = radioButtons;

    super( options );

    // pdom - this node's primary sibling is aria-labelledby its own label so the label content is read whenever
    // a member of the group receives focus
    this.addAriaLabelledbyAssociation( {
      thisElementName: PDOMPeer.PRIMARY_SIBLING,
      otherNode: this,
      otherElementName: PDOMPeer.LABEL_SIBLING
    } );

    // zoom - signify that key input is reserved and we should not pan when user presses arrow keys
    // See https://github.com/phetsims/scenery/issues/974
    const intentListener = { keydown: ( event: SceneryEvent<KeyboardEvent> ) => event.pointer.reserveForKeyboardDrag() };
    this.addInputListener( intentListener );

    // Add linked element after the radio button is instrumented
    this.addLinkedElement( property, {
      tandem: options.tandem.createTandem( 'property' )
    } );

    this.disposeAquaRadioButtonGroup = () => {
      this.removeInputListener( intentListener );

      for ( let i = 0; i < radioButtons.length; i++ ) {
        radioButtons[ i ].dispose();
      }
    };

    this.radioButtons = radioButtons;
  }

  public override dispose(): void {
    this.disposeAquaRadioButtonGroup();
    super.dispose();
  }

  /**
   * Gets the radio button that corresponds to the specified value.
   */
  public getButton( value: T ): AquaRadioButton<T> {
    const button = _.find( this.radioButtons, ( radioButton: AquaRadioButton<T> ) => radioButton.value === value );
    assert && assert( button, `no radio button found for value ${value}` );
    return button!;
  }
}

sun.register( 'AquaRadioButtonGroup', AquaRadioButtonGroup );
