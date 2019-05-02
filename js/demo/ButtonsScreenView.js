// Copyright 2014-2019, University of Colorado Boulder
/* eslint-disable bad-sim-text */

/**
 * Main ScreenView container for demonstrating and testing the various buttons.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var ArrowButton = require( 'SUN/buttons/ArrowButton' );
  var BooleanRectangularStickyToggleButton = require( 'SUN/buttons/BooleanRectangularStickyToggleButton' );
  var BooleanRectangularToggleButton = require( 'SUN/buttons/BooleanRectangularToggleButton' );
  var Color = require( 'SCENERY/util/Color' );
  var Font = require( 'SCENERY/util/Font' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HTMLPushButton = require( 'SUN/buttons/HTMLPushButton' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var Property = require( 'AXON/Property' );
  var RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var RectangularButtonView = require( 'SUN/buttons/RectangularButtonView' );
  var RectangularMomentaryButton = require( 'SUN/buttons/RectangularMomentaryButton' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var RoundButtonView = require( 'SUN/buttons/RoundButtonView' );
  var RoundMomentaryButton = require( 'SUN/buttons/RoundMomentaryButton' );
  var RoundPushButton = require( 'SUN/buttons/RoundPushButton' );
  var RoundStickyToggleButton = require( 'SUN/buttons/RoundStickyToggleButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var sun = require( 'SUN/sun' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var VerticalAquaRadioButtonGroup = require( 'SUN/VerticalAquaRadioButtonGroup' );

  // constants
  var BUTTON_FONT = new Font( { size: 24 } );
  var BUTTON_CAPTION_FONT = new Font( { size: 20 } );

  /**
   * @constructor
   */
  function ButtonsScreenView() {

    ScreenView.call( this );

    // Message area, for outputting test messages
    var messagePrefix = 'Message: ';
    var messageText = new Text( messagePrefix, {
      font: new Font( { size: 20 } ),
      bottom: this.layoutBounds.height - 5,
      left: this.layoutBounds.minX + 10
    } );
    this.addChild( messageText );
    var message = function( text ) {
      messageText.text = messagePrefix + text;
    };

    //===================================================================================
    // Common colors
    //===================================================================================

    var alignBaseColor = new Property( new Color( 'red' ) );
    var roundBaseColor = new Property( new Color( 'blue' ) );
    var radioGroupBaseColor = new Property( 'green' );

    //===================================================================================
    // Radio buttons
    //===================================================================================

    var radioButtonProperty = new Property( 'TWO' );
    radioButtonProperty.lazyLink( function( value ) {
      message( 'Radio button ' + value + ' pressed' );
    } );
    var radioButtonContent = [
      { value: 'ONE', node: new Text( 'ONE', { font: new Font( { size: 32 } ) } ), label: new Text( 'one' ) }, // bigger than the others
      { value: 'TWO', node: new Text( 'TWO', { font: BUTTON_FONT } ), label: new Text( 'two' ) },
      { value: 'THREE', node: new Text( 'THREE', { font: BUTTON_FONT } ), label: new Text( 'three' ) },
      { value: '4', node: new Text( '4', { font: BUTTON_FONT } ), label: new Text( 'four' ) }
    ];
    var radioButtonGroup = new RadioButtonGroup( radioButtonProperty, radioButtonContent, {
      selectedLineWidth: 4,

      // change these to test various orientations and alignments
      orientation: 'vertical',
      buttonContentXAlign: 'left',
      buttonContentYAlign: 'center',

      baseColor: radioGroupBaseColor
    } );
    var radioButtonPanel = new Panel( radioButtonGroup, {
      stroke: 'black',
      left: this.layoutBounds.left + 15,
      top: this.layoutBounds.top + 15
    } );
    this.addChild( radioButtonPanel );


    //===================================================================================
    // Aqua Radio buttons
    //===================================================================================

    var firstOption = 'A';
    var verticalAquaProperty = new Property( firstOption );
    verticalAquaProperty.lazyLink( function( value ) {
      message( 'Aqua Radio Button ' + value + ' pressed' );
    } );
    var verticalAquaRadioButtons = new VerticalAquaRadioButtonGroup( [
      {
        property: verticalAquaProperty,
        value: firstOption,
        node: new Text( firstOption )
      }, {
        property: verticalAquaProperty,
        value: 'B',
        node: new Text( 'B' )
      }, {
        property: verticalAquaProperty,
        value: 'C',
        node: new Text( 'C' )
      }
    ] );

    this.addChild( new Panel( verticalAquaRadioButtons, {
      stroke: 'black',
      scale: 2,
      x: 900,
      y: 10
    } ) );

    //===================================================================================
    // Pseudo-3D buttons A, B, C, D, E
    //===================================================================================

    var buttonAFireCount = 0;
    var buttonA = new RectangularPushButton( {
      content: new Text( '--- A ---', { font: BUTTON_FONT } ),
      listener: function() { message( 'Button A pressed ' + ( ++buttonAFireCount ) + 'x' ); },
      
      // demonstrate pointer areas, see https://github.com/phetsims/sun/issues/464
      touchAreaXDilation: 10,
      touchAreaYDilation: 10,
      mouseAreaXDilation: 5,
      mouseAreaYDilation: 5
    } );

    var buttonB = new RectangularPushButton( {
      content: new Text( '--- B ---', { font: BUTTON_FONT } ),
      listener: function() { message( 'Button B pressed' ); },
      baseColor: new Color( 250, 0, 0 )
    } );

    var buttonC = new RectangularPushButton( {
      content: new Text( '--- C ---', { font: BUTTON_FONT } ),
      listener: function() { message( 'Button C pressed' ); },
      baseColor: 'rgb( 204, 102, 204 )'
    } );

    // Test for a button with different radii for each corner
    var radiiTestButton = new RectangularPushButton( {
      baseColor: 'orange',
      minWidth: 50,
      minHeight: 50,
      leftTopCornerRadius: 20,
      rightTopCornerRadius: 10,
      rightBottomCornerRadius: 5,
      leftBottomCornerRadius: 0,
      listener: function() { message( 'Custom corner button pressed' ); }
    } );

    var buttonD = new RoundPushButton( {
      content: new Text( '--- D ---', { font: BUTTON_FONT } ),
      listener: function() { message( 'Button D pressed' ); },
      baseColor: roundBaseColor
    } );

    var buttonE = new RoundPushButton( {
      content: new Text( '--- E ---', { font: BUTTON_FONT } ),
      listener: function() { message( 'Button E pressed' ); },
      baseColor: 'yellow',

      // Demonstrate shifted pointer areas, https://github.com/phetsims/sun/issues/500
      touchAreaXShift: 20,
      touchAreaYShift: 20,
      mouseAreaXShift: 10,
      mouseAreaYShift: 10
    } );

    var pseudo3DButtonsBox = new HBox( {
      children: [ buttonA, buttonB, buttonC, radiiTestButton, buttonD, buttonE ],
      spacing: 10,
      left: radioButtonPanel.right + 25,
      top: this.layoutBounds.top + 15
    } );
    this.addChild( pseudo3DButtonsBox );

    //===================================================================================
    // Flat buttons labeled 1, 2, 3, 4
    //===================================================================================

    var button1 = new RectangularPushButton( {
      content: new Text( '-- 1 --', { font: BUTTON_FONT } ),
      listener: function() { message( 'Button 1 pressed' ); },
      baseColor: 'rgb( 204, 102, 204 )',
      buttonAppearanceStrategy: RectangularButtonView.FlatAppearanceStrategy
    } );

    var button2 = new RectangularPushButton( {
      content: new Text( '-- 2 --', { font: BUTTON_FONT } ),
      listener: function() { message( 'Button 2 pressed' ); },
      baseColor: '#A0D022',
      buttonAppearanceStrategy: RectangularButtonView.FlatAppearanceStrategy,
      lineWidth: 1,
      stroke: '#202020'
    } );

    var button3 = new RoundPushButton( {
      content: new Text( '- 3 -', { font: BUTTON_FONT } ),
      listener: function() { message( 'Button 3 pressed ' ); },
      buttonAppearanceStrategy: RoundButtonView.FlatAppearanceStrategy
    } );

    var button4 = new RoundPushButton( {
      content: new Text( '-- 4 --', { font: BUTTON_FONT, fill: 'white' } ),
      listener: function() { message( 'Button 4 pressed ' ); },
      baseColor: '#CC3300',
      buttonAppearanceStrategy: RoundButtonView.FlatAppearanceStrategy
    } );

    var flatButtonsBox = new HBox( {
      children: [ button1, button2, button3, button4 ],
      spacing: 10,
      left: pseudo3DButtonsBox.left,
      top: pseudo3DButtonsBox.bottom + 30
    } );
    this.addChild( flatButtonsBox );

    //===================================================================================
    // Fire! Go! Help! buttons - these demonstrate more colors and sizes of buttons
    //===================================================================================

    var fireButton = new RoundPushButton( {
      content: new Text( 'Fire!', { font: BUTTON_FONT } ),
      listener: function() { message( 'Fire button pressed' ); },
      baseColor: 'orange',
      stroke: 'black',
      lineWidth: 0.5
    } );

    var goButton = new RoundPushButton( {
      content: new Text( 'Go!', { font: BUTTON_FONT } ),
      listener: function() { message( 'Go button pressed' ); },
      baseColor: new Color( 0, 163, 0 ),
      minXPadding: 10
    } );

    var helpButton = new RoundPushButton( {
      content: new Text( 'Help', { font: BUTTON_FONT } ),
      listener: function() { message( 'Help button pressed' ); },
      baseColor: new Color( 244, 154, 194 ),
      minXPadding: 10
    } );

    var actionButtonsBox = new HBox( {
      children: [ fireButton, goButton, helpButton ],
      spacing: 15,
      left: flatButtonsBox.left,
      top: flatButtonsBox.bottom + 25
    } );
    this.addChild( actionButtonsBox );

    //===================================================================================
    // Buttons with fire-on-hold turned on
    //===================================================================================

    var fireOnHeldCount = 0;
    var fireQuicklyWhenHeldButton = new RectangularPushButton( {
      content: new Text( 'Press and hold to test (fast fire)', { font: BUTTON_CAPTION_FONT } ),
      listener: function() { message( 'Fast held button fired ' + ( ++fireOnHeldCount ) + 'x' ); },
      baseColor: new Color( 114, 132, 62 ),
      fireOnHold: true,
      fireOnHoldDelay: 100,
      fireOnHoldInterval: 50
    } );

    var fireSlowlyOnHoldCount = 0;
    var fireSlowlyWhenHeldButton = new RectangularPushButton( {
      content: new Text( 'Press and hold to test (slow fire)', { font: BUTTON_CAPTION_FONT } ),
      listener: function() { message( 'Slow held button fired ' + ( ++fireSlowlyOnHoldCount ) + 'x' ); },
      baseColor: new Color( 147, 92, 120 ),
      fireOnHold: true,
      fireOnHoldDelay: 600,
      fireOnHoldInterval: 300,
      top: fireQuicklyWhenHeldButton.bottom + 10
    } );

    var heldButtonsBox = new VBox( {
      children: [ fireQuicklyWhenHeldButton, fireSlowlyWhenHeldButton ],
      spacing: 10,
      align: 'left',
      left: flatButtonsBox.right + 20,
      top: flatButtonsBox.top
    } );
    this.addChild( heldButtonsBox );

    var upperLeftAlignTextNode = new Text( 'upper left align test', { font: BUTTON_CAPTION_FONT } );
    var upperLeftContentButton = new RectangularPushButton( {
      content: upperLeftAlignTextNode,
      listener: function() { message( 'Upper left alignment button fired ' ); },
      baseColor: alignBaseColor,
      xAlign: 'left',
      yAlign: 'top',
      minWidth: upperLeftAlignTextNode.width * 1.5,
      minHeight: upperLeftAlignTextNode.height * 2
    } );

    var lowerRightAlignTextNode = new Text( 'lower right align test', { font: BUTTON_CAPTION_FONT } );
    var lowerRightContentButton = new RectangularPushButton( {
      content: lowerRightAlignTextNode,
      listener: function() { message( 'Lower right alignment button fired ' ); },
      baseColor: alignBaseColor,
      xAlign: 'right',
      yAlign: 'bottom',
      minWidth: lowerRightAlignTextNode.width * 1.5,
      minHeight: lowerRightAlignTextNode.height * 2,
      top: upperLeftContentButton.height + 10
    } );

    var alignTextButtonsBox = new VBox( {
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

    var fireOnDownCount = 0;
    var fireOnDownButton = new RectangularPushButton( {
      content: new Text( 'Fire on Down Button', { font: BUTTON_FONT } ),
      listener: function() { message( 'Fire on down button pressed ' + ( ++fireOnDownCount ) + 'x' ); },
      baseColor: new Color( 255, 255, 61 ),
      fireOnDown: true,
      stroke: 'black',
      lineWidth: 1
    } );

    var htmlButton = new HTMLPushButton( 'HTML <em>button</em> <b>example</b>', {
      listener: function() { message( 'HTML button pressed' ); },
      baseColor: new Color( 64, 225, 0 )
    } );

    // transparent button with something behind it
    // TODO: this isn't transparent when disabled.
    var rectangleNode = new Rectangle( 0, 0, 25, 50, { fill: 'red' } );
    var transparentButton = new RectangularPushButton( {
      content: new Text( 'Transparent Button', { font: BUTTON_FONT } ),
      listener: function() { message( 'Transparent button pressed' ); },
      baseColor: new Color( 255, 255, 0, 0.7 ),
      center: rectangleNode.center
    } );
    var transparentParent = new Node( { children: [ rectangleNode, transparentButton ] } );

    var arrowButton = new ArrowButton( 'left', function() { message( 'ArrowButton pressed' ); } );

    var miscButtonsBox = new VBox( {
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
    var roundToggleButtonProperty = new Property( 'off' );
    roundToggleButtonProperty.lazyLink( function( value ) {
      message( 'Round sticky toggle button state changed to: ' + value );
    } );
    var roundStickyToggleButton = new RoundStickyToggleButton( 'off', 'on', roundToggleButtonProperty, {
      baseColor: new Color( 255, 0, 0 )
    } );

    var rectangularToggleButtonProperty = new Property( false );
    rectangularToggleButtonProperty.lazyLink( function( value ) {
      message( 'Rectangular sticky toggle button state changed to: ' + value );
    } );
    var booleanRectangularStickyToggleButton = new BooleanRectangularStickyToggleButton( rectangularToggleButtonProperty, {
      baseColor: new Color( 0, 200, 200 ),
      centerX: roundStickyToggleButton.centerX,
      top: roundStickyToggleButton.bottom + 10,
      minWidth: 50,
      minHeight: 35
    } );

    var toggleButtonsBox = new VBox( {
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
    var roundOnProperty = new Property( false );
    roundOnProperty.lazyLink( function( on ) { message( 'RoundMomentaryButton on=' + on ); } );
    var roundMomentaryButton = new RoundMomentaryButton( false, true, roundOnProperty, {
      baseColor: '#D76958',
      left: roundStickyToggleButton.right + 10,
      centerY: roundStickyToggleButton.centerY
    } );

    // rectangular
    var rectangularOnProperty = new Property( false );
    rectangularOnProperty.lazyLink( function( on ) { message( 'RectangularMomentaryButton on=' + on ); } );
    var rectangularMomentaryButton = new RectangularMomentaryButton( false, true, rectangularOnProperty, {
      baseColor: '#724C35',
      minWidth: 50,
      minHeight: 40,
      centerX: roundMomentaryButton.centerX,
      top: roundMomentaryButton.bottom + 10
    } );

    var momentaryButtonsBox = new VBox( {
      children: [ roundMomentaryButton, rectangularMomentaryButton ],
      spacing: 15,
      left: toggleButtonsBox.right + 25,
      top: toggleButtonsBox.top
    } );
    this.addChild( momentaryButtonsBox );

    //===================================================================================
    // Enable/Disable buttons
    //===================================================================================

    //TODO Shouldn't all of these buttons be able to observe buttonEnabledProperty?
    // Set up a property for testing button enable/disable.
    var buttonsEnabledProperty = new Property( true );
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
    var disableEnableButton = new BooleanRectangularToggleButton(
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
    var changeButtonColorsButton = new RectangularPushButton( {
        content: new Text( 'Change Some Button Colors', { font: BUTTON_CAPTION_FONT } ),
        listener: function() {
          buttonA.baseColor = new Color( _.random( 0, 255 ), _.random( 0, 255 ), _.random( 0, 255 ) );
          buttonD.baseColor = new Color( _.random( 0, 255 ), _.random( 0, 255 ), _.random( 0, 255 ) );
          button1.baseColor = new Color( _.random( 0, 255 ), _.random( 0, 255 ), _.random( 0, 255 ) );
          button3.baseColor = new Color( _.random( 0, 255 ), _.random( 0, 255 ), _.random( 0, 255 ) );

          alignBaseColor.value = new Color( _.random( 0, 255 ), _.random( 0, 255 ), _.random( 0, 255 ) );
          radioGroupBaseColor.value = new Color( _.random( 0, 255 ), _.random( 0, 255 ), _.random( 0, 255 ) );
          roundBaseColor.value = new Color( _.random( 0, 255 ), _.random( 0, 255 ), _.random( 0, 255 ) );

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

  return inherit( ScreenView, ButtonsScreenView );
} );
