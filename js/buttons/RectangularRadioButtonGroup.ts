// Copyright 2014-2025, University of Colorado Boulder

/**
 * RectangularRadioButtonGroup is a group of rectangular radio buttons, in either horizontal or vertical orientation.
 * See sun.ButtonsScreenView for example usage.
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import type PhetioProperty from '../../../axon/js/PhetioProperty.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import InstanceRegistry from '../../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import type PickOptional from '../../../phet-core/js/types/PickOptional.js';
import type StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import HighlightFromNode from '../../../scenery/js/accessibility/HighlightFromNode.js';
import { findStringProperty } from '../../../scenery/js/accessibility/pdom/findStringProperty.js';
import ParallelDOM, { type ParallelDOMOptions, type TrimParallelDOMOptions } from '../../../scenery/js/accessibility/pdom/ParallelDOM.js';
import PDOMPeer from '../../../scenery/js/accessibility/pdom/PDOMPeer.js';
import type TInputListener from '../../../scenery/js/input/TInputListener.js';
import FlowBox, { type FlowBoxOptions } from '../../../scenery/js/layout/nodes/FlowBox.js';
import type Node from '../../../scenery/js/nodes/Node.js';
import SceneryConstants from '../../../scenery/js/SceneryConstants.js';
import Color from '../../../scenery/js/util/Color.js';
import multiSelectionSoundPlayerFactory from '../../../tambo/js/multiSelectionSoundPlayerFactory.js';
import type TSoundPlayer from '../../../tambo/js/TSoundPlayer.js';
import Tandem from '../../../tandem/js/Tandem.js';
import ColorConstants from '../ColorConstants.js';
import type GroupItemOptions from '../GroupItemOptions.js';
import { getGroupItemNodes } from '../GroupItemOptions.js';
import RadioButtonGroupFocusListener from '../RadioButtonGroupFocusListener.js';
import sun from '../sun.js';
import SunUtil from '../SunUtil.js';
import RectangularRadioButton, { type RectangularRadioButtonOptions } from './RectangularRadioButton.js';
import type TContentAppearanceStrategy from './TContentAppearanceStrategy.js';

// pdom - Unique ID for each instance of RectangularRadioButtonGroup. Used to create the 'name' option that is passed
// to each RectangularRadioButton in the group. All buttons in the group must have the same 'name', and that name
// must be unique to the group. Otherwise, the browser will treat all inputs of type 'radio' in the document as being
// in a single group.
let instanceCount = 0;

// Prefix for instanceCount, because PhET sims have different types of "groups"
const CLASS_NAME = 'RectangularRadioButtonGroup';

// Describes one radio button
export type RectangularRadioButtonGroupItem<T> = {
  value: T; // value associated with the button
  label?: Node; // optional label that appears outside the button
  phetioDocumentation?: string; // optional documentation for PhET-iO
  options?: StrictOmit<RectangularRadioButtonOptions, 'tandem'>; // options passed to RectangularRadioButton constructor
} & GroupItemOptions;

/**
 * Identifies a radio button and its layout manager. Pointer areas and focus highlight need to be set on
 * the button, but need to surround the layout manager containing both the button and its optional label.
 * This was formerly a class, converted to a type when PhET moved to TypeScript.
 * See https://github.com/phetsims/sun/issues/708
 */
type ButtonWithLayoutNode<T> = {
  radioButton: RectangularRadioButton<T>;
  readonly focusHighlight: HighlightFromNode;
  readonly layoutNode: Node;
};

// Where the optional label appears, relative to the radio button
export type RectangularRadioButtonLabelAlign = 'top' | 'bottom' | 'left' | 'right';

type SelfOptions = {

  // Sound generation for the radio buttons.
  // null means to use the defaults. Otherwise, there must be one for each button.
  soundPlayers?: TSoundPlayer[] | null;

  // Determines where the optional label appears, relative to the button
  labelAlign?: RectangularRadioButtonLabelAlign;

  // Spacing between the optional label and the button
  labelSpacing?: number;

  // Applied to each button, or each button + optional label.
  // This is not handled via radioButtonOptions because we may have an optional label in addition to the button.
  touchAreaXDilation?: number;
  touchAreaYDilation?: number;
  mouseAreaXDilation?: number;
  mouseAreaYDilation?: number;

  radioButtonOptions?: StrictOmit<RectangularRadioButtonOptions,
    'soundPlayer' |        // use SelfOptions.soundPlayers
    'touchAreaXDilation' | // use SelfOptions.touchAreaXDilation
    'touchAreaYDilation' | // use SelfOptions.touchAreaYDilation
    'mouseAreaXDilation' | // use SelfOptions.mouseAreaXDilation
    'mouseAreaYDilation'   // use SelfOptions.mouseAreaYDilation
  >;

  // A hint response for the group of buttons. This is spoken the first time focus lands in the group.
  // The default value will use accessibleHelpText, if available. By design, the Voicing feature
  // is implemented in the AquaRadioButton, but the group supports the hint response.
  voicingNameResponse?: TReadOnlyProperty<string> | null;
  voicingHintResponse?: TReadOnlyProperty<string> | null;

  // whether to speak the voicingNameResponse when the group receives focus from outside the group.
  speakVoicingNameResponseOnFocus?: boolean;
};

// So that it is clear that RectangularRadioButtonGroupOptions only supports a high-level ParallelDOM options.
// TODO: This PickOptional should be removed once https://github.com/phetsims/sun/issues/900 is resolved. labelTagName is required because clients need to provide a heading level.
type TrimmedParentOptions = TrimParallelDOMOptions<FlowBoxOptions> & PickOptional<ParallelDOMOptions, 'labelTagName'>;

export type RectangularRadioButtonGroupOptions = SelfOptions & StrictOmit<TrimmedParentOptions, 'children'>;

export default class RectangularRadioButtonGroup<T> extends FlowBox {

  private readonly disposeRadioButtonGroup: () => void;
  private readonly radioButtonMap: Map<T, RectangularRadioButton<T>>;

  public constructor( property: PhetioProperty<T>,
                      items: RectangularRadioButtonGroupItem<T>[],
                      providedOptions?: RectangularRadioButtonGroupOptions ) {

    assert && assert( _.uniqBy( items, item => item.value ).length === items.length,
      'items must have unique values' );
    assert && assert( _.find( items, item => ( item.value === property.value ) ),
      'one radio button must be associated with property.value' );

    const options = optionize<RectangularRadioButtonGroupOptions, SelfOptions, FlowBoxOptions>()( {

      // SelfOptions
      soundPlayers: null,
      labelAlign: 'bottom',
      labelSpacing: 0,
      touchAreaXDilation: 0,
      touchAreaYDilation: 0,
      mouseAreaXDilation: 0,
      mouseAreaYDilation: 0,
      radioButtonOptions: {
        baseColor: ColorConstants.LIGHT_BLUE,
        cornerRadius: 4,
        xMargin: 5,
        yMargin: 5,
        xAlign: 'center',
        yAlign: 'center',
        buttonAppearanceStrategyOptions: {
          selectedStroke: 'black',
          selectedLineWidth: 1.5,
          selectedButtonOpacity: 1,
          deselectedStroke: new Color( 50, 50, 50 ),
          deselectedLineWidth: 1,
          deselectedButtonOpacity: 0.6,
          overButtonOpacity: 0.8
        },
        contentAppearanceStrategy: RectangularRadioButton.ContentAppearanceStrategy,
        contentAppearanceStrategyOptions: {
          overContentOpacity: 0.8,
          selectedContentOpacity: 1,
          deselectedContentOpacity: 0.6
        }
      },

      // FlowBoxOptions
      spacing: 10,
      stretch: true, // have the buttons match size, see https://github.com/phetsims/sun/issues/851
      orientation: 'vertical',
      disabledOpacity: SceneryConstants.DISABLED_OPACITY,

      // phet-io
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'ButtonGroup',
      visiblePropertyOptions: { phetioFeatured: true },
      phetioEnabledPropertyInstrumented: true, // opt into default PhET-iO instrumented enabledProperty
      phetioFeatured: true,

      // pdom
      tagName: 'ul',
      ariaRole: 'radiogroup',
      accessibleNameBehavior: ParallelDOM.HEADING_ACCESSIBLE_NAME_BEHAVIOR,
      accessibleHelpTextBehavior: ParallelDOM.HELP_TEXT_BEFORE_CONTENT,
      groupFocusHighlight: true,
      voicingHintResponse: null,

      // See RadioButtonGroupFocusListener
      voicingNameResponse: null,
      speakVoicingNameResponseOnFocus: true
    }, providedOptions );

    assert && assert( options.soundPlayers === null || options.soundPlayers.length === items.length,
      'If soundPlayers is provided, there must be one per radio button.' );

    instanceCount++;

    const radioButtonMap = new Map<T, RectangularRadioButton<T>>();

    const nodes = getGroupItemNodes( items, options.tandem );
    assert && assert( _.every( nodes, node => !node.hasPDOMContent ),
      'Accessibility is provided by RectangularRadioButton and accessibleName in RectangularRadioButtonGroupItem options. ' +
      'Additional PDOM content in the provided Node could break accessibility.' );

    // Calculate the maximum width and height of the content, so we can make all radio buttons the same size.
    const widestContentWidth = _.maxBy( nodes, node => node.width )!.width;
    const tallestContentHeight = _.maxBy( nodes, node => node.height )!.height;

    // Populated for each radio button in for loop
    const buttons: Array<RectangularRadioButton<T> | FlowBox> = [];
    const buttonsWithLayoutNodes: ButtonWithLayoutNode<T>[] = [];
    const labelAppearanceStrategies: InstanceType<TContentAppearanceStrategy>[] = [];

    const xMargin: number = options.radioButtonOptions.xMargin!;
    const yMargin: number = options.radioButtonOptions.yMargin!;

    for ( let i = 0; i < items.length; i++ ) {
      const item = items[ i ];
      const node = nodes[ i ];

      const radioButtonOptions = combineOptions<RectangularRadioButtonOptions>( {
        content: node,
        minWidth: widestContentWidth + 2 * xMargin,
        minHeight: tallestContentHeight + 2 * yMargin,
        soundPlayer: options.soundPlayers ? options.soundPlayers[ i ] :
                     multiSelectionSoundPlayerFactory.getSelectionSoundPlayer( i ),
        tandem: item.tandemName ? options.tandem.createTandem( item.tandemName ) :
                options.tandem === Tandem.OPT_OUT ? Tandem.OPT_OUT :
                Tandem.REQUIRED,
        phetioDocumentation: item.phetioDocumentation || '',
        // NOTE: This does NOT support dynamic orientation changes. If you need that, change RectangularButton to
        // support dynamic options.
        touchAreaXDilation: options.orientation === 'horizontal' ? options.spacing / 2 : options.touchAreaXDilation,
        touchAreaYDilation: options.orientation === 'vertical' ? options.spacing / 2 : options.touchAreaYDilation,
        mouseAreaXDilation: options.orientation === 'horizontal' ? options.spacing / 2 : options.mouseAreaXDilation,
        mouseAreaYDilation: options.orientation === 'vertical' ? options.spacing / 2 : options.mouseAreaYDilation
      }, options.radioButtonOptions, item.options );

      const radioButton = new RectangularRadioButton( property, item.value, radioButtonOptions );

      radioButtonMap.set( item.value, radioButton );

      // pdom - so the browser recognizes these buttons are in the same group. See instanceCount for more info.
      radioButton.setPDOMAttribute( 'name', CLASS_NAME + instanceCount );

      let button;
      if ( item.label ) {

        // If a label is provided, the button becomes a FlowBox that manages layout of the button and label.
        const label = item.label;
        const labelOrientation = ( options.labelAlign === 'bottom' || options.labelAlign === 'top' ) ? 'vertical' : 'horizontal';
        const labelChildren = ( options.labelAlign === 'left' || options.labelAlign === 'top' ) ? [ label, radioButton ] : [ radioButton, label ];
        button = new FlowBox( {
          children: labelChildren,
          spacing: options.labelSpacing,
          orientation: labelOrientation
        } );

        // Make sure the label pointer areas don't block the expanded button pointer areas.
        label.pickable = false;

        // Use the same content appearance strategy for the labels that is used for the button content.
        // By default, this reduces opacity of the labels for the deselected radio buttons.
        if ( options.radioButtonOptions.contentAppearanceStrategy ) {
          labelAppearanceStrategies.push( new options.radioButtonOptions.contentAppearanceStrategy(
            label,
            radioButton.interactionStateProperty,
            options.radioButtonOptions.contentAppearanceStrategyOptions
          ) );
        }
      }
      else {

        // The button has no label.
        button = radioButton;
      }
      buttons.push( button );

      // pdom - If the radio button was not assigned an accessibleName, search for a default one
      // in the button. It may come from the button content or its label.
      if ( !radioButton.accessibleName ) {
        radioButton.accessibleName = findStringProperty( button );
      }

      // The highlight for the radio button should surround the layout Node if one is used.
      const focusHighlight = new HighlightFromNode( button );
      buttonsWithLayoutNodes.push( { radioButton: radioButton, layoutNode: button, focusHighlight: focusHighlight } );
      radioButton.focusHighlight = focusHighlight;
    }

    options.children = buttons;

    super( options );

    // Fallback behavior for Voicing. If the voicingHintResponse is not provided, use the accessibleHelpText.
    const radioButtonGroupFocusListener = new RadioButtonGroupFocusListener( this,
      options.voicingHintResponse || options.accessibleHelpText || null,
      options.speakVoicingNameResponseOnFocus,
      options.voicingNameResponse || options.accessibleName || null
    );

    // Remove it
    this.addInputListener( radioButtonGroupFocusListener, {
      disposer: this
    } );

    // Also let it dispose its own internal Property instances
    this.addDisposable( radioButtonGroupFocusListener );

    this.radioButtonMap = radioButtonMap;

    // pdom - This node's primary sibling is aria-labelledby its own label, so the label content is read whenever
    // a member of the group receives focus.
    this.addAriaLabelledbyAssociation( {
      thisElementName: PDOMPeer.PRIMARY_SIBLING,
      otherNode: this,
      otherElementName: PDOMPeer.HEADING_SIBLING
    } );

    // pan and zoom - Signify that key input is reserved, and we should not pan when user presses the arrow keys.
    const intentListener: TInputListener = { keydown: event => event.pointer.reserveForKeyboardDrag() };
    this.addInputListener( intentListener );

    // must be done after this instance is instrumented
    this.addLinkedElement( property, {
      tandemName: 'property'
    } );

    assert && SunUtil.validateLinkedElementInstrumentation( this, property );

    this.disposeRadioButtonGroup = () => {
      this.removeInputListener( intentListener );

      buttonsWithLayoutNodes.forEach( buttonWithLayoutNode => {
        buttonWithLayoutNode.focusHighlight.dispose();
        buttonWithLayoutNode.radioButton.dispose();

        // A layout Node was created for this button, so it should be disposed.
        if ( buttonWithLayoutNode.radioButton !== buttonWithLayoutNode.layoutNode ) {
          buttonWithLayoutNode.layoutNode.dispose();
        }
      } );

      labelAppearanceStrategies.forEach( strategy => ( strategy.dispose && strategy.dispose() ) );
      nodes.forEach( node => node.dispose() );
    };

    // pdom - register component for binder docs
    assert && window.phet?.chipper?.queryParameters?.binder && InstanceRegistry.registerDataURL( 'sun', 'RectangularRadioButtonGroup', this );
  }

  /**
   * Find the RectangularRadioButton corresponding to a value. Note that in the scene graph, the button may be nested
   * under other layers, so use caution for coordinate transformations.
   * @param value
   * @returns the corresponding button
   */
  public getButtonForValue( value: T ): RectangularRadioButton<T> {
    const result = this.radioButtonMap.get( value )!;
    assert && assert( result, 'No button found for value: ' + value );
    return result;
  }

  public override dispose(): void {
    this.radioButtonMap.clear();
    this.disposeRadioButtonGroup();
    super.dispose();
  }
}

sun.register( 'RectangularRadioButtonGroup', RectangularRadioButtonGroup );