// Copyright 2013-2025, University of Colorado Boulder

/**
 * AquaRadioButtonGroup creates a group of AquaRadioButtons and manages their layout.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Emitter from '../../axon/js/Emitter.js';
import type PhetioProperty from '../../axon/js/PhetioProperty.js';
import type TEmitter from '../../axon/js/TEmitter.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import type PickOptional from '../../phet-core/js/types/PickOptional.js';
import type StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import GroupFocusListener from '../../scenery/js/accessibility/GroupFocusListener.js';
import KeyboardUtils from '../../scenery/js/accessibility/KeyboardUtils.js';
import ParallelDOM, { type ParallelDOMOptions, type TrimParallelDOMOptions } from '../../scenery/js/accessibility/pdom/ParallelDOM.js';
import PDOMPeer from '../../scenery/js/accessibility/pdom/PDOMPeer.js';
import type SceneryEvent from '../../scenery/js/input/SceneryEvent.js';
import FlowBox, { type FlowBoxOptions } from '../../scenery/js/layout/nodes/FlowBox.js';
import SceneryConstants from '../../scenery/js/SceneryConstants.js';
import assertNoAdditionalChildren from '../../scenery/js/util/assertNoAdditionalChildren.js';
import multiSelectionSoundPlayerFactory from '../../tambo/js/multiSelectionSoundPlayerFactory.js';
import Tandem from '../../tandem/js/Tandem.js';
import AquaRadioButton, { type AquaRadioButtonOptions } from './AquaRadioButton.js';
import type GroupItemOptions from './GroupItemOptions.js';
import { getGroupItemNodes } from './GroupItemOptions.js';
import sun from './sun.js';
import SunUtil from './SunUtil.js';

// pdom - An id for each instance of AquaRadioButtonGroup, passed to individual buttons in the group.
// Each button in a radio button group must have the same "name" attribute to be considered in a group, otherwise
// arrow keys will navigate all radio type inputs in the document.
let instanceCount = 0;

// to prefix instanceCount in case there are different kinds of "groups"
const CLASS_NAME = 'AquaRadioButtonGroup';

type SelfOptions = {

  // options propagated to AquaRadioButton instances
  radioButtonOptions?: StrictOmit<AquaRadioButtonOptions, 'soundPlayer' | 'tandem'>;

  // Dilation of pointer areas for each radio button.
  // X dilation is ignored for orientation === 'horizontal'.
  // Y dilation is ignored for orientation === 'vertical'.
  touchAreaXDilation?: number;
  touchAreaYDilation?: number;
  mouseAreaXDilation?: number;
  mouseAreaYDilation?: number;
};

// So that it is clear that RectangularRadioButtonGroupOptions only supports a high-level ParallelDOM options.
// TODO: This PickOptional should be removed once https://github.com/phetsims/sun/issues/900 is resolved. labelTagName is required because clients need to provide a heading level.
type TrimmedParentOptions = TrimParallelDOMOptions<FlowBoxOptions> & PickOptional<ParallelDOMOptions, 'labelTagName'>;

export type AquaRadioButtonGroupOptions = SelfOptions & StrictOmit<TrimmedParentOptions, 'children'>;

export type AquaRadioButtonGroupItem<T> = {
  value: T; // value associated with the button
  options?: StrictOmit<AquaRadioButtonOptions, 'tandem'>; // options passed to AquaRadioButton constructor
} & GroupItemOptions; // additional options that are common to 'group items'

export default class AquaRadioButtonGroup<T> extends FlowBox {

  private readonly radioButtons: AquaRadioButton<T>[];
  public readonly onInputEmitter: TEmitter = new Emitter();
  private readonly disposeAquaRadioButtonGroup: () => void;

  public constructor( property: PhetioProperty<T>, items: AquaRadioButtonGroupItem<T>[], providedOptions?: AquaRadioButtonGroupOptions ) {

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
      phetioFeatured: true,

      // pdom
      tagName: 'ul',
      labelTagName: 'h3',
      ariaRole: 'radiogroup',
      accessibleHelpTextBehavior: ParallelDOM.HELP_TEXT_BEFORE_CONTENT,
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
        'Accessibility is provided by AquaRadioButton and accessibleName of the AquaRadioButtonGroupItem options. ' +
        'Additional PDOM content in the provided Node could break accessibility.' );

      return new AquaRadioButton( property, item.value, node,
        combineOptions<AquaRadioButtonOptions>( {
          a11yNameAttribute: CLASS_NAME + instanceCount,
          soundPlayer: multiSelectionSoundPlayerFactory.getSelectionSoundPlayer( index ),
          tandem: item.tandemName ? options.tandem.createTandem( item.tandemName ) :
                  options.tandem === Tandem.OPT_OUT ? Tandem.OPT_OUT :
                  Tandem.REQUIRED,
          // NOTE: This does NOT support dynamic orientation changes. If you need that, change RectangularButton to support
          // dynamic options
          touchAreaXDilation: options.orientation === 'horizontal' ? options.spacing / 2 : options.touchAreaXDilation,
          touchAreaYDilation: options.orientation === 'vertical' ? options.spacing / 2 : options.touchAreaYDilation,
          mouseAreaXDilation: options.orientation === 'horizontal' ? options.spacing / 2 : options.mouseAreaXDilation,
          mouseAreaYDilation: options.orientation === 'vertical' ? options.spacing / 2 : options.mouseAreaYDilation
        }, options.radioButtonOptions, item.options ) );
    } );
    options.children = radioButtons;

    super( options );

    // Voicing - When focus enters the group for the first time, speak the full response for the focused button.
    // When focus moves within the group, just speak the name response.
    const groupFocusListener = new GroupFocusListener( this );
    groupFocusListener.focusTargetProperty.link( focusTarget => {
      if ( focusTarget ) {
        const targetButton = focusTarget as AquaRadioButton<T>;
        if ( groupFocusListener.focusWasInGroup ) {
          targetButton.voicingSpeakNameResponse();
        }
        else {
          targetButton.voicingSpeakFullResponse( {
            contextResponse: null,
            hintResponse: this.accessibleHelpText
          } );
        }
      }
    } );
    this.addInputListener( groupFocusListener );

    // pdom - this node's primary sibling is aria-labelledby its own label so the label content is read whenever
    // a member of the group receives focus
    this.addAriaLabelledbyAssociation( {
      thisElementName: PDOMPeer.PRIMARY_SIBLING,
      otherNode: this,
      otherElementName: PDOMPeer.LABEL_SIBLING
    } );

    // zoom - signify that key input is reserved and we should not pan when user presses arrow keys
    // See https://github.com/phetsims/scenery/issues/974
    const intentListener = {
      keydown: ( event: SceneryEvent<KeyboardEvent> ) => {
        if ( KeyboardUtils.isArrowKey( event.domEvent ) ) {
          event.pointer.reserveForKeyboardDrag();
        }
      }
    };
    this.addInputListener( intentListener );

    const boundOnRadioButtonInput = this.onRadioButtonInput.bind( this );
    for ( let i = 0; i < radioButtons.length; i++ ) {
      const radioButton = radioButtons[ i ];
      radioButton.onInputEmitter.addListener( boundOnRadioButtonInput );
    }

    // Add linked element after the radio button is instrumented
    this.addLinkedElement( property, {
      tandemName: 'property'
    } );

    assert && SunUtil.validateLinkedElementInstrumentation( this, property );

    this.disposeAquaRadioButtonGroup = () => {
      this.removeInputListener( intentListener );
      radioButtons.forEach( radioButton => radioButton.dispose() );
      this.onInputEmitter.dispose();
      groupFocusListener.dispose();
      nodes.forEach( node => node.dispose() );
    };

    this.radioButtons = radioButtons;

    // Decorating with additional content is an anti-pattern, see https://github.com/phetsims/sun/issues/860
    assert && assertNoAdditionalChildren( this );
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