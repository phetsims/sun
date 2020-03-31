// Copyright 2014-2020, University of Colorado Boulder

/**
 * Main ScreenView container for demonstrating and testing the various buttons.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import inherit from '../../../phet-core/js/inherit.js';
import HBox from '../../../scenery/js/nodes/HBox.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../scenery/js/nodes/Text.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import Color from '../../../scenery/js/util/Color.js';
import Font from '../../../scenery/js/util/Font.js';
import ArrowButton from '../buttons/ArrowButton.js';
import BooleanRectangularStickyToggleButton from '../buttons/BooleanRectangularStickyToggleButton.js';
import BooleanRectangularToggleButton from '../buttons/BooleanRectangularToggleButton.js';
import HTMLPushButton from '../buttons/HTMLPushButton.js';
import RadioButtonGroup from '../buttons/RadioButtonGroup.js';
import RectangularButtonView from '../buttons/RectangularButtonView.js';
import RectangularMomentaryButton from '../buttons/RectangularMomentaryButton.js';
import RectangularPushButton from '../buttons/RectangularPushButton.js';
import RoundButtonView from '../buttons/RoundButtonView.js';
import RoundMomentaryButton from '../buttons/RoundMomentaryButton.js';
import RoundPushButton from '../buttons/RoundPushButton.js';
import RoundStickyToggleButton from '../buttons/RoundStickyToggleButton.js';
import Panel from '../Panel.js';
import sun from '../sun.js';
import VerticalAquaRadioButtonGroup from '../VerticalAquaRadioButtonGroup.js';

// constants
const BUTTON_FONT = new Font( { size: 24 } );
const BUTTON_CAPTION_FONT = new Font( { size: 20 } );

/**
 * @constructor
 */
function ButtonsScreenView() {

  ScreenView.call( this );

  // Message area, for outputting test messages
  const messagePrefix = 'Message: ';
  const messageText = new Text( messagePrefix, {
    font: new Font( { size: 20 } ),
    bottom: this.layoutBounds.height - 5,
    left: this.layoutBounds.minX + 10
  } );
  this.addChild( messageText );
  const message = function( text ) {
    messageText.text = messagePrefix + text;
  };

  //===================================================================================
  // Common colors
  //===================================================================================

  const alignBaseColor = new Property( new Color( 'red' ) );
  const roundBaseColor = new Property( new Color( 'blue' ) );
  const radioGroupBaseColor = new Property( 'green' );

  //===================================================================================
  // Radio buttons
  //===================================================================================

  const radioButtonProperty = new Property( 'TWO' );
  radioButtonProperty.lazyLink( function( value ) {
    message( 'Radio button ' + value + ' pressed' );
  } );
  const radioButtonContent = [
    { value: 'ONE', node: new Text( 'ONE', { font: new Font( { size: 32 } ) } ), label: new Text( 'one' ) }, // bigger than the others
    { value: 'TWO', node: new Text( 'TWO', { font: BUTTON_FONT } ), label: new Text( 'two' ) },
    { value: 'THREE', node: new Text( 'THREE', { font: BUTTON_FONT } ), label: new Text( 'three' ) },
    { value: '4', node: new Text( '4', { font: BUTTON_FONT } ), label: new Text( 'four' ) }
  ];
  const radioButtonGroup = new RadioButtonGroup( radioButtonProperty, radioButtonContent, {
    selectedLineWidth: 4,

    // change these to test various orientations and alignments
    orientation: 'vertical',
    buttonContentXAlign: 'left',
    buttonContentYAlign: 'center',

    baseColor: radioGroupBaseColor
  } );
  const radioButtonPanel = new Panel( radioButtonGroup, {
    stroke: 'black',
    left: this.layoutBounds.left + 15,
    top: this.layoutBounds.top + 15
  } );
  this.addChild( radioButtonPanel );


  //===================================================================================
  // Aqua Radio buttons
  //===================================================================================

  const firstOption = 'A';
  const verticalAquaProperty = new Property( firstOption );
  verticalAquaProperty.lazyLink( function( value ) {
    message( 'Aqua Radio Button ' + value + ' pressed' );
  } );
  const verticalAquaRadioButtons = new VerticalAquaRadioButtonGroup( verticalAquaProperty, [
    {
      value: firstOption,
      node: new Text( firstOption ),
      labelContent: firstOption
    }, {
      value: 'B',
      node: new Text( 'B' ),
      labelContent: 'B'
    }, {
      value: 'C',
      node: new Text( 'C' ),
      labelContent: 'C'
    }
  ] );

  this.addChild( new Panel( verticalAquaRadioButtons, {
    stroke: 'black',
    scale: 2,
    x: 900,
    y: 10
  } ) );

  // Different pattern for interactive descriptions when there is the presence of a visual heading
  const verticalAquaPropertyWithGroup = new Property( firstOption );
  verticalAquaProperty.lazyLink( function( value ) {
    message( 'Aqua Radio Button in group with heading' + value + ' pressed' );
  } );
  const radioButtonsString = 'Radio Buttons';
  const radioButtonsHeading = new Text( radioButtonsString, {
    tagName: 'h3',
    innerContent: radioButtonsString
  } );
  const verticalAquaRadioButtonsWithGroup = new VerticalAquaRadioButtonGroup( verticalAquaPropertyWithGroup, [
    {
      value: firstOption,
      node: new Text( firstOption ),
      labelContent: firstOption
    }, {
      value: 'B',
      node: new Text( 'B' ),
      labelContent: 'B'
    }, {
      value: 'C',
      node: new Text( 'C' ),
      labelContent: 'C'
    }
  ] );

  this.addChild( new Panel( new VBox( {
    children: [ radioButtonsHeading, verticalAquaRadioButtonsWithGroup ],
    align: 'left',
    spacing: 5
  } ), {
    stroke: 'black',
    scale: 2,
    right: this.layoutBounds.right - 20,
    top: verticalAquaRadioButtons.bottom + 100
  } ) );

  //===================================================================================
  // Pseudo-3D buttons A, B, C, D, E
  //===================================================================================

  let buttonAFireCount = 0;
  const buttonA = new RectangularPushButton( {
    content: new Text( '--- A ---', { font: BUTTON_FONT } ),
    listener: function() { message( 'Button A pressed ' + ( ++buttonAFireCount ) + 'x' ); },

    // demonstrate pointer areas, see https://github.com/phetsims/sun/issues/464
    touchAreaXDilation: 10,
    touchAreaYDilation: 10,
    mouseAreaXDilation: 5,
    mouseAreaYDilation: 5
  } );

  const buttonB = new RectangularPushButton( {
    content: new Text( '--- B ---', { font: BUTTON_FONT } ),
    listener: function() { message( 'Button B pressed' ); },
    baseColor: new Color( 250, 0, 0 )
  } );

  const buttonC = new RectangularPushButton( {
    content: new Text( '--- C ---', { font: BUTTON_FONT } ),
    listener: function() { message( 'Button C pressed' ); },
    baseColor: 'rgb( 204, 102, 204 )'
  } );

  // Test for a button with different radii for each corner
  const radiiTestButton = new RectangularPushButton( {
    baseColor: 'orange',
    minWidth: 50,
    minHeight: 50,
    leftTopCornerRadius: 20,
    rightTopCornerRadius: 10,
    rightBottomCornerRadius: 5,
    leftBottomCornerRadius: 0,
    listener: function() { message( 'Custom corner button pressed' ); }
  } );

  const buttonD = new RoundPushButton( {
    content: new Text( '--- D ---', { font: BUTTON_FONT } ),
    listener: function() { message( 'Button D pressed' ); },
    baseColor: roundBaseColor
  } );

  const buttonE = new RoundPushButton( {
    content: new Text( '--- E ---', { font: BUTTON_FONT } ),
    listener: function() { message( 'Button E pressed' ); },
    baseColor: 'yellow',

    // Demonstrate shifted pointer areas, https://github.com/phetsims/sun/issues/500
    touchAreaXShift: 20,
    touchAreaYShift: 20,
    mouseAreaXShift: 10,
    mouseAreaYShift: 10
  } );

  const pseudo3DButtonsBox = new HBox( {
    children: [ buttonA, buttonB, buttonC, radiiTestButton, buttonD, buttonE ],
    spacing: 10,
    left: radioButtonPanel.right + 25,
    top: this.layoutBounds.top + 15
  } );
  this.addChild( pseudo3DButtonsBox );

  //===================================================================================
  // Flat buttons labeled 1, 2, 3, 4
  //===================================================================================

  const button1 = new RectangularPushButton( {
    content: new Text( '-- 1 --', { font: BUTTON_FONT } ),
    listener: function() { message( 'Button 1 pressed' ); },
    baseColor: 'rgb( 204, 102, 204 )',
    buttonAppearanceStrategy: RectangularButtonView.FlatAppearanceStrategy
  } );

  const button2 = new RectangularPushButton( {
    content: new Text( '-- 2 --', { font: BUTTON_FONT } ),
    listener: function() { message( 'Button 2 pressed' ); },
    baseColor: '#A0D022',
    buttonAppearanceStrategy: RectangularButtonView.FlatAppearanceStrategy,
    lineWidth: 1,
    stroke: '#202020'
  } );

  const button3 = new RoundPushButton( {
    content: new Text( '- 3 -', { font: BUTTON_FONT } ),
    listener: function() { message( 'Button 3 pressed ' ); },
    buttonAppearanceStrategy: RoundButtonView.FlatAppearanceStrategy
  } );

  const button4 = new RoundPushButton( {
    content: new Text( '-- 4 --', { font: BUTTON_FONT, fill: 'white' } ),
    listener: function() { message( 'Button 4 pressed ' ); },
    baseColor: '#CC3300',
    buttonAppearanceStrategy: RoundButtonView.FlatAppearanceStrategy
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
    listener: function() { message( 'Fire button pressed' ); },
    baseColor: 'orange',
    stroke: 'black',
    lineWidth: 0.5
  } );

  const goButton = new RoundPushButton( {
    content: new Text( 'Go!', { font: BUTTON_FONT } ),
    listener: function() { message( 'Go button pressed' ); },
    baseColor: new Color( 0, 163, 0 ),
    minXPadding: 10
  } );

  const helpButton = new RoundPushButton( {
    content: new Text( 'Help', { font: BUTTON_FONT } ),
    listener: function() { message( 'Help button pressed' ); },
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

  let fireOnHeldCount = 0;
  const fireQuicklyWhenHeldButton = new RectangularPushButton( {
    content: new Text( 'Press and hold to test (fast fire)', { font: BUTTON_CAPTION_FONT } ),
    listener: function() { message( 'Fast held button fired ' + ( ++fireOnHeldCount ) + 'x' ); },
    baseColor: new Color( 114, 132, 62 ),
    fireOnHold: true,
    fireOnHoldDelay: 100,
    fireOnHoldInterval: 50
  } );

  let fireSlowlyOnHoldCount = 0;
  const fireSlowlyWhenHeldButton = new RectangularPushButton( {
    content: new Text( 'Press and hold to test (slow fire)', { font: BUTTON_CAPTION_FONT } ),
    listener: function() { message( 'Slow held button fired ' + ( ++fireSlowlyOnHoldCount ) + 'x' ); },
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

  const upperLeftAlignTextNode = new Text( 'upper left align test', { font: BUTTON_CAPTION_FONT } );
  const upperLeftContentButton = new RectangularPushButton( {
    content: upperLeftAlignTextNode,
    listener: function() { message( 'Upper left alignment button fired ' ); },
    baseColor: alignBaseColor,
    xAlign: 'left',
    yAlign: 'top',
    minWidth: upperLeftAlignTextNode.width * 1.5,
    minHeight: upperLeftAlignTextNode.height * 2
  } );

  const lowerRightAlignTextNode = new Text( 'lower right align test', { font: BUTTON_CAPTION_FONT } );
  const lowerRightContentButton = new RectangularPushButton( {
    content: lowerRightAlignTextNode,
    listener: function() { message( 'Lower right alignment button fired ' ); },
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

  let fireOnDownCount = 0;
  const fireOnDownButton = new RectangularPushButton( {
    content: new Text( 'Fire on Down Button', { font: BUTTON_FONT } ),
    listener: function() { message( 'Fire on down button pressed ' + ( ++fireOnDownCount ) + 'x' ); },
    baseColor: new Color( 255, 255, 61 ),
    fireOnDown: true,
    stroke: 'black',
    lineWidth: 1
  } );

  const htmlButton = new HTMLPushButton( 'HTML <em>button</em> <b>example</b>', {
    listener: function() { message( 'HTML button pressed' ); },
    baseColor: new Color( 64, 225, 0 )
  } );

  // transparent button with something behind it
  const rectangleNode = new Rectangle( 0, 0, 25, 50, { fill: 'red' } );
  const transparentButton = new RectangularPushButton( {
    content: new Text( 'Transparent Button', { font: BUTTON_FONT } ),
    listener: function() { message( 'Transparent button pressed' ); },
    baseColor: new Color( 255, 255, 0, 0.7 ),
    disabledBaseColor: new Color( 192, 192, 192, 0.7 ),
    center: rectangleNode.center
  } );
  const transparentParent = new Node( { children: [ rectangleNode, transparentButton ] } );

  const arrowButton = new ArrowButton( 'left', function() { message( 'ArrowButton pressed' ); } );

  const miscButtonsBox = new VBox( {
    children: [ fireOnDownButton, htmlButton, transparentParent, arrowButton ],
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
  roundToggleButtonProperty.lazyLink( function( value ) {
    message( 'Round sticky toggle button state changed to: ' + value );
  } );
  const roundStickyToggleButton = new RoundStickyToggleButton( 'off', 'on', roundToggleButtonProperty, {
    baseColor: new Color( 255, 0, 0 )
  } );

  const rectangularToggleButtonProperty = new Property( false );
  rectangularToggleButtonProperty.lazyLink( function( value ) {
    message( 'Rectangular sticky toggle button state changed to: ' + value );
  } );
  const booleanRectangularStickyToggleButton = new BooleanRectangularStickyToggleButton( rectangularToggleButtonProperty, {
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
  const roundOnProperty = new Property( false );
  roundOnProperty.lazyLink( function( on ) { message( 'RoundMomentaryButton on=' + on ); } );
  const roundMomentaryButton = new RoundMomentaryButton( false, true, roundOnProperty, {
    baseColor: '#D76958',
    left: roundStickyToggleButton.right + 10,
    centerY: roundStickyToggleButton.centerY
  } );

  // rectangular
  const rectangularOnProperty = new Property( false );
  rectangularOnProperty.lazyLink( function( on ) { message( 'RectangularMomentaryButton on=' + on ); } );
  const rectangularMomentaryButton = new RectangularMomentaryButton( false, true, rectangularOnProperty, {
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
  // Enable/Disable buttons
  //===================================================================================

  //TODO https://github.com/phetsims/sun/issues/554 Shouldn't all of these buttons be able to observe buttonEnabledProperty?
  // Set up a property for testing button enable/disable.
  const buttonsEnabledProperty = new Property( true );
  buttonsEnabledProperty.link( function( enabled ) {
    arrowButton.enabled = enabled;
    radioButtonGroup.enabled = enabled;
    verticalAquaRadioButtons.children.forEach( function( radioButton ) {radioButton.enabled = enabled;} );
    buttonA.enabled = enabled;
    buttonB.enabled = enabled;
    buttonC.enabled = enabled;
    buttonD.enabled = enabled;
    buttonE.enabled = enabled;
    button1.enabled = enabled;
    button2.enabled = enabled;
    button3.enabled = enabled;
    button4.enabled = enabled;
    fireButton.enabled = enabled;
    goButton.enabled = enabled;
    helpButton.enabled = enabled;
    fireOnDownButton.enabled = enabled;
    htmlButton.enabled = enabled;
    transparentButton.enabled = enabled;
    roundStickyToggleButton.enabled = enabled;
    booleanRectangularStickyToggleButton.enabled = enabled;
    fireQuicklyWhenHeldButton.enabled = enabled;
    fireSlowlyWhenHeldButton.enabled = enabled;
    upperLeftContentButton.enabled = enabled;
    lowerRightContentButton.enabled = enabled;
    rectangularMomentaryButton.enabled = enabled;
    roundMomentaryButton.enabled = enabled;
  } );

  const disableEnableButton = new BooleanRectangularToggleButton(
    new Text( 'Disable Buttons', { font: BUTTON_CAPTION_FONT } ),
    new Text( 'Enable Buttons', { font: BUTTON_CAPTION_FONT } ),
    buttonsEnabledProperty, {
      baseColor: new Color( 204, 255, 51 ),
      right: this.layoutBounds.right - 40,
      bottom: this.layoutBounds.bottom - 40
    }
  );
  this.addChild( disableEnableButton );

  // Add a button to set alternative color scheme.
  const changeButtonColorsButton = new RectangularPushButton( {
      content: new Text( 'Change Some Button Colors', { font: BUTTON_CAPTION_FONT } ),
      listener: function() {

        /* eslint-disable bad-sim-text */
        buttonA.baseColor = new Color( _.random( 0, 255 ), _.random( 0, 255 ), _.random( 0, 255 ) );
        buttonD.baseColor = new Color( _.random( 0, 255 ), _.random( 0, 255 ), _.random( 0, 255 ) );
        button1.baseColor = new Color( _.random( 0, 255 ), _.random( 0, 255 ), _.random( 0, 255 ) );
        button3.baseColor = new Color( _.random( 0, 255 ), _.random( 0, 255 ), _.random( 0, 255 ) );

        alignBaseColor.value = new Color( _.random( 0, 255 ), _.random( 0, 255 ), _.random( 0, 255 ) );
        radioGroupBaseColor.value = new Color( _.random( 0, 255 ), _.random( 0, 255 ), _.random( 0, 255 ) );
        roundBaseColor.value = new Color( _.random( 0, 255 ), _.random( 0, 255 ), _.random( 0, 255 ) );
        /* eslint-enable bad-sim-text */

        message( 'Button colors changed' );
      },
      right: disableEnableButton.right,
      bottom: disableEnableButton.top - 15,

      // Demonstrate shifted pointer areas, https://github.com/phetsims/sun/issues/500
      touchAreaXShift: -20,
      touchAreaYShift: -20,
      mouseAreaXShift: -10,
      mouseAreaYShift: -10
    }
  );
  this.addChild( changeButtonColorsButton );
}

sun.register( 'ButtonsScreenView', ButtonsScreenView );

inherit( ScreenView, ButtonsScreenView );
export default ButtonsScreenView;