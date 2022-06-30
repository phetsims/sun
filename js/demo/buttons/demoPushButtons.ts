// Copyright 2014-2022, University of Colorado Boulder

/**
 * Demo for various push buttons.
 *
 * @author various contributors
 */

import Checkbox from '../../Checkbox.js';
import RectangularPushButton from '../../buttons/RectangularPushButton.js';
import RoundPushButton from '../../buttons/RoundPushButton.js';
import ButtonNode from '../../buttons/ButtonNode.js';
import ArrowButton from '../../buttons/ArrowButton.js';
import CarouselButton from '../../buttons/CarouselButton.js';
import { Circle, Color, Font, HBox, Node, Rectangle, Text, VBox, VStrut } from '../../../../scenery/js/imports.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';

const BUTTON_FONT = new Font( { size: 16 } );

export default function demoPushButtons( layoutBounds: Bounds2 ): Node {

  // For enabling/disabling all buttons
  const buttonsEnabledProperty = new Property( true );
  const buttonsEnabledCheckbox = new Checkbox( buttonsEnabledProperty, new Text( 'buttons enabled', {
    font: new Font( { size: 20 } )
  } ) );

  //===================================================================================
  // Pseudo-3D buttons A, B, C, D, E
  //===================================================================================

  const buttonA = new RectangularPushButton( {
    content: new Text( '--- A ---', { font: BUTTON_FONT } ),
    listener: () => console.log( 'buttonA fired' ),
    enabledProperty: buttonsEnabledProperty,

    // demonstrate pointer areas, see https://github.com/phetsims/sun/issues/464
    touchAreaXDilation: 10,
    touchAreaYDilation: 10,
    mouseAreaXDilation: 5,
    mouseAreaYDilation: 5
  } );

  const buttonB = new RectangularPushButton( {
    content: new Text( '--- B ---', { font: BUTTON_FONT } ),
    listener: () => console.log( 'buttonB fired' ),
    baseColor: new Color( 250, 0, 0 ),
    enabledProperty: buttonsEnabledProperty
  } );

  const buttonC = new RectangularPushButton( {
    content: new Text( '--- C ---', { font: BUTTON_FONT } ),
    listener: () => console.log( 'buttonC fired' ),
    baseColor: 'rgb( 204, 102, 204 )',
    enabledProperty: buttonsEnabledProperty
  } );

  const buttonD = new RoundPushButton( {
    content: new Text( '--- D ---', { font: BUTTON_FONT } ),
    listener: () => console.log( 'buttonD fired' ),
    enabledProperty: buttonsEnabledProperty,
    radius: 30,
    lineWidth: 20 // a thick stroke, to test pointer areas and focus highlight
  } );

  const buttonE = new RoundPushButton( {
    content: new Text( '--- E ---', { font: BUTTON_FONT } ),
    listener: () => console.log( 'buttonE fired' ),
    baseColor: 'yellow',
    enabledProperty: buttonsEnabledProperty,

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
    enabledProperty: buttonsEnabledProperty,
    xMargin: 20,
    yMargin: 20,
    xContentOffset: 8,
    yContentOffset: 15
  } );

  // Test for a button with different radii for each corner
  const customCornersButton = new RectangularPushButton( {
    baseColor: 'orange',
    enabledProperty: buttonsEnabledProperty,
    size: new Dimension2( 50, 50 ),
    leftTopCornerRadius: 20,
    rightTopCornerRadius: 10,
    rightBottomCornerRadius: 5,
    leftBottomCornerRadius: 0,
    listener: () => console.log( 'customCornersButton fired' )
  } );

  const pseudo3DButtonsBox = new HBox( {
    children: [ buttonA, buttonB, buttonC, buttonD, buttonE, buttonF, customCornersButton ],
    spacing: 10
  } );

  //===================================================================================
  // Flat buttons labeled 1, 2, 3, 4
  //===================================================================================

  const button1 = new RectangularPushButton( {
    content: new Text( '-- 1 --', { font: BUTTON_FONT } ),
    listener: () => console.log( 'button1 fired' ),
    baseColor: 'rgb( 204, 102, 204 )',
    enabledProperty: buttonsEnabledProperty,
    buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy
  } );

  const button2 = new RectangularPushButton( {
    content: new Text( '-- 2 --', { font: BUTTON_FONT } ),
    listener: () => console.log( 'button2 fired' ),
    baseColor: '#A0D022',
    enabledProperty: buttonsEnabledProperty,
    buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy,
    lineWidth: 1,
    stroke: '#202020'
  } );

  const button3 = new RoundPushButton( {
    content: new Text( '- 3 -', { font: BUTTON_FONT } ),
    listener: () => console.log( 'button3 fired' ),
    enabledProperty: buttonsEnabledProperty,
    buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy
  } );

  const button4 = new RoundPushButton( {
    content: new Text( '-- 4 --', { font: BUTTON_FONT, fill: 'white' } ),
    listener: () => console.log( 'button4 fired' ),
    baseColor: '#CC3300',
    enabledProperty: buttonsEnabledProperty,
    buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy
  } );

  const flatButtonsBox = new HBox( {
    children: [ button1, button2, button3, button4 ],
    spacing: 10
  } );

  //===================================================================================
  // Fire! Go! Help! buttons - these demonstrate more colors and sizes of buttons
  //===================================================================================

  const fireButton = new RoundPushButton( {
    content: new Text( 'Fire!', { font: BUTTON_FONT } ),
    listener: () => console.log( 'fireButton fired' ),
    enabledProperty: buttonsEnabledProperty,
    baseColor: 'orange',
    stroke: 'black',
    lineWidth: 0.5
  } );

  const goButton = new RoundPushButton( {
    content: new Text( 'Go!', { font: BUTTON_FONT } ),
    listener: () => console.log( 'goButton fired' ),
    baseColor: new Color( 0, 163, 0 ),
    enabledProperty: buttonsEnabledProperty
  } );

  const helpButton = new RoundPushButton( {
    content: new Text( 'Help', { font: BUTTON_FONT } ),
    listener: () => console.log( 'helpButton fired' ),
    baseColor: new Color( 244, 154, 194 ),
    enabledProperty: buttonsEnabledProperty
  } );

  const actionButtonsBox = new HBox( {
    children: [ fireButton, goButton, helpButton ],
    spacing: 15
  } );

  //===================================================================================
  // Buttons with fire-on-hold turned on
  //===================================================================================

  const fireQuicklyWhenHeldButton = new RectangularPushButton( {
    content: new Text( 'Press and hold to test (fast fire)', { font: BUTTON_FONT } ),
    listener: () => console.log( 'fireQuicklyWhenHeldButton fired' ),
    baseColor: new Color( 114, 132, 62 ),
    enabledProperty: buttonsEnabledProperty,
    fireOnHold: true,
    fireOnHoldDelay: 100,
    fireOnHoldInterval: 50
  } );

  const fireSlowlyWhenHeldButton = new RectangularPushButton( {
    content: new Text( 'Press and hold to test (slow fire)', { font: BUTTON_FONT } ),
    listener: () => console.log( 'fireSlowlyWhenHeldButton fired' ),
    baseColor: new Color( 147, 92, 120 ),
    enabledProperty: buttonsEnabledProperty,
    fireOnHold: true,
    fireOnHoldDelay: 600,
    fireOnHoldInterval: 300,
    top: fireQuicklyWhenHeldButton.bottom + 10
  } );

  const heldButtonsBox = new VBox( {
    children: [ fireQuicklyWhenHeldButton, fireSlowlyWhenHeldButton ],
    spacing: 10,
    align: 'left'
  } );

  const upperLeftAlignTextNode = new Text( 'upper left align test', { font: BUTTON_FONT } );
  const upperLeftContentButton = new RectangularPushButton( {
    content: upperLeftAlignTextNode,
    listener: () => console.log( 'upperLeftContentButton fired' ),
    enabledProperty: buttonsEnabledProperty,
    xAlign: 'left',
    yAlign: 'top',
    minWidth: upperLeftAlignTextNode.width * 1.5,
    minHeight: upperLeftAlignTextNode.height * 2
  } );

  const lowerRightAlignTextNode = new Text( 'lower right align test', { font: BUTTON_FONT } );
  const lowerRightContentButton = new RectangularPushButton( {
    content: lowerRightAlignTextNode,
    listener: () => console.log( 'lowerRightContentButton fired' ),
    enabledProperty: buttonsEnabledProperty,
    xAlign: 'right',
    yAlign: 'bottom',
    minWidth: lowerRightAlignTextNode.width * 1.5,
    minHeight: lowerRightAlignTextNode.height * 2,
    top: upperLeftContentButton.height + 10
  } );

  const alignTextButtonsBox = new VBox( {
    children: [ upperLeftContentButton, lowerRightContentButton ],
    spacing: 10,
    align: 'left'
  } );

  //===================================================================================
  // Miscellaneous other button examples
  //===================================================================================

  const fireOnDownButton = new RectangularPushButton( {
    content: new Text( 'Fire on Down', { font: BUTTON_FONT } ),
    listener: () => console.log( 'fireOnDownButton fired' ),
    baseColor: new Color( 255, 255, 61 ),
    enabledProperty: buttonsEnabledProperty,
    fireOnDown: true,
    stroke: 'black',
    lineWidth: 1
  } );

  // transparent button with something behind it
  const rectangleNode = new Rectangle( 0, 0, 25, 100, { fill: 'red' } );
  const transparentAlphaButton = new RectangularPushButton( {
    content: new Text( 'Transparent Button via alpha', { font: BUTTON_FONT } ),
    listener: () => console.log( 'transparentAlphaButton fired' ),
    baseColor: new Color( 255, 255, 0, 0.7 ),
    enabledProperty: buttonsEnabledProperty,
    centerX: rectangleNode.centerX,
    top: rectangleNode.top + 10
  } );
  const transparentOpacityButton = new RectangularPushButton( {
    content: new Text( 'Transparent Button via opacity', { font: BUTTON_FONT } ),
    listener: () => console.log( 'transparentOpacityButton fired' ),
    baseColor: new Color( 255, 255, 0 ),
    enabledProperty: buttonsEnabledProperty,
    opacity: 0.6,
    centerX: rectangleNode.centerX,
    bottom: rectangleNode.bottom - 10
  } );
  const transparentParent = new Node( { children: [ rectangleNode, transparentAlphaButton, transparentOpacityButton ] } );

  const arrowButton = new ArrowButton( 'left', () => console.log( 'arrowButton fired' ), {
    enabledProperty: buttonsEnabledProperty
  } );

  const carouselButton = new CarouselButton( {
    listener: () => console.log( 'carouselButton fired' ),
    enabledProperty: buttonsEnabledProperty
  } );

  const miscButtonsBox = new HBox( {
    children: [ fireOnDownButton, transparentParent, arrowButton, carouselButton ],
    spacing: 15
  } );

  //===================================================================================
  // Test the 2 ways of specifying a button's size:
  // (1) If you provide size of the button, content is sized to fit the button.
  // (2) If you don't provide size, the button is sized to fit the content.
  // See https://github.com/phetsims/sun/issues/657
  //===================================================================================

  // This button's stroke will look thicker, because content will be scaled up.
  const roundButtonWithExplicitSize = new RoundPushButton( {
    enabledProperty: buttonsEnabledProperty,
    radius: 25,
    content: new Circle( 5, { fill: 'red', stroke: 'black' } ),
    listener: () => console.log( 'roundButtonWithExplicitSize pressed' ),
    xMargin: 5,
    yMargin: 5
  } );

  // This button's content will look as specified, because button is sized to fit the content.
  const roundButtonWithDerivedSize = new RoundPushButton( {
    enabledProperty: buttonsEnabledProperty,
    content: new Circle( 20, { fill: 'red', stroke: 'black' } ),
    listener: () => console.log( 'roundButtonWithDerivedSize pressed' ),
    xMargin: 5,
    yMargin: 5
  } );

  // The total size of this one, should be the same as the content of the one below. This button's stroke will look
  // thicker, because content will be scaled up.
  const rectangularButtonWithExplicitSize = new RectangularPushButton( {
    enabledProperty: buttonsEnabledProperty,
    size: new Dimension2( 40, 25 ),
    content: new Rectangle( 0, 0, 5, 3, { fill: 'red', stroke: 'black' } ),
    listener: () => console.log( 'rectangularButtonWithExplicitSize pressed' ),
    xMargin: 5,
    yMargin: 5
  } );

  // This button's content will look as specified, because button is sized to fit around the content.
  const rectangularButtonWithDerivedSize = new RectangularPushButton( {
    enabledProperty: buttonsEnabledProperty,
    content: new Rectangle( 0, 0, 40, 25, { fill: 'blue', stroke: 'black' } ),
    listener: () => console.log( 'rectangularButtonWithDerivedSize pressed' ),
    xMargin: 5,
    yMargin: 5
  } );

  const buttonSizeDemos = new HBox( {
    spacing: 20,
    children: [ rectangularButtonWithExplicitSize,
      rectangularButtonWithDerivedSize,
      roundButtonWithExplicitSize,
      roundButtonWithDerivedSize
    ]
  } );

  //===================================================================================
  // Demonstrate dynamic colors for some buttons
  //===================================================================================

  // Change colors of all buttons in pseudo3DButtonsBox
  const changeButtonColorsButton = new RectangularPushButton( {
    enabledProperty: buttonsEnabledProperty,
    content: new Text( '\u21e6 Change button colors', { font: BUTTON_FONT } ),
    listener: () => {
      console.log( 'changeButtonColorsButton fired' );
      pseudo3DButtonsBox.children.forEach( child => {
        if ( child instanceof ButtonNode ) {
          child.baseColor = new Color(
            dotRandom.nextDoubleBetween( 0, 255 ),
            dotRandom.nextDoubleBetween( 0, 255 ),
            dotRandom.nextDoubleBetween( 0, 255 )
          );
        }
      } );
    }
  } );

  //===================================================================================
  // Layout
  //===================================================================================

  const xSpacing = 50;
  return new VBox( {
    spacing: 15,
    children: [
      new HBox( { spacing: xSpacing, children: [ pseudo3DButtonsBox, changeButtonColorsButton ] } ),
      new HBox( { spacing: xSpacing, children: [ flatButtonsBox, actionButtonsBox ] } ),
      new HBox( { spacing: xSpacing, children: [ heldButtonsBox, alignTextButtonsBox ] } ),
      miscButtonsBox,
      buttonSizeDemos,
      new VStrut( 25 ),
      buttonsEnabledCheckbox
    ],
    center: layoutBounds.center
  } );
}