// Copyright 2013-2022, University of Colorado Boulder

/**
 * AquaRadioButtonGroup creates a group of AquaRadioButtons and manages their layout.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import optionize, { EmptySelfOptions } from '../../phet-core/js/optionize.js';
import { FlowBox, FlowBoxOptions, HStrut, Node, PDOMPeer, SceneryConstants, SceneryEvent } from '../../scenery/js/imports.js';
import multiSelectionSoundPlayerFactory from '../../tambo/js/multiSelectionSoundPlayerFactory.js';
import Tandem from '../../tandem/js/Tandem.js';
import AquaRadioButton, { AquaRadioButtonOptions } from './AquaRadioButton.js';
import sun from './sun.js';
import Property from '../../axon/js/Property.js';
import GroupItemOptions, { getGroupItemNodes } from './GroupItemOptions.js';

// pdom - An id for each instance of AquaRadioButtonGroup, passed to individual buttons in the group.
// Each button in a radio button group must have the same "name" attribute to be considered in a group, otherwise
// arrow keys will navigate all radio type inputs in the document.
let instanceCount = 0;

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
  labelContent?: string; // label for a11y
} & GroupItemOptions; // additional options that are common to 'group items'

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
      tandemNameSuffix: 'RadioButtonGroup',
      visiblePropertyOptions: { phetioFeatured: true },
      phetioEnabledPropertyInstrumented: true, // opt into default PhET-iO instrumented enabledProperty

      // pdom
      tagName: 'div',
      labelTagName: 'h3',
      ariaRole: 'radiogroup',
      groupFocusHighlight: true
    }, providedOptions );

    const nodes = getGroupItemNodes( items, options.tandem );

    // Determine the max item width
    const maxItemWidth = _.maxBy( nodes, node => node.width )!.width;

    // Create a radio button for each item
    const radioButtons: AquaRadioButton<T>[] = [];
    for ( let i = 0; i < items.length; i++ ) {
      const item = items[ i ];

      // @ts-ignore - runtime check to prevent prior pattern, see https://github.com/phetsims/sun/issues/794
      assert && assert( !item.tandem, 'Cannot specify tandem any more' );

      const node = nodes[ i ];

      assert && assert( !node.hasPDOMContent,
        'Accessibility is provided by AquaRadioButton and AquaRadioButtonGroupItem.labelContent. ' +
        'Additional PDOM content in the provided Node could break accessibility.' );

      // Content for the radio button.
      // For vertical orientation, add an invisible strut, so that buttons have uniform width.
      const content = ( options.orientation === 'vertical' ) ?
                      new Node( { children: [ new HStrut( maxItemWidth ), node ] } ) :
                      node;

      const radioButton = new AquaRadioButton( property, item.value, content,
        optionize<SubsetOfAquaRadioButtonOptions, EmptySelfOptions, AquaRadioButtonOptions>()( {
          a11yNameAttribute: CLASS_NAME + instanceCount,
          labelContent: item.labelContent || null,
          soundPlayer: multiSelectionSoundPlayerFactory.getSelectionSoundPlayer( i ),
          tandem: item.tandemName ? options.tandem.createTandem( item.tandemName ) :
                  options.tandem === Tandem.OPT_OUT ? Tandem.OPT_OUT :
                  Tandem.REQUIRED
        }, options.radioButtonOptions! ) );

      // set pointer areas - update them when the localBounds change
      radioButton.localBoundsProperty.link( localBounds => {
        if ( options.orientation === 'vertical' ) {
          radioButton.mouseArea = localBounds.dilatedXY( options.mouseAreaXDilation, options.spacing / 2 );
          radioButton.touchArea = localBounds.dilatedXY( options.touchAreaXDilation, options.spacing / 2 );
        }
        else {
          radioButton.mouseArea = localBounds.dilatedXY( options.spacing / 2, options.mouseAreaYDilation );
          radioButton.touchArea = localBounds.dilatedXY( options.spacing / 2, options.touchAreaYDilation );
        }
      } );

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
      radioButtons.forEach( radioButton => radioButton.dispose() );
      nodes.forEach( node => node.dispose() );
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
