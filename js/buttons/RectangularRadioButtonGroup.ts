// Copyright 2014-2022, University of Colorado Boulder

/**
 * RectangularRadioButtonGroup is a group of rectangular radio buttons, in either horizontal or vertical orientation.
 * See sun.ButtonsScreenView for example usage.
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Shape } from '../../../kite/js/imports.js';
import InstanceRegistry from '../../../phet-core/js/documentation/InstanceRegistry.js';
import { Color, FlowBox, FlowBoxOptions, FocusHighlightPath, IInputListener, Node, PDOMPeer, Rectangle, SceneryConstants } from '../../../scenery/js/imports.js';
import multiSelectionSoundPlayerFactory from '../../../tambo/js/multiSelectionSoundPlayerFactory.js';
import Tandem from '../../../tandem/js/Tandem.js';
import ColorConstants from '../ColorConstants.js';
import sun from '../sun.js';
import RectangularRadioButton, { RectangularRadioButtonOptions } from './RectangularRadioButton.js';
import { VoicingResponse } from '../../../utterance-queue/js/ResponsePacket.js';
import ISoundPlayer from '../../../tambo/js/ISoundPlayer.js';
import TContentAppearanceStrategy from './TContentAppearanceStrategy.js';
import Property from '../../../axon/js/Property.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';

// pdom - Unique ID for each instance of RectangularRadioButtonGroup. Used to create the 'name' option that is passed
// to each RectangularRadioButton in the group. All buttons in the group must have the same 'name', and that name
// must be unique to the group. Otherwise, the browser will treat all inputs of type 'radio' in the document as being
// in a single group.
let instanceCount = 0;

// Prefix for instanceCount, because PhET sims have different types of "groups"
const CLASS_NAME = 'RectangularRadioButtonGroup';

// Describes one radio button
export type RectangularRadioButtonItem<T> = {
  node: Node; // primary depiction for the button
  value: T; // value associated with the button
  label?: Node; // optional label that appears outside the button
  phetioDocumentation?: string; // optional documentation for PhET-iO
  tandemName?: string; // optional tandem for PhET-iO
  tandem?: never; // use tandemName instead of a Tandem instance
  labelContent?: string; // optional label for a11y (description and voicing)
  voicingContextResponse?: VoicingResponse;
  descriptionContent?: string; // optional label for a11y
};

/**
 * Identifies a radio button and its layout manager. Pointer areas and focus highlight need to be set on
 * the button, but need to surround the layout manager containing both the button and its optional label.
 * This was formerly a class, converted to a type when PhET moved to TypeScript.
 * See https://github.com/phetsims/sun/issues/708
 */
type ButtonWithLayoutNode<T> = {
  radioButton: RectangularRadioButton<T>;
  readonly layoutNode: Node;
};

// Where the optional label appears, relative to the radio button
export type RectangularRadioButtonLabelAlign = 'top' | 'bottom' | 'left' | 'right';

type SelfOptions = {

  // Sound generation for the radio buttons.
  // null means to use the defaults. Otherwise, there must be one for each button.
  soundPlayers?: ISoundPlayer[] | null;

  // Determines where the optional label appears, relative to the button
  labelAlign?: RectangularRadioButtonLabelAlign;

  // Spacing between the optional label and the button
  labelSpacing?: number;

  // pdom - focus highlight expansion
  a11yHighlightXDilation?: number;
  a11yHighlightYDilation?: number;

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
};

export type RectangularRadioButtonGroupOptions = SelfOptions & StrictOmit<FlowBoxOptions,
  'children' | 'tagName' | 'labelTagName' | 'ariaRole' | 'groupFocusHighlight'>;

export default class RectangularRadioButtonGroup<T> extends FlowBox {

  private readonly disposeRadioButtonGroup: () => void;

  public constructor( property: Property<T>, items: RectangularRadioButtonItem<T>[], providedOptions?: RectangularRadioButtonGroupOptions ) {

    assert && assert( _.uniqBy( items, item => item.value ).length === items.length,
      'items must have unique values' );
    assert && assert( _.find( items, item => ( item.value === property.value ) ),
      'one radio button must be associated with property.value' );
    assert && assert( _.every( items, item => !item.node.hasPDOMContent ),
      'Accessibility is provided by RectangularRadioButton and RectangularRadioButtonItem.labelContent. ' +
      'Additional PDOM content in the provided Node could break accessibility.' );

    const options = optionize<RectangularRadioButtonGroupOptions, SelfOptions, FlowBoxOptions>()( {

      // SelfOptions
      soundPlayers: null,
      labelAlign: 'bottom',
      labelSpacing: 0,
      a11yHighlightXDilation: 0,
      a11yHighlightYDilation: 0,
      touchAreaXDilation: 0,
      touchAreaYDilation: 0,
      mouseAreaXDilation: 0,
      mouseAreaYDilation: 0,
      radioButtonOptions: {
        baseColor: ColorConstants.LIGHT_BLUE,
        cornerRadius: 4,
        selectedStroke: 'black',
        selectedLineWidth: 1.5,
        selectedButtonOpacity: 1,
        deselectedStroke: new Color( 50, 50, 50 ),
        deselectedLineWidth: 1,
        deselectedButtonOpacity: 0.6,
        contentAppearanceStrategy: RectangularRadioButton.ContentAppearanceStrategy,
        overButtonOpacity: 0.8,
        overContentOpacity: 0.8,
        selectedContentOpacity: 1,
        deselectedContentOpacity: 0.6,
        xMargin: 5,
        yMargin: 5,
        xAlign: 'center',
        yAlign: 'center'
      },

      // FlowBoxOptions
      spacing: 10,
      orientation: 'vertical',
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

    assert && assert( options.soundPlayers === null || options.soundPlayers.length === items.length,
      'If soundPlayers is provided, there must be one per radio button.' );

    instanceCount++;

    // Maximum width of the line that strokes the button.
    const maxLineWidth = Math.max( options.radioButtonOptions.selectedLineWidth!, options.radioButtonOptions.deselectedLineWidth! );

    // Calculate the maximum width and height of the content, so we can make all radio buttons the same size.
    const widestContentWidth = _.maxBy( items, item => item.node.width )!.node.width;
    const tallestContentHeight = _.maxBy( items, item => item.node.height )!.node.height;

    // Populated for each radio button in for loop
    const buttons: Array<RectangularRadioButton<T> | FlowBox> = [];
    const buttonsWithLayoutNodes: ButtonWithLayoutNode<T>[] = [];
    const labelAppearanceStrategies: InstanceType<TContentAppearanceStrategy>[] = [];

    const xMargin: number = options.radioButtonOptions.xMargin!;
    const yMargin: number = options.radioButtonOptions.yMargin!;

    for ( let i = 0; i < items.length; i++ ) {
      const item = items[ i ];

      const radioButtonOptions = combineOptions<RectangularRadioButtonOptions>( {
        content: item.node,
        minWidth: widestContentWidth + 2 * xMargin,
        minHeight: tallestContentHeight + 2 * yMargin,
        soundPlayer: options.soundPlayers ? options.soundPlayers[ i ] :
                     multiSelectionSoundPlayerFactory.getSelectionSoundPlayer( i ),
        tandem: item.tandemName ? options.tandem.createTandem( item.tandemName ) : Tandem.OPT_OUT,
        phetioDocumentation: item.phetioDocumentation || ''
      }, options.radioButtonOptions );

      // Create the label and voicing response for the radio button.
      if ( item.labelContent ) {
        radioButtonOptions.labelContent = item.labelContent;
        radioButtonOptions.voicingNameResponse = item.labelContent;
      }

      // pdom create description for radio button
      // use if block to prevent empty 'p' tag being added when no option is present
      if ( item.descriptionContent ) {
        radioButtonOptions.descriptionContent = item.descriptionContent;
      }

      if ( item.voicingContextResponse ) {
        radioButtonOptions.voicingContextResponse = item.voicingContextResponse;
      }

      const radioButton = new RectangularRadioButton( property, item.value, radioButtonOptions );

      // pdom - so the browser recognizes these buttons are in the same group. See instanceCount for more info.
      radioButton.setPDOMAttribute( 'name', CLASS_NAME + instanceCount );

      // Ensure the buttons don't resize when selected vs unselected, by adding a rectangle with the max size.
      const maxButtonWidth = maxLineWidth + widestContentWidth + 2 * xMargin;
      const maxButtonHeight = maxLineWidth + tallestContentHeight + 2 * yMargin;
      const boundingRect = new Rectangle( 0, 0, maxButtonWidth, maxButtonHeight, {
        fill: 'rgba(0,0,0,0)',
        center: radioButton.center
      } );
      radioButton.addChild( boundingRect );

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
          labelAppearanceStrategies.push( new options.radioButtonOptions.contentAppearanceStrategy( label,
            radioButton.interactionStateProperty, options.radioButtonOptions ) );
        }
      }
      else {

        // The button has no label.
        button = radioButton;
      }
      buttons.push( button );
      buttonsWithLayoutNodes.push( { radioButton: radioButton, layoutNode: button } );
    }

    options.children = buttons;

    // Pointer areas and focus highlight, sized to fit the largest button. See https://github.com/phetsims/sun/issues/708.
    const maxButtonWidth = _.maxBy( buttonsWithLayoutNodes, ( buttonWithLayoutParent: ButtonWithLayoutNode<T> ) => buttonWithLayoutParent.layoutNode.width )!.layoutNode.width;
    const maxButtonHeight = _.maxBy( buttonsWithLayoutNodes, ( buttonWithLayoutParent: ButtonWithLayoutNode<T> ) => buttonWithLayoutParent.layoutNode.height )!.layoutNode.height;
    buttonsWithLayoutNodes.forEach( ( buttonWithLayoutParent: ButtonWithLayoutNode<T> ) => {

      buttonWithLayoutParent.radioButton.touchArea = Shape.rectangle(
        -options.touchAreaXDilation - maxLineWidth / 2,
        -options.touchAreaYDilation - maxLineWidth / 2,
        maxButtonWidth + 2 * options.touchAreaXDilation,
        maxButtonHeight + 2 * options.touchAreaYDilation
      );

      buttonWithLayoutParent.radioButton.mouseArea = Shape.rectangle(
        -options.mouseAreaXDilation - maxLineWidth / 2,
        -options.mouseAreaYDilation - maxLineWidth / 2,
        maxButtonWidth + 2 * options.mouseAreaXDilation,
        maxButtonHeight + 2 * options.mouseAreaYDilation
      );

      const defaultDilationCoefficient = FocusHighlightPath.getDilationCoefficient( buttonWithLayoutParent.layoutNode );
      buttonWithLayoutParent.radioButton.focusHighlight = Shape.rectangle(
        -options.a11yHighlightXDilation - maxLineWidth / 2 - defaultDilationCoefficient,
        -options.a11yHighlightYDilation - maxLineWidth / 2 - defaultDilationCoefficient,
        maxButtonWidth + 2 * ( options.a11yHighlightXDilation + defaultDilationCoefficient ),
        maxButtonHeight + 2 * ( options.a11yHighlightYDilation + defaultDilationCoefficient )
      );
    } );

    super( options );

    // pdom - This node's primary sibling is aria-labelledby its own label, so the label content is read whenever
    // a member of the group receives focus.
    this.addAriaLabelledbyAssociation( {
      thisElementName: PDOMPeer.PRIMARY_SIBLING,
      otherNode: this,
      otherElementName: PDOMPeer.LABEL_SIBLING
    } );

    // pan and zoom - Signify that key input is reserved, and we should not pan when user presses arrow keys.
    const intentListener: IInputListener = { keydown: event => event.pointer.reserveForKeyboardDrag() };
    this.addInputListener( intentListener );

    // must be done after this instance is instrumented
    this.addLinkedElement( property, {
      tandem: options.tandem.createTandem( 'property' )
    } );

    this.disposeRadioButtonGroup = () => {
      this.removeInputListener( intentListener );
      buttons.forEach( button => button.dispose() );
      labelAppearanceStrategies.forEach( strategy => ( strategy.dispose && strategy.dispose() ) );
    };

    // pdom - register component for binder docs
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'RectangularRadioButtonGroup', this );
  }

  public override dispose(): void {
    this.disposeRadioButtonGroup();
    super.dispose();
  }
}

sun.register( 'RectangularRadioButtonGroup', RectangularRadioButtonGroup );
