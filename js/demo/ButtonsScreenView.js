// Copyright 2014-2020, University of Colorado Boulder

/**
 * Main ScreenView container for demonstrating and testing the various buttons.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Property from '../../../axon/js/Property.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
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
import RectangularRadioButtonGroup from '../buttons/RectangularRadioButtonGroup.js';
import RectangularMomentaryButton from '../buttons/RectangularMomentaryButton.js';
import RectangularPushButton from '../buttons/RectangularPushButton.js';
import RoundMomentaryButton from '../buttons/RoundMomentaryButton.js';
import RoundPushButton from '../buttons/RoundPushButton.js';
import RoundStickyToggleButton from '../buttons/RoundStickyToggleButton.js';
import Checkbox from '../Checkbox.js';
import Panel from '../Panel.js';
import sun from '../sun.js';
import VerticalAquaRadioButtonGroup from '../VerticalAquaRadioButtonGroup.js';

// constants
const BUTTON_FONT = new Font( { size: 24 } );
const BUTTON_CAPTION_FONT = new Font( { size: 20 } );

class ButtonsScreenView extends ScreenView {
  constructor() {

    super();

    // For enabling/disabling all buttons
    const buttonsEnabledProperty = new Property( true );

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
    const radioButtonGroup = new RectangularRadioButtonGroup( radioButtonProperty, radioButtonContent, {
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

    // Create and add an aqua radio button group in a panel with a heading.  In addition to demonstrating how the radio
    // button group behaves, this code is an example of how to make the heading and group show up in the PDOM.
    const verticalAquaProperty = new Property( 'A' );
    verticalAquaProperty.lazyLink( function( value ) {
      message( 'Aqua Radio Button ' + value + ' pressed' );
    } );
    const radioButtonsString = 'Radio Buttons';
    const radioButtonsHeading = new Text( radioButtonsString, {
      tagName: 'h3',
      innerContent: radioButtonsString
    } );
    const verticalAquaRadioButtonGroup = new VerticalAquaRadioButtonGroup( verticalAquaProperty, [
      {
        value: 'A',
        node: new Text( 'A' ),
        labelContent: 'A'
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
      children: [ radioButtonsHeading, verticalAquaRadioButtonGroup ],
      align: 'left',
      spacing: 5
    } ), {
      stroke: 'black',
      scale: 2,
      right: this.layoutBounds.right - 20,
      top: 100
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
      buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy
    } );

    const button2 = new RectangularPushButton( {
      content: new Text( '-- 2 --', { font: BUTTON_FONT } ),
      listener: function() { message( 'Button 2 pressed' ); },
      baseColor: '#A0D022',
      buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy,
      lineWidth: 1,
      stroke: '#202020'
    } );

    const button3 = new RoundPushButton( {
      content: new Text( '- 3 -', { font: BUTTON_FONT } ),
      listener: function() { message( 'Button 3 pressed ' ); },
      buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy
    } );

    const button4 = new RoundPushButton( {
      content: new Text( '-- 4 --', { font: BUTTON_FONT, fill: 'white' } ),
      listener: function() { message( 'Button 4 pressed ' ); },
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

    const arrowButton = new ArrowButton( 'left', function() { message( 'ArrowButton pressed' ); }, {
      enabledProperty: buttonsEnabledProperty
    } );

    const miscButtonsBox = new VBox( {
      children: [ fireOnDownButton, transparentParent, arrowButton ],
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
      message( 'RoundStickyToggleButton state changed to: ' + value );
    } );
    const roundStickyToggleButton = new RoundStickyToggleButton( 'off', 'on', roundToggleButtonProperty, {
      baseColor: new Color( 255, 0, 0 )
    } );

    const booleanRectangularToggleButtonProperty = new BooleanProperty( false );
    booleanRectangularToggleButtonProperty.lazyLink( function( value ) {
      message( 'BooleanRectangularStickyToggleButton state changed to: ' + value );
    } );
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
    // Demonstrate dynamic colors for some buttons
    //===================================================================================

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
      left: messageText.left,
      bottom: messageText.top - 15,

      // Demonstrate shifted pointer areas, https://github.com/phetsims/sun/issues/500
      touchAreaXShift: -20,
      touchAreaYShift: -20,
      mouseAreaXShift: -10,
      mouseAreaYShift: -10
    } );
    this.addChild( changeButtonColorsButton );

    //===================================================================================
    // Enable/Disable buttons
    //===================================================================================

    // For all of the button instances that do not use options.enabledProperty to observe
    // buttonsEnabledProperty directly, synchronize their enabled state here.
    buttonsEnabledProperty.link( enabled => {

      // radio button groups
      radioButtonGroup.enabled = enabled;
      verticalAquaRadioButtonGroup.enabled = enabled;

      // Test the enabledProperty ES5 getter for these buttons, see https://github.com/phetsims/sun/issues/515
      buttonA.enabledProperty.value = enabled;
      buttonB.enabledProperty.value = enabled;
      buttonC.enabledProperty.value = enabled;
      buttonD.enabledProperty.value = enabled;
      buttonE.enabledProperty.value = enabled;

      // Other buttons
      radiiTestButton.enabled = enabled;
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

    const buttonsEnabledCheckbox = new Checkbox( new Text( 'buttons enabled', { font: new PhetFont( 20 ) } ), buttonsEnabledProperty, {
      right: this.layoutBounds.right - 15,
      bottom: this.layoutBounds.bottom - 15
    } );
    this.addChild( buttonsEnabledCheckbox );
  }
}

sun.register( 'ButtonsScreenView', ButtonsScreenView );
export default ButtonsScreenView;