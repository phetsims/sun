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
import { Color, FocusHighlightPath, IColor, IInputListener, IPaint, LayoutBox, LayoutBoxOptions, Node, PDOMPeer, Rectangle, SceneryConstants } from '../../../scenery/js/imports.js';
import multiSelectionSoundPlayerFactory from '../../../tambo/js/multiSelectionSoundPlayerFactory.js';
import Tandem from '../../../tandem/js/Tandem.js';
import ColorConstants from '../ColorConstants.js';
import sun from '../sun.js';
import RectangularRadioButton from './RectangularRadioButton.js';
import TButtonAppearanceStrategy from './TButtonAppearanceStrategy.js';
import Property from '../../../axon/js/Property.js';
import { VoicingResponse } from '../../../utterance-queue/js/ResponsePacket.js';
import ISoundPlayer from '../../../tambo/js/ISoundPlayer.js';
import TContentAppearanceStrategy from './TContentAppearanceStrategy.js';

// constants
const BUTTON_CONTENT_X_ALIGN_VALUES = [ 'center', 'left', 'right' ] as const;
const BUTTON_CONTENT_Y_ALIGN_VALUES = [ 'center', 'top', 'bottom' ] as const;
const CLASS_NAME = 'RectangularRadioButtonGroup'; // to prefix instanceCount in case there are different kinds of "groups"

export type RectangularRadioButtonContentXAlign = typeof BUTTON_CONTENT_X_ALIGN_VALUES[number];
export type RectangularRadioButtonContentYAlign = typeof BUTTON_CONTENT_Y_ALIGN_VALUES[number];
export type RectangularRadioButtonLabelAlign = 'top' | 'bottom' | 'left' | 'right';

type RectangularRadioButtonItem<T> = {
  node: Node; // primary depiction for the button
  value: T; // value associated with the button
  label?: Node; // If a label is provided, the button becomes a LayoutBox with the label and radio button
  phetioDocumentation?: string; // optional documentation for PhET-iO
  tandemName?: string; // optional tandem for PhET-iO
  tandem?: never; // use tandemName instead of a Tandem instance
  labelContent?: string; // optional label for a11y (description and voicing)
  voicingContextResponse?: VoicingResponse;
  descriptionContent?: string; // optional label for a11y
}

// pdom - Unique ID for each instance of RectangularRadioButtonGroup, passed to individual buttons in the group. All buttons in
// the  radio button group must have the same name or else the browser will treat all inputs of type radio in the
// document as being in a single group.
let instanceCount = 0;

type SelfOptions = {
  // Sound generation for the radio buttons, null means to use the defaults, otherwise there
  // must be one for each element in contentArray
  soundPlayers?: ISoundPlayer[] | null;

  // The fill for the rectangle behind the radio buttons.  Default color is bluish color, as in the other button library.
  baseColor?: IColor;

  // Options for buttonAppearanceStrategy.
  //TODO https://github.com/phetsims/sun/issues/653 These are already specified in RectangularRadioButton, but
  //  must to be included here due to the use of _.pick below
  overButtonOpacity?: number;
  selectedStroke?: IPaint;
  selectedLineWidth?: number;
  selectedButtonOpacity?: number;
  deselectedStroke?: IPaint;
  deselectedLineWidth?: number;
  deselectedButtonOpacity?: number;

  // Class that determines the content's appearance for the values of interactionStateProperty.
  contentAppearanceStrategy?: TContentAppearanceStrategy | null;

  // Options used by RectangularRadioButton.ContentAppearanceStrategy.
  //TODO https://github.com/phetsims/sun/issues/653 These are already specified in RectangularRadioButton, but
  //  must to be included here due to the use of _.pick below
  overContentOpacity?: number;
  selectedContentOpacity?: number;
  deselectedContentOpacity?: number;

  // These margins are *within* each button
  buttonContentXMargin?: number;
  buttonContentYMargin?: number;

  // alignment of the content nodes *within* each button
  buttonContentXAlign?: RectangularRadioButtonContentXAlign;
  buttonContentYAlign?: RectangularRadioButtonContentYAlign;

  // TouchArea expansion
  touchAreaXDilation?: number;
  touchAreaYDilation?: number;

  // MouseArea expansion
  mouseAreaXDilation?: number;
  mouseAreaYDilation?: number;

  //The radius for each button
  cornerRadius?: number;

  // How far from the button the text label is (only applies if labels are passed in)
  labelSpacing?: number;

  // Which side of the button the label will appear, options are 'top', 'bottom', 'left', 'right'
  // (only applies if labels are passed in)
  labelAlign?: RectangularRadioButtonLabelAlign;

  // pdom - focus highlight expansion
  a11yHighlightXDilation?: number;
  a11yHighlightYDilation?: number;

  // voicing - hint response added to the focus response, and nowhere else.
  voicingHintResponse?: VoicingResponse;
};

export type RectangularRadioButtonGroupOptions = SelfOptions & LayoutBoxOptions;

export default class RectangularRadioButtonGroup<T> extends LayoutBox {

  private disposeRadioButtonGroup: () => void;

  constructor( property: Property<T>, items: RectangularRadioButtonItem<T>[], providedOptions?: RectangularRadioButtonGroupOptions ) {

    // These options are passed to each RectangularRadioButton created in this group.
    const defaultOptions = {

      // LayoutBox options (super class of RectangularRadioButtonGroup)
      spacing: 10,
      orientation: 'vertical',

      // The fill for the rectangle behind the radio buttons.  Default color is bluish color, as in the other button library.
      baseColor: ColorConstants.LIGHT_BLUE,

      // Options for buttonAppearanceStrategy.
      //TODO https://github.com/phetsims/sun/issues/653 These are already specified in RectangularRadioButton, but
      //  must to be included here due to the use of _.pick below
      overButtonOpacity: 0.8,
      selectedStroke: 'black',
      selectedLineWidth: 1.5,
      selectedButtonOpacity: 1,
      deselectedStroke: new Color( 50, 50, 50 ),
      deselectedLineWidth: 1,
      deselectedButtonOpacity: 0.6,

      // {constructor|null} Class that determines the content's appearance for the values of interactionStateProperty.
      contentAppearanceStrategy: RectangularRadioButton.ContentAppearanceStrategy,

      // Options used by RectangularRadioButton.ContentAppearanceStrategy.
      //TODO https://github.com/phetsims/sun/issues/653 These are already specified in RectangularRadioButton, but
      //  must to be included here due to the use of _.pick below
      overContentOpacity: 0.8,
      selectedContentOpacity: 1,
      deselectedContentOpacity: 0.6,

      // These margins are *within* each button
      buttonContentXMargin: 5,
      buttonContentYMargin: 5,

      // alignment of the content nodes *within* each button
      buttonContentXAlign: 'center', // {string} see BUTTON_CONTENT_X_ALIGN_VALUES
      buttonContentYAlign: 'center', // {string} see BUTTON_CONTENT_Y_ALIGN_VALUES

      // TouchArea expansion
      touchAreaXDilation: 0,
      touchAreaYDilation: 0,

      // MouseArea expansion
      mouseAreaXDilation: 0,
      mouseAreaYDilation: 0,

      //The radius for each button
      cornerRadius: 4,

      // How far from the button the text label is (only applies if labels are passed in)
      labelSpacing: 0,

      // Which side of the button the label will appear, options are 'top', 'bottom', 'left', 'right'
      // (only applies if labels are passed in)
      labelAlign: 'bottom',

      // pdom - focus highlight expansion
      a11yHighlightXDilation: 0,
      a11yHighlightYDilation: 0,

      // voicing - hint response added to the focus response, and nowhere else.
      voicingHintResponse: null
    };

    const normalOptions = {

      // {number} - opt into Node's disabled opacity when enabled:false
      disabledOpacity: SceneryConstants.DISABLED_OPACITY,

      // phet-io
      tandem: Tandem.REQUIRED,
      visiblePropertyOptions: { phetioFeatured: true },
      phetioEnabledPropertyInstrumented: true, // opt into default PhET-iO instrumented enabledProperty

      soundPlayers: null,

      // pdom
      tagName: 'ul',
      labelTagName: 'h3',
      ariaRole: 'radiogroup',
      groupFocusHighlight: true
    };

    // NOTE: The separation of a bunch of the options makes this complicated. Ideally use optionize in the future
    const options = merge( _.clone( defaultOptions ), normalOptions, providedOptions ) as Required<SelfOptions> & RectangularRadioButtonGroupOptions & { tandem: Tandem };

    // increment instance count
    instanceCount++;

    assert && assert( !options.hasOwnProperty( 'children' ), 'Cannot pass in children to a RectangularRadioButtonGroup, ' +
                                                             'create siblings in the parent node instead' );

    // make sure every object in the content array has properties 'node' and 'value'
    assert && assert( _.every( items, item => {
      return item.hasOwnProperty( 'node' ) && item.hasOwnProperty( 'value' );
    } ), 'contentArray must be an array of objects with properties "node" and "value"' );

    // make sure that if sound players are provided, there is one per radio button
    assert && assert( options.soundPlayers === null || options.soundPlayers.length === items.length );

    let i; // for loops

    // make sure that each value passed into the contentArray is unique
    const uniqueValues = [];
    for ( i = 0; i < items.length; i++ ) {
      if ( uniqueValues.indexOf( items[ i ].value ) < 0 ) {
        uniqueValues.push( items[ i ].value );
      }
      else {
        throw new Error( `Duplicate value: "${items[ i ].value}" passed into RectangularRadioButtonGroup.js` );
      }
    }

    // make sure that the Property passed in currently has a value from the contentArray
    if ( uniqueValues.indexOf( property.get() ) === -1 ) {
      throw new Error( `The Property passed in to RectangularRadioButtonGroup has an illegal value "${property.get()
      }" that is not present in the contentArray` );
    }

    assert && assert( _.includes( BUTTON_CONTENT_X_ALIGN_VALUES, options.buttonContentXAlign ),
      `invalid buttonContentXAlign: ${options.buttonContentXAlign}` );
    assert && assert( _.includes( BUTTON_CONTENT_Y_ALIGN_VALUES, options.buttonContentYAlign ),
      `invalid buttonContentYAlign: ${options.buttonContentYAlign}` );

    // make a copy of the options to pass to individual buttons that includes all default options but not scenery options
    const buttonOptions = _.pick( options, _.keys( defaultOptions ) );

    // Maximum width of the line that strokes the button.
    const maxLineWidth = Math.max( options.selectedLineWidth, options.deselectedLineWidth );

    // calculate the maximum width and height of the content so we can make all radio buttons the same size
    const widestContentWidth = _.maxBy( items, item => item.node.width )!.node.width;
    const tallestContentHeight = _.maxBy( items, item => item.node.height )!.node.height;

    // make sure all radio buttons are the same size and create the RadioButtons
    const buttons: Array<RectangularRadioButton<T> | LayoutBox> = [];

    // {ButtonWithLayoutNode[]} - Collection of both RadioButton and its layout manager, if one is created to support
    // a visual button label
    const buttonsWithLayoutNodes: ButtonWithLayoutNode<T>[] = [];

    const labelAppearanceStrategies: TButtonAppearanceStrategy[] = [];
    for ( i = 0; i < items.length; i++ ) {
      const item = items[ i ];

      assert && assert( !item.hasOwnProperty( 'phetioType' ), 'phetioType should be provided by ' +
                                                              'the Property passed to the ' +
                                                              'RectangularRadioButtonGroup constructor' );

      const radioButtonGroupMemberOptions = merge( {
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
      }, buttonOptions ) as any;

      // Pass through the tandem given the tandemName, but also support uninstrumented simulations
      if ( item.tandemName ) {
        radioButtonGroupMemberOptions.tandem = options.tandem.createTandem( item.tandemName );
      }

      // create the label and voicing response for the radio button
      if ( item.labelContent ) {
        radioButtonGroupMemberOptions.labelContent = item.labelContent;
        radioButtonGroupMemberOptions.voicingNameResponse = item.labelContent;
      }

      // pdom create description for radio button
      // use if block to prevent empty 'p' tag being added when no option is present
      if ( item.descriptionContent ) {
        radioButtonGroupMemberOptions.descriptionContent = item.descriptionContent;
      }

      if ( item.voicingContextResponse ) {
        radioButtonGroupMemberOptions.voicingContextResponse = item.voicingContextResponse;
      }

      const radioButton = new RectangularRadioButton( property, item.value, radioButtonGroupMemberOptions );

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

        // If a label is provided, the button becomes a LayoutBox with the label and radio button
        const label = item.label;
        const labelOrientation = ( options.labelAlign === 'bottom' || options.labelAlign === 'top' ) ? 'vertical' : 'horizontal';
        const labelChildren = ( options.labelAlign === 'left' || options.labelAlign === 'top' ) ? [ label, radioButton ] : [ radioButton, label ];
        button = new LayoutBox( {
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

      // @ts-ignore - JO and MK think this can be removed once Shape.js is converted to typescript.
      buttonWithLayoutParent.radioButton.touchArea = Shape.rectangle(
        -options.touchAreaXDilation - maxLineWidth / 2,
        -options.touchAreaYDilation - maxLineWidth / 2,
        maxButtonWidth + 2 * options.touchAreaXDilation,
        maxButtonHeight + 2 * options.touchAreaYDilation
      );

      // @ts-ignore - JO and MK think this can be removed once Shape.js is converted to typescript.
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

  override dispose() {
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
  radioButton: RectangularRadioButton<T>;
  layoutNode: Node;

  /**
   * @param radioButton
   * @param layoutNode - May be the same Node as the radioButton if no layout manager is needed
   */
  constructor( radioButton: RectangularRadioButton<T>, layoutNode: Node ) {
    this.radioButton = radioButton;
    this.layoutNode = layoutNode;
  }
}

sun.register( 'RectangularRadioButtonGroup', RectangularRadioButtonGroup );
