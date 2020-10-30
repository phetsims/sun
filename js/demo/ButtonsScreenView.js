// Copyright 2014-2020, University of Colorado Boulder

/**
 * Main ScreenView container for demonstrating and testing the various buttons.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Property from '../../../axon/js/Property.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import Circle from '../../../scenery/js/nodes/Circle.js';
import HBox from '../../../scenery/js/nodes/HBox.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../scenery/js/nodes/Text.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import Color from '../../../scenery/js/util/Color.js';
import Font from '../../../scenery/js/util/Font.js';
import ArrowButton from '../buttons/ArrowButton.js';
import BooleanRectangularStickyToggleButton from '../buttons/BooleanRectangularStickyToggleButton.js';
import ButtonNode from '../buttons/ButtonNode.js';
import CarouselButton from '../buttons/CarouselButton.js';
import RectangularMomentaryButton from '../buttons/RectangularMomentaryButton.js';
import RectangularPushButton from '../buttons/RectangularPushButton.js';
import RectangularRadioButtonGroup from '../buttons/RectangularRadioButtonGroup.js';
import RoundMomentaryButton from '../buttons/RoundMomentaryButton.js';
import RoundPushButton from '../buttons/RoundPushButton.js';
import RoundStickyToggleButton from '../buttons/RoundStickyToggleButton.js';
import Checkbox from '../Checkbox.js';
import Panel from '../Panel.js';
import sun from '../sun.js';
import VerticalAquaRadioButtonGroup from '../VerticalAquaRadioButtonGroup.js';

// constants
const BUTTON_FONT_SIZE = 20;
const BUTTON_FONT = new Font( { size: BUTTON_FONT_SIZE } );

class ButtonsScreenView extends ScreenView {
  constructor() {

    super();

    // For enabling/disabling all buttons
    const buttonsEnabledProperty = new Property( true );

    // Dynamic colors
    const alignBaseColor = new Property( new Color( 'red' ) );
    const roundBaseColor = new Property( new Color( 'blue' ) );
    const radioGroupBaseColor = new Property( 'green' );

    //===================================================================================
    // Radio buttons
    //===================================================================================

    // demonstrate RectangularRadioButtonGroup
    const rectangularRadioButtonValues = [ 'One', 'Two', 'Three', 'Four' ];
    const rectangularRadioButtonProperty = new Property( rectangularRadioButtonValues[ 0 ] );
    rectangularRadioButtonProperty.lazyLink( value => console.log( `rectangularRadioButtonProperty.value = ${value}` ) );
    const radioButtonContent = _.map( rectangularRadioButtonValues, stringValue => {
      return {
        value: stringValue,
        node: new Text( stringValue, { font: BUTTON_FONT } ),
        label: new Text( stringValue )
      };
    } );
    const rectangularRadioButtonGroup = new RectangularRadioButtonGroup( rectangularRadioButtonProperty, radioButtonContent, {
      selectedLineWidth: 4,

      // change these to test various orientations and alignments
      orientation: 'vertical',
      buttonContentXAlign: 'center',
      buttonContentYAlign: 'center',

      baseColor: radioGroupBaseColor
    } );
    const rectangularRadioButtonPanel = new Panel( rectangularRadioButtonGroup, {
      xMargin: 10,
      yMargin: 10
    } );

    // demonstrate VerticalAquaRadioButtonGroup
    const aquaRadioButtonValues = [ 'Small', 'Medium', 'Large' ];
    const aquaRadioButtonProperty = new Property( aquaRadioButtonValues[ 0 ] );
    aquaRadioButtonProperty.lazyLink( value => console.log( `aquaRadioButtonProperty.value = ${value}` ) );
    const aquaRadioButtonGroupContent = _.map( aquaRadioButtonValues, stringValue => {
      return {
        value: stringValue,
        node: new Text( stringValue, { font: BUTTON_FONT } ),
        labelContent: stringValue
      };
    } );
    const aquaRadioButtonGroup = new VerticalAquaRadioButtonGroup( aquaRadioButtonProperty, aquaRadioButtonGroupContent, {
      spacing: 8
    } );
    const aquaRadioButtonGroupPanel = new Panel( aquaRadioButtonGroup, {
      stroke: 'black',
      xMargin: 10,
      yMargin: 10
    } );

    // Layout for all radio button demonstrations
    const radioButtonsLayoutBox = new VBox( {
      children: [ rectangularRadioButtonPanel, aquaRadioButtonGroupPanel ],
      spacing: 15,
      align: 'left',
      left: this.layoutBounds.left + 15,
      top: this.layoutBounds.top + 15
    } );
    this.addChild( radioButtonsLayoutBox );

    //===================================================================================
    // Pseudo-3D buttons A, B, C, D, E
    //===================================================================================

    const buttonA = new RectangularPushButton( {
      content: new Text( '--- A ---', { font: BUTTON_FONT } ),
      listener: () => console.log( 'buttonA fired' ),

      // demonstrate pointer areas, see https://github.com/phetsims/sun/issues/464
      touchAreaXDilation: 10,
      touchAreaYDilation: 10,
      mouseAreaXDilation: 5,
      mouseAreaYDilation: 5
    } );

    const buttonB = new RectangularPushButton( {
      content: new Text( '--- B ---', { font: BUTTON_FONT } ),
      listener: () => console.log( 'buttonB fired' ),
      baseColor: new Color( 250, 0, 0 )
    } );

    const buttonC = new RectangularPushButton( {
      content: new Text( '--- C ---', { font: BUTTON_FONT } ),
      listener: () => console.log( 'buttonC fired' ),
      baseColor: 'rgb( 204, 102, 204 )'
    } );

    const buttonD = new RoundPushButton( {
      content: new Text( '--- D ---', { font: BUTTON_FONT } ),
      listener: () => console.log( 'buttonD fired' ),
      baseColor: roundBaseColor,
      radius: 50,
      lineWidth: 20 // a thick stroke, to test pointer areas and focus highlight
    } );

    const buttonE = new RoundPushButton( {
      content: new Text( '--- E ---', { font: BUTTON_FONT } ),
      listener: () => console.log( 'buttonE fired' ),
      baseColor: 'yellow',

      // Demonstrate shifted pointer areas, https://github.com/phetsims/sun/issues/500
      touchAreaXShift: 20,
      touchAreaYShift: 20,
      mouseAreaXShift: 10,
      mouseAreaYShift: 10
    } );

    const buttonF = new RoundPushButton( {
      content: new Text( '--- F ---', { font: BUTTON_FONT, fill: 'white' } ),
      listener: () => console.log( 'buttonF fired' ),
      baseColor: 'purple',
      xMargin: 20,
      yMargin: 20,
      xContentOffset: 8,
      yContentOffset: 15
    } );

    // Test for a button with different radii for each corner
    const customCornersButton = new RectangularPushButton( {
      baseColor: 'orange',
      minWidth: 50,
      minHeight: 50,
      leftTopCornerRadius: 20,
      rightTopCornerRadius: 10,
      rightBottomCornerRadius: 5,
      leftBottomCornerRadius: 0,
      listener: () => console.log( 'customCornersButton fired' )
    } );

    const pseudo3DButtonsBox = new HBox( {
      children: [ buttonA, buttonB, buttonC, buttonD, buttonE, buttonF, customCornersButton ],
      spacing: 10,
      left: radioButtonsLayoutBox.right + 25,
      top: this.layoutBounds.top + 15
    } );
    this.addChild( pseudo3DButtonsBox );

    //===================================================================================
    // Flat buttons labeled 1, 2, 3, 4
    //===================================================================================

    const button1 = new RectangularPushButton( {
      content: new Text( '-- 1 --', { font: BUTTON_FONT } ),
      listener: () => console.log( 'button1 fired' ),
      baseColor: 'rgb( 204, 102, 204 )',
      buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy
    } );

    const button2 = new RectangularPushButton( {
      content: new Text( '-- 2 --', { font: BUTTON_FONT } ),
      listener: () => console.log( 'button2 fired' ),
      baseColor: '#A0D022',
      buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy,
      lineWidth: 1,
      stroke: '#202020'
    } );

    const button3 = new RoundPushButton( {
      content: new Text( '- 3 -', { font: BUTTON_FONT } ),
      listener: () => console.log( 'button3 fired' ),
      buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy
    } );

    const button4 = new RoundPushButton( {
      content: new Text( '-- 4 --', { font: BUTTON_FONT, fill: 'white' } ),
      listener: () => console.log( 'button4 fired' ),
      baseColor: '#CC3300',
      buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy
    } );

    const flatButtonsBox = new HBox( {
      children: [ button1, button2, button3, button4 ],
      spacing: 10,
      left: pseudo3DButtonsBox.left,
      top: pseudo3DButtonsBox.bottom + 30
    } );
    this.addChild( flatButtonsBox );

    //===================================================================================
    // Fire! Go! Help! buttons - these demonstrate more colors and sizes of buttons
    //===================================================================================

    const fireButton = new RoundPushButton( {
      content: new Text( 'Fire!', { font: BUTTON_FONT } ),
      listener: () => console.log( 'fireButton fired' ),
      baseColor: 'orange',
      stroke: 'black',
      lineWidth: 0.5
    } );

    const goButton = new RoundPushButton( {
      content: new Text( 'Go!', { font: BUTTON_FONT } ),
      listener: () => console.log( 'goButton fired' ),
      baseColor: new Color( 0, 163, 0 ),
      minXPadding: 10
    } );

    const helpButton = new RoundPushButton( {
      content: new Text( 'Help', { font: BUTTON_FONT } ),
      listener: () => console.log( 'helpButton fired' ),
      baseColor: new Color( 244, 154, 194 ),
      minXPadding: 10
    } );

    const actionButtonsBox = new HBox( {
      children: [ fireButton, goButton, helpButton ],
      spacing: 15,
      left: flatButtonsBox.left,
      top: flatButtonsBox.bottom + 25
    } );
    this.addChild( actionButtonsBox );

    //===================================================================================
    // Buttons with fire-on-hold turned on
    //===================================================================================

    const fireQuicklyWhenHeldButton = new RectangularPushButton( {
      content: new Text( 'Press and hold to test (fast fire)', { font: BUTTON_FONT } ),
      listener: () => console.log( 'fireQuicklyWhenHeldButton fired' ),
      baseColor: new Color( 114, 132, 62 ),
      fireOnHold: true,
      fireOnHoldDelay: 100,
      fireOnHoldInterval: 50
    } );

    const fireSlowlyWhenHeldButton = new RectangularPushButton( {
      content: new Text( 'Press and hold to test (slow fire)', { font: BUTTON_FONT } ),
      listener: () => console.log( 'fireSlowlyWhenHeldButton fired' ),
      baseColor: new Color( 147, 92, 120 ),
      fireOnHold: true,
      fireOnHoldDelay: 600,
      fireOnHoldInterval: 300,
      top: fireQuicklyWhenHeldButton.bottom + 10
    } );

    const heldButtonsBox = new VBox( {
      children: [ fireQuicklyWhenHeldButton, fireSlowlyWhenHeldButton ],
      spacing: 10,
      align: 'left',
      left: flatButtonsBox.right + 20,
      top: flatButtonsBox.top
    } );
    this.addChild( heldButtonsBox );

    const upperLeftAlignTextNode = new Text( 'upper left align test', { font: BUTTON_FONT } );
    const upperLeftContentButton = new RectangularPushButton( {
      content: upperLeftAlignTextNode,
      listener: () => console.log( 'upperLeftContentButton fired' ),
      baseColor: alignBaseColor,
      xAlign: 'left',
      yAlign: 'top',
      minWidth: upperLeftAlignTextNode.width * 1.5,
      minHeight: upperLeftAlignTextNode.height * 2
    } );

    const lowerRightAlignTextNode = new Text( 'lower right align test', { font: BUTTON_FONT } );
    const lowerRightContentButton = new RectangularPushButton( {
      content: lowerRightAlignTextNode,
      listener: () => console.log( 'lowerRightContentButton fired' ),
      baseColor: alignBaseColor,
      xAlign: 'right',
      yAlign: 'bottom',
      minWidth: lowerRightAlignTextNode.width * 1.5,
      minHeight: lowerRightAlignTextNode.height * 2,
      top: upperLeftContentButton.height + 10
    } );

    const alignTextButtonsBox = new VBox( {
      children: [ upperLeftContentButton, lowerRightContentButton ],
      spacing: 10,
      left: heldButtonsBox.left,
      top: heldButtonsBox.bottom + 10,
      align: 'left'
    } );
    this.addChild( alignTextButtonsBox );

    //===================================================================================
    // Miscellaneous other button examples
    //===================================================================================

    const fireOnDownButton = new RectangularPushButton( {
      content: new Text( 'Fire on Down', { font: BUTTON_FONT } ),
      listener: () => console.log( 'fireOnDownButton fired' ),
      baseColor: new Color( 255, 255, 61 ),
      fireOnDown: true,
      stroke: 'black',
      lineWidth: 1
    } );

    // transparent button with something behind it
    const rectangleNode = new Rectangle( 0, 0, 25, 50, { fill: 'red' } );
    const transparentButton = new RectangularPushButton( {
      content: new Text( 'Transparent Button', { font: BUTTON_FONT } ),
      listener: () => console.log( 'transparentButton fired' ),
      baseColor: new Color( 255, 255, 0, 0.7 ),
      center: rectangleNode.center
    } );
    const transparentParent = new Node( { children: [ rectangleNode, transparentButton ] } );

    const arrowButton = new ArrowButton( 'left', () => console.log( 'arrowButton fired' ), {
      enabledProperty: buttonsEnabledProperty
    } );

    const carouselButton = new CarouselButton( {
      listener: () => console.log( 'carouselButton fired' )
    } );

    const miscButtonsBox = new VBox( {
      children: [ fireOnDownButton, transparentParent, arrowButton, carouselButton ],
      spacing: 15,
      left: actionButtonsBox.left,
      top: actionButtonsBox.bottom + 25
    } );
    this.addChild( miscButtonsBox );

    //===================================================================================
    // Toggle buttons
    //===================================================================================

    // Demonstrate using arbitrary values for toggle button.  Wrap in extra
    // quotes so it is clear that it is a string in the debugging UI.
    const roundToggleButtonProperty = new Property( 'off' );
    roundToggleButtonProperty.lazyLink( value => console.log( `roundToggleButtonProperty.value = ${value}` ) );
    const roundStickyToggleButton = new RoundStickyToggleButton( 'off', 'on', roundToggleButtonProperty, {
      baseColor: new Color( 255, 0, 0 )
    } );

    const booleanRectangularToggleButtonProperty = new BooleanProperty( false );
    booleanRectangularToggleButtonProperty.lazyLink( value => console.log( `booleanRectangularToggleButtonProperty.value = ${value}` ) );
    const booleanRectangularStickyToggleButton = new BooleanRectangularStickyToggleButton( booleanRectangularToggleButtonProperty, {
      baseColor: new Color( 0, 200, 200 ),
      centerX: roundStickyToggleButton.centerX,
      top: roundStickyToggleButton.bottom + 10,
      minWidth: 50,
      minHeight: 35
    } );

    const toggleButtonsBox = new VBox( {
      children: [ roundStickyToggleButton, booleanRectangularStickyToggleButton ],
      spacing: 15,
      left: miscButtonsBox.right + 25,
      top: alignTextButtonsBox.bottom + 10
    } );
    this.addChild( toggleButtonsBox );

    //===================================================================================
    // Momentary buttons
    //===================================================================================

    // round
    const roundMomentaryProperty = new Property( false );
    roundMomentaryProperty.lazyLink( value => console.log( `roundMomentaryProperty.value = ${value}` ) );
    const roundMomentaryButton = new RoundMomentaryButton( false, true, roundMomentaryProperty, {
      baseColor: '#D76958',
      left: roundStickyToggleButton.right + 10,
      centerY: roundStickyToggleButton.centerY
    } );

    // rectangular
    const rectangularMomentaryProperty = new Property( false );
    rectangularMomentaryProperty.lazyLink( value => console.log( `rectangularMomentaryProperty.value = ${value}` ) );
    const rectangularMomentaryButton = new RectangularMomentaryButton( false, true, rectangularMomentaryProperty, {
      baseColor: '#724C35',
      minWidth: 50,
      minHeight: 40,
      centerX: roundMomentaryButton.centerX,
      top: roundMomentaryButton.bottom + 10
    } );

    const momentaryButtonsBox = new VBox( {
      children: [ roundMomentaryButton, rectangularMomentaryButton ],
      spacing: 15,
      left: toggleButtonsBox.right + 25,
      top: toggleButtonsBox.top
    } );
    this.addChild( momentaryButtonsBox );

    //===================================================================================
    // Demonstrate dynamic colors for some buttons
    //===================================================================================

    // Add a button to set alternative color scheme.
    const changeButtonColorsButton = new RectangularPushButton( {
      content: new Text( 'Change Some Button Colors', { font: BUTTON_FONT } ),
      listener: () => {

        /* eslint-disable bad-sim-text */
        buttonA.baseColor = new Color( _.random( 0, 255 ), _.random( 0, 255 ), _.random( 0, 255 ) );
        buttonD.baseColor = new Color( _.random( 0, 255 ), _.random( 0, 255 ), _.random( 0, 255 ) );
        button1.baseColor = new Color( _.random( 0, 255 ), _.random( 0, 255 ), _.random( 0, 255 ) );
        button3.baseColor = new Color( _.random( 0, 255 ), _.random( 0, 255 ), _.random( 0, 255 ) );

        alignBaseColor.value = new Color( _.random( 0, 255 ), _.random( 0, 255 ), _.random( 0, 255 ) );
        radioGroupBaseColor.value = new Color( _.random( 0, 255 ), _.random( 0, 255 ), _.random( 0, 255 ) );
        roundBaseColor.value = new Color( _.random( 0, 255 ), _.random( 0, 255 ), _.random( 0, 255 ) );
        /* eslint-enable bad-sim-text */

        console.log( 'changeButtonColorsButton fired' );
      },
      left: this.layoutBounds.left + 15,
      bottom: this.layoutBounds.bottom - 15,

      // Demonstrate shifted pointer areas, https://github.com/phetsims/sun/issues/500
      touchAreaXShift: -20,
      touchAreaYShift: -20,
      mouseAreaXShift: -10,
      mouseAreaYShift: -10
    } );
    this.addChild( changeButtonColorsButton );

    //===================================================================================
    // Test the 2 ways of specifying a button's size:
    // (1) If you provide size of the button, content is sized to fit the button.
    // (2) If you don't provide size, the button is sized to fit the content.
    // See https://github.com/phetsims/sun/issues/657
    //===================================================================================

    // This button's stroke will look thicker, because content will be scaled up.
    const roundButtonWithExplicitSize = new RoundPushButton( {
      radius: 25,
      content: new Circle( 5, { fill: 'red', stroke: 'black' } ),
      listener: () => console.log( 'roundButtonWithExplicitSize pressed' ),
      xMargin: 5,
      yMargin: 5
    } );

    // This button's content will look as specified, because button is sized to fit the content.
    const roundButtonWithDerivedSize = new RoundPushButton( {
      content: new Circle( 20, { fill: 'red', stroke: 'black' } ),
      listener: () => console.log( 'roundButtonWithDerivedSize pressed' ),
      xMargin: 5,
      yMargin: 5
    } );

    this.addChild( new HBox( {
      spacing: 20,
      children: [ roundButtonWithExplicitSize, roundButtonWithDerivedSize ],
      left: changeButtonColorsButton.right + 20,
      bottom: changeButtonColorsButton.bottom
    } ) );

    //===================================================================================
    // Enable/Disable buttons
    //===================================================================================

    // For all of the button instances that do not use options.enabledProperty to observe
    // buttonsEnabledProperty directly, synchronize their enabled state here.
    buttonsEnabledProperty.link( enabled => {

      // radio button groups
      rectangularRadioButtonGroup.enabled = enabled;
      aquaRadioButtonGroup.enabled = enabled;

      // Test the enabledProperty ES5 getter for these buttons, see https://github.com/phetsims/sun/issues/515
      buttonA.enabledProperty.value = enabled;
      buttonB.enabledProperty.value = enabled;
      buttonC.enabledProperty.value = enabled;
      buttonD.enabledProperty.value = enabled;
      buttonE.enabledProperty.value = enabled;

      // Other buttons
      customCornersButton.enabled = enabled;
      button1.enabled = enabled;
      button2.enabled = enabled;
      button3.enabled = enabled;
      button4.enabled = enabled;
      fireButton.enabled = enabled;
      goButton.enabled = enabled;
      helpButton.enabled = enabled;
      fireOnDownButton.enabled = enabled;
      transparentButton.enabled = enabled;
      roundStickyToggleButton.enabled = enabled;
      booleanRectangularStickyToggleButton.enabled = enabled;
      fireQuicklyWhenHeldButton.enabled = enabled;
      fireSlowlyWhenHeldButton.enabled = enabled;
      upperLeftContentButton.enabled = enabled;
      lowerRightContentButton.enabled = enabled;
      rectangularMomentaryButton.enabled = enabled;
      roundMomentaryButton.enabled = enabled;
      changeButtonColorsButton.enabled = enabled;
    } );

    const buttonsEnabledText = new Text( 'buttons enabled', {
      font: new Font( { size: 20 } )
    } );
    const buttonsEnabledCheckbox = new Checkbox( buttonsEnabledText, buttonsEnabledProperty, {
      right: this.layoutBounds.right - 15,
      bottom: this.layoutBounds.bottom - 15
    } );
    this.addChild( buttonsEnabledCheckbox );
  }
}

sun.register( 'ButtonsScreenView', ButtonsScreenView );
export default ButtonsScreenView;