// Copyright 2014-2022, University of Colorado Boulder

/**
 * RectangularRadioButtonGroup is a group of rectangular radio buttons, in either horizontal or vertical orientation.
 * See sun.ButtonsScreenView for example usage.
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import { Shape } from '../../../kite/js/imports.js';
import InstanceRegistry from '../../../phet-core/js/documentation/InstanceRegistry.js';
import merge from '../../../phet-core/js/merge.js';
import { AlignBoxXAlign, AlignBoxYAlign, Color, FlowBox, FlowBoxOptions, FocusHighlightPath, IInputListener, IPaint, Node, PDOMPeer, Rectangle, SceneryConstants } from '../../../scenery/js/imports.js';
import multiSelectionSoundPlayerFactory from '../../../tambo/js/multiSelectionSoundPlayerFactory.js';
import Tandem from '../../../tandem/js/Tandem.js';
import ColorConstants from '../ColorConstants.js';
import sun from '../sun.js';
import RectangularRadioButton, { RectangularRadioButtonOptions } from './RectangularRadioButton.js';
import { VoicingResponse } from '../../../utterance-queue/js/ResponsePacket.js';
import ISoundPlayer from '../../../tambo/js/ISoundPlayer.js';
import TContentAppearanceStrategy from './TContentAppearanceStrategy.js';
import Property from '../../../axon/js/Property.js';

// pdom - Unique ID for each instance of RectangularRadioButtonGroup, passed to individual buttons in the group.
// All buttons in the radio button group must have the same name or else the browser will treat all inputs of
// type 'radio' in the document as being in a single group.
let instanceCount = 0;

// Prefix for instanceCount, in case there are different kinds of "groups"
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
}

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

  //TODO https://github.com/phetsims/sun/issues/740 why is this a SelfOption? It's not used anywhere, just passed to super.
  // voicing - hint response added to the focus response, and nowhere else.
  voicingHintResponse?: VoicingResponse;

  //TODO https://github.com/phetsims/sun/issues/740 these are duplicated from RectangularRadioButtonOptions, and should be nested in radioButtonOptions?: RectangularRadioButtonOptions
  //TODO https://github.com/phetsims/sun/issues/772 some of these should be in RectangularRadioButton.FlatAppearanceStrategyOptions and ContentAppearanceStrategyOptions, which do not exist
  baseColor?: IPaint;
  cornerRadius?: number;
  overButtonOpacity?: number;
  selectedStroke?: IPaint;
  selectedLineWidth?: number;
  selectedButtonOpacity?: number;
  deselectedStroke?: IPaint;
  deselectedLineWidth?: number;
  deselectedButtonOpacity?: number;
  contentAppearanceStrategy?: TContentAppearanceStrategy | null;
  overContentOpacity?: number;
  selectedContentOpacity?: number;
  deselectedContentOpacity?: number;
  touchAreaXDilation?: number;
  touchAreaYDilation?: number;
  mouseAreaXDilation?: number;
  mouseAreaYDilation?: number;

  //TODO https://github.com/phetsims/sun/issues/740 these are renamed and propagated to RectangularRadioButton instances, should be folded into radioButtonOptions?: RectangularRadioButtonOptions
  buttonContentXMargin?: number;
  buttonContentYMargin?: number;
  buttonContentXAlign?: AlignBoxXAlign;
  buttonContentYAlign?: AlignBoxYAlign;
};

//TODO https://github.com/phetsims/sun/issues/740 omit some FlowBoxOptions for pdom defaults that caller should not change
export type RectangularRadioButtonGroupOptions = SelfOptions & FlowBoxOptions;

export default class RectangularRadioButtonGroup<T> extends FlowBox {

  private readonly disposeRadioButtonGroup: () => void;

  public constructor( property: Property<T>, items: RectangularRadioButtonItem<T>[], providedOptions?: RectangularRadioButtonGroupOptions ) {

    assert && assert( _.every( items, item => !item.node.hasPDOMContent ),
      'Accessibility is provided by RectangularRadioButton and RectangularRadioButtonItem.labelContent. ' +
      'Additional PDOM content in the provided Node could break accessibility.' );

    // These options are passed to each RectangularRadioButton created in this group.
    const defaultRadioButtonOptions: RectangularRadioButtonOptions = {
      baseColor: ColorConstants.LIGHT_BLUE,
      cornerRadius: 4,
      overButtonOpacity: 0.8,
      selectedStroke: 'black',
      selectedLineWidth: 1.5,
      selectedButtonOpacity: 1,
      deselectedStroke: new Color( 50, 50, 50 ),
      deselectedLineWidth: 1,
      deselectedButtonOpacity: 0.6,
      contentAppearanceStrategy: RectangularRadioButton.ContentAppearanceStrategy,
      overContentOpacity: 0.8,
      selectedContentOpacity: 1,
      deselectedContentOpacity: 0.6,
      touchAreaXDilation: 0,
      touchAreaYDilation: 0,
      mouseAreaXDilation: 0,
      mouseAreaYDilation: 0
    };

    // These options apply to the group, not individual buttons.
    const defaultGroupOptions: RectangularRadioButtonGroupOptions = {

      //TODO https://github.com/phetsims/sun/issues/740 move these to defaults for nested radioButtonOptions
      buttonContentXMargin: 5,
      buttonContentYMargin: 5,
      buttonContentXAlign: 'center',
      buttonContentYAlign: 'center',

      // SelfOptions
      soundPlayers: null,
      labelAlign: 'bottom',
      labelSpacing: 0,
      a11yHighlightXDilation: 0,
      a11yHighlightYDilation: 0,
      voicingHintResponse: null,

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
    };

    //TODO https://github.com/phetsims/sun/issues/740 simplify, use optionize, remove any
    const options = merge( _.clone( defaultRadioButtonOptions ), defaultGroupOptions, providedOptions ) as Required<SelfOptions> & RectangularRadioButtonGroupOptions & { tandem: Tandem };

    assert && assert( options.soundPlayers === null || options.soundPlayers.length === items.length,
      'If soundPlayers is provided, there must be one per radio button.' );

    instanceCount++;

    // Make sure that each button has a unique value associated with it.
    const uniqueValues = [];
    for ( let i = 0; i < items.length; i++ ) {
      if ( uniqueValues.indexOf( items[ i ].value ) < 0 ) {
        uniqueValues.push( items[ i ].value );
      }
      else {
        throw new Error( `Duplicate value: "${items[ i ].value}" passed into RectangularRadioButtonGroup.js` );
      }
    }

    // Make sure that the Property passed in currently has a value from items.
    if ( uniqueValues.indexOf( property.get() ) === -1 ) {
      throw new Error( `The Property passed in to RectangularRadioButtonGroup has an illegal value "${property.get()
      }" that is not present in the items` );
    }

    // Maximum width of the line that strokes the button.
    const maxLineWidth = Math.max( options.selectedLineWidth, options.deselectedLineWidth );

    //TODO https://github.com/phetsims/sun/issues/740 replace with AlignBox and AlignGroup
    // calculate the maximum width and height of the content so we can make all radio buttons the same size
    const widestContentWidth = _.maxBy( items, item => item.node.width )!.node.width;
    const tallestContentHeight = _.maxBy( items, item => item.node.height )!.node.height;

    // Populated for each radio button in for loop
    const buttons: Array<RectangularRadioButton<T> | FlowBox> = [];
    const buttonsWithLayoutNodes: ButtonWithLayoutNode<T>[] = [];
    const labelAppearanceStrategies: InstanceType<TContentAppearanceStrategy>[] = [];

    for ( let i = 0; i < items.length; i++ ) {
      const item = items[ i ];

      //TODO https://github.com/phetsims/sun/issues/740 use optionize
      const radioButtonOptions = merge( {
        content: item.node,
        xMargin: options.buttonContentXMargin,
        yMargin: options.buttonContentYMargin,
        xAlign: options.buttonContentXAlign,
        yAlign: options.buttonContentYAlign,
        minWidth: widestContentWidth + 2 * options.buttonContentXMargin,
        minHeight: tallestContentHeight + 2 * options.buttonContentYMargin,
        phetioDocumentation: item.phetioDocumentation || '',
        soundPlayer: options.soundPlayers ? options.soundPlayers[ i ] :
                     multiSelectionSoundPlayerFactory.getSelectionSoundPlayer( i )
      }, _.pick( options, _.keys( defaultRadioButtonOptions ) ) ) as any;

      // Pass through the tandem given the tandemName, but also support uninstrumented simulations
      if ( item.tandemName ) {
        radioButtonOptions.tandem = options.tandem.createTandem( item.tandemName );
      }

      // create the label and voicing response for the radio button
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

      // pdom - so the browser recognizes these buttons are in the same group, see instanceCount for more info
      radioButton.setPDOMAttribute( 'name', CLASS_NAME + instanceCount );

      // ensure the buttons don't resize when selected vs unselected by adding a rectangle with the max size
      const maxButtonWidth = maxLineWidth + widestContentWidth + options.buttonContentXMargin * 2;
      const maxButtonHeight = maxLineWidth + tallestContentHeight + options.buttonContentYMargin * 2;
      const boundingRect = new Rectangle( 0, 0, maxButtonWidth, maxButtonHeight, {
        fill: 'rgba(0,0,0,0)',
        center: radioButton.center
      } );
      radioButton.addChild( boundingRect );

      let button;
      if ( item.label ) {

        // If a label is provided, the button becomes a FlowBox with the label and radio button
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
        if ( options.contentAppearanceStrategy ) {
          labelAppearanceStrategies.push( new options.contentAppearanceStrategy( label, radioButton.interactionStateProperty, options ) );
        }
      }
      else {

        // The button has no label.
        button = radioButton;
      }
      buttons.push( button );
      buttonsWithLayoutNodes.push( new ButtonWithLayoutNode( radioButton, button ) );
    }

    assert && assert( !options.children, 'RectangularRadioButtonGroup sets children' );
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

    // pdom - this node's primary sibling is aria-labelledby its own label so the label content is read whenever
    // a member of the group receives focus
    this.addAriaLabelledbyAssociation( {
      thisElementName: PDOMPeer.PRIMARY_SIBLING,
      otherNode: this,
      otherElementName: PDOMPeer.LABEL_SIBLING
    } );

    // zoom - signify that key input is reserved and we should not pan when user presses arrow keys
    const intentListener: IInputListener = { keydown: event => event.pointer.reserveForKeyboardDrag() };
    this.addInputListener( intentListener );

    // must be done after this instance is instrumented
    this.addLinkedElement( property, {
      tandem: options.tandem.createTandem( 'property' )
    } );

    // remove listeners from buttons and make eligible for garbage collection
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

/**
 * An inner class that collects the radio button and its layout parent. The mouse/touch areas and focus highlight
 * need to be set on the button, but need to surround the layout manager containing both the button and
 * its graphical label (if there is one).
 */
class ButtonWithLayoutNode<T> {
  public readonly radioButton: RectangularRadioButton<T>;
  public readonly layoutNode: Node;

  /**
   * @param radioButton
   * @param layoutNode - May be the same Node as the radioButton if no layout manager is needed
   */
  public constructor( radioButton: RectangularRadioButton<T>, layoutNode: Node ) {
    this.radioButton = radioButton;
    this.layoutNode = layoutNode;
  }
}

sun.register( 'RectangularRadioButtonGroup', RectangularRadioButtonGroup );
