// Copyright 2013-2023, University of Colorado Boulder

/**
 * AquaRadioButtonGroup creates a group of AquaRadioButtons and manages their layout.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import { FlowBox, FlowBoxOptions, PDOMPeer, SceneryConstants, SceneryEvent } from '../../scenery/js/imports.js';
import multiSelectionSoundPlayerFactory from '../../tambo/js/multiSelectionSoundPlayerFactory.js';
import Tandem from '../../tandem/js/Tandem.js';
import AquaRadioButton, { AquaRadioButtonOptions } from './AquaRadioButton.js';
import sun from './sun.js';
import Property from '../../axon/js/Property.js';
import Emitter from '../../axon/js/Emitter.js';
import TEmitter from '../../axon/js/TEmitter.js';
import GroupItemOptions, { getGroupItemNodes } from './GroupItemOptions.js';

// pdom - An id for each instance of AquaRadioButtonGroup, passed to individual buttons in the group.
// Each button in a radio button group must have the same "name" attribute to be considered in a group, otherwise
// arrow keys will navigate all radio type inputs in the document.
let instanceCount = 0;

// to prefix instanceCount in case there are different kinds of "groups"
const CLASS_NAME = 'AquaRadioButtonGroup';

type SelfOptions = {

  // options propagated to AquaRadioButton instances
  radioButtonOptions?: StrictOmit<AquaRadioButtonOptions, 'a11yNameAttribute' | 'labelContent' | 'soundPlayer' | 'tandem'>;

  // Dilation of pointer areas for each radio button.
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
  options?: StrictOmit<AquaRadioButtonOptions, 'tandem'>; // options passed to AquaRadioButton constructor
} & GroupItemOptions; // additional options that are common to 'group items'

export default class AquaRadioButtonGroup<T> extends FlowBox {

  private readonly radioButtons: AquaRadioButton<T>[];
  public readonly onInputEmitter: TEmitter = new Emitter();
  private readonly disposeAquaRadioButtonGroup: () => void;

  public constructor( property: Property<T>, items: AquaRadioButtonGroupItem<T>[], providedOptions?: AquaRadioButtonGroupOptions ) {

    instanceCount++;

    const options = optionize<AquaRadioButtonGroupOptions, StrictOmit<SelfOptions, 'radioButtonOptions'>, FlowBoxOptions>()( {

      // AquaRadioButtonGroupOptions
      touchAreaXDilation: 0,
      touchAreaYDilation: 0,
      mouseAreaXDilation: 0,
      mouseAreaYDilation: 0,

      // FlowBoxOptions
      orientation: 'vertical', // Aqua radio buttons are typically vertical, rarely horizontal
      spacing: 3, // space between each button, perpendicular to options.orientation
      stretch: true,
      disabledOpacity: SceneryConstants.DISABLED_OPACITY,

      // phet-io
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'RadioButtonGroup',
      visiblePropertyOptions: { phetioFeatured: true },
      phetioEnabledPropertyInstrumented: true, // opt into default PhET-iO instrumented enabledProperty

      // pdom
      tagName: 'ul',
      labelTagName: 'h3',
      ariaRole: 'radiogroup',
      groupFocusHighlight: true
    }, providedOptions );

    const nodes = getGroupItemNodes( items, options.tandem );

    // Default to a left alignment for vertical layout
    if ( options.orientation === 'vertical' ) {
      options.align = options.align || 'left';
    }

    // Create a radio button for each item
    const radioButtons = items.map( ( item, index ) => {

      // @ts-expect-error - runtime check to prevent prior pattern, see https://github.com/phetsims/sun/issues/794
      assert && assert( !item.tandem, 'Cannot specify tandem any more' );

      const node = nodes[ index ];

      assert && assert( !node.hasPDOMContent,
        'Accessibility is provided by AquaRadioButton and AquaRadioButtonGroupItem.labelContent. ' +
        'Additional PDOM content in the provided Node could break accessibility.' );

      return new AquaRadioButton( property, item.value, node,
        combineOptions<AquaRadioButtonOptions>( {
          a11yNameAttribute: CLASS_NAME + instanceCount,
          labelContent: item.labelContent || null,
          soundPlayer: multiSelectionSoundPlayerFactory.getSelectionSoundPlayer( index ),
          tandem: item.tandemName ? options.tandem.createTandem( item.tandemName ) :
                  options.tandem === Tandem.OPT_OUT ? Tandem.OPT_OUT :
                  Tandem.REQUIRED,
          touchAreaXDilation: options.touchAreaXDilation,
          touchAreaYDilation: options.orientation === 'vertical' ? options.spacing / 2 : options.touchAreaYDilation,
          mouseAreaXDilation: options.mouseAreaXDilation,
          mouseAreaYDilation: options.orientation === 'vertical' ? options.spacing / 2 : options.mouseAreaYDilation
        }, options.radioButtonOptions, item.options ) );
    } );
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

    const boundOnRadioButtonInput = this.onRadioButtonInput.bind( this );
    for ( let i = 0; i < radioButtons.length; i++ ) {
      const radioButton = radioButtons[ i ];
      radioButton.onInputEmitter.addListener( boundOnRadioButtonInput );
    }

    // Add linked element after the radio button is instrumented
    this.addLinkedElement( property, {
      tandem: options.tandem.createTandem( 'property' )
    } );

    this.disposeAquaRadioButtonGroup = () => {
      this.removeInputListener( intentListener );
      radioButtons.forEach( radioButton => radioButton.dispose() );
      this.onInputEmitter.dispose();
      nodes.forEach( node => node.dispose() );
    };

    this.radioButtons = radioButtons;
  }

  private onRadioButtonInput(): void {
    this.onInputEmitter.emit();
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
