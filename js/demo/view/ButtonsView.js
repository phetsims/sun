// Copyright 2002-2014, University of Colorado Boulder

/**
 * Main ScreenView container for Buttons portion of the UI component demo.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var OutsideBackgroundNode = require( 'SCENERY_PHET/OutsideBackgroundNode' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var RectangularPushButton = require( 'SUN/experimental/buttons/RectangularPushButton' );
  var BooleanRectangularStickyToggleButton = require( 'SUN/experimental/buttons/BooleanRectangularStickyToggleButton' );
  var RefreshButton = require( 'SUN/experimental/buttons/RefreshButton' );
  var ResetAllButtonDeprecated = require( 'SCENERY_PHET/ResetAllButtonDeprecated' );
  var ResetAllButton = require( 'SUN/experimental/buttons/ResetAllButton' );
  var ReturnToLevelSelectButton = require( 'SUN/experimental/buttons/ReturnToLevelSelectButton' );
  var RoundPushButton = require( 'SUN/experimental/buttons/RoundPushButton' );
  var RoundStickyToggleButton = require( 'SUN/experimental/buttons/RoundStickyToggleButton' );
  var InOutRadioButton = require( 'SUN/experimental/buttons/InOutRadioButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var SoundToggleButton = require( 'SUN/experimental/buttons/SoundToggleButton' );
  var Text = require( 'SCENERY/nodes/Text' );
  var TimerToggleButton = require( 'SUN/experimental/buttons/TimerToggleButton' );
  var BooleanRectangularToggleButtonWithContent = require( 'SUN/experimental/buttons/BooleanRectangularToggleButton' );

  // Constants
  var BUTTON_FONT = new PhetFont( { size: 20 } );
  var BUTTON_CAPTION_FONT = new PhetFont( { size: 16 } );

  function ButtonsView() {
    ScreenView.call( this, { renderer: 'svg' } );

    // background
    this.addChild( new OutsideBackgroundNode( this.layoutBounds.centerX, this.layoutBounds.centerY + 20, this.layoutBounds.width * 3, this.layoutBounds.height, this.layoutBounds.height ) );
    // Set up a property for testing button enable/disable.
    var buttonsEnabled = new Property( true );

    // convenience vars for layout
    var rightEdge = this.layoutBounds.width * 0.6;
    var buttonSpacing = 10;

    // Text area for outputting test information
    var outputText = new Text( '(output text)', { font: new PhetFont( 16 ), bottom: this.layoutBounds.height - 5, left: this.layoutBounds.minX + 10  } );
    this.addChild( outputText );

    // add refresh button and caption
    var refreshButton = new RefreshButton(
      {
        listener: function() { outputText.text = 'Refresh pressed'; },
        right: rightEdge,
        top: 10
      } );
    this.addChild( refreshButton );
    var refreshButtonLabel = new Text( 'Refresh Button: ', { font: BUTTON_CAPTION_FONT, right: refreshButton.left - 5, centerY: refreshButton.centerY } );
    this.addChild( refreshButtonLabel );

    // add return to level select button and caption
    var returnToLevelSelectButton = new ReturnToLevelSelectButton(
      {
        listener: function() { outputText.text = 'Return to level select pressed'; },
        centerX: refreshButton.centerX,
        top: refreshButton.bottom + buttonSpacing
      } );
    this.addChild( returnToLevelSelectButton );
    var returnToLevelSelectButtonLabel = new Text( 'Return to Level Selection Button: ', { font: BUTTON_CAPTION_FONT, right: returnToLevelSelectButton.left - 5, centerY: returnToLevelSelectButton.centerY } );
    this.addChild( returnToLevelSelectButtonLabel );

    // add sound toggle button
    var soundEnabled = new Property( true );
    var soundToggleButton = new SoundToggleButton( soundEnabled, { centerX: refreshButton.centerX, top: returnToLevelSelectButton.bottom + buttonSpacing } );
    this.addChild( soundToggleButton );
    var soundToggleButtonLabel = new Text( 'Sound Toggle Button: ', { font: BUTTON_CAPTION_FONT, right: soundToggleButton.left - 5, centerY: soundToggleButton.centerY } );
    this.addChild( soundToggleButtonLabel );

    // add timer toggle button
    var timerEnabled = new Property( true );
    var timerToggleButton = new TimerToggleButton( timerEnabled, { centerX: refreshButton.centerX, y: soundToggleButton.bottom + 5 } );
    this.addChild( timerToggleButton );
    var timerToggleButtonLabel = new Text( 'Timer Toggle Button: ', { font: BUTTON_CAPTION_FONT, right: timerToggleButton.left - 5, centerY: timerToggleButton.centerY } );
    this.addChild( timerToggleButtonLabel );

    // Count variables, declared here so that they can be reset.
    var buttonCFireCount = 0;
    var fireOnDownCount = 0;

    // Reset function
    function resetAll() {
      outputText.text = 'Reset All pressed';
      buttonsEnabled.reset();
      soundEnabled.reset();
      timerEnabled.reset();
      buttonCFireCount = 0;
      fireOnDownCount = 0;
      roundToggleButtonProperty.reset();
      rectangularToggleButtonProperty.reset();
    }

    // add reset all button and caption
    var resetAllButton = new ResetAllButtonDeprecated( resetAll, { radius: 22, centerX: refreshButton.centerX, top: timerToggleButton.bottom + buttonSpacing } );
    this.addChild( resetAllButton );
    var resetAllButtonLabel = new Text( 'Reset All Button: ', { font: BUTTON_CAPTION_FONT, right: resetAllButton.left - 5, centerY: resetAllButton.centerY } );
    this.addChild( resetAllButtonLabel );

    // Test button behavior.
    var buttonA = new RectangularPushButton(
      {
        content: new Text( '--- A ---', { font: BUTTON_FONT } ),
        listener: function() { outputText.text = 'Button A pressed'; },
        left: 100,
        top: 300
      } );
    this.addChild( buttonA );

    var buttonB = new RectangularPushButton(
      {
        content: new Text( '--- B ---', { font: BUTTON_FONT } ),
        listener: function() { outputText.text = 'Button B pressed'; },
        left: buttonA.right + 10,
        centerY: buttonA.centerY,
        baseColor: new Color( 250, 0, 0 )
      } );
    this.addChild( buttonB );

    var buttonC = new RectangularPushButton(
      {
        content: new Text( '--- C ---', { font: BUTTON_FONT } ),
        listener: function() {
          outputText.text = 'Button C pressed ' + ( ++buttonCFireCount ) + 'x';
        },
        left: buttonB.right + 10,
        centerY: buttonB.centerY,
        baseColor: new Color( 204, 102, 204 )
      } );
    this.addChild( buttonC );

    var fireOnDownButton = new RectangularPushButton(
      {
        content: new Text( 'Fire on Down Button', { font: BUTTON_FONT } ),
        listener: function() { outputText.text = 'Fire on down button pressed ' + ( ++fireOnDownCount ) + 'x'; },
        left: buttonC.right + 30,
        centerY: buttonC.centerY,
        baseColor: new Color( 255, 255, 61 ),
        fireOnDown: true,
        stroke: 'black'
      } );
    this.addChild( fireOnDownButton );

    var buttonEnableButton = new BooleanRectangularToggleButtonWithContent(
      new Text( 'Disable Buttons', { font: BUTTON_CAPTION_FONT } ),
      new Text( 'Enable Buttons', { font: BUTTON_CAPTION_FONT } ),
      buttonsEnabled,
      { baseColor: new Color( 204, 255, 51 ), left: buttonA.left, top: buttonA.bottom + 30 }
    );
    this.addChild( buttonEnableButton );

    // add alternative reset all button
    var resetAllButton2 = new ResetAllButton( { listener: resetAll, radius: 22, centerX: buttonC.centerX, centerY: buttonEnableButton.centerY } );
    this.addChild( resetAllButton2 );

    var buttonD = new RoundPushButton(
      {
        content: new Text( '--- D ---', { font: BUTTON_FONT } ),
        listener: function() { outputText.text = 'Button D pressed'; },
        left: resetAllButton2.right + buttonSpacing,
        centerY: resetAllButton2.centerY
      } );
    this.addChild( buttonD );

    var buttonE = new RoundPushButton(
      {
        content: new Text( '--- E ---', { font: BUTTON_FONT } ),
        listener: function() { outputText.text = 'Button E pressed'; },
        baseColor: new Color( 245, 184, 0 ),
        left: buttonD.right + buttonSpacing,
        centerY: buttonD.centerY
      } );
    this.addChild( buttonE );

    var fireButton = new RoundPushButton(
      {
        content: new Text( 'Fire!', { font: BUTTON_FONT } ),
        listener: function() { outputText.text = 'Fire button pressed'; },
        baseColor: new Color( 255, 100, 51 ),
        left: buttonE.right + buttonSpacing,
        centerY: buttonE.centerY,
        stroke: 'black',
        lineWidth: 0.5
      } );
    this.addChild( fireButton );

    var goButton = new RoundPushButton(
      {
        content: new Text( 'Go!', { font: BUTTON_FONT } ),
        listener: function() { outputText.text = 'Go button pressed'; },
        baseColor: new Color( 0, 163, 0 ),
        minXPadding: 10,
        centerX: resetAllButton2.centerX,
        top: buttonE.bottom + 5
      } );
    this.addChild( goButton );

    var helpButtonBaseColor = new Color( 244, 154, 194 );
    var helpButton = new RoundPushButton(
      {
        content: new Text( 'Help', { font: BUTTON_FONT } ),
        listener: function() { outputText.text = 'Help button pressed'; },
        baseColor: new Color( 244, 154, 194 ),
        minXPadding: 10,
        left: goButton.right + 5,
        centerY: goButton.centerY,
        stroke: helpButtonBaseColor.colorUtilsDarker( 0.4 ),
        lineWidth: 0.5
      } );
    this.addChild( helpButton );

    // Demonstrate using arbitrary values for toggle button.  Wrap in extra
    // quotes so it is clear that it is a string in the debugging UI.
    var roundToggleButtonProperty = new Property( '"off"' );
    roundToggleButtonProperty.lazyLink( function( toggleButton ) {
      outputText.text = "Round sticky toggle button state changed to: " + toggleButton;
    } );
    var roundStickyToggleButton = new RoundStickyToggleButton( '"off"', '"on"', roundToggleButtonProperty, {
      baseColor: new Color( 255, 0, 0 ),
      left: helpButton.right + 5,
      centerY: goButton.centerY
    } );
    this.addChild( roundStickyToggleButton );

    var rectangularToggleButtonProperty = new Property( false );
    rectangularToggleButtonProperty.lazyLink( function( toggleButton ) {
      outputText.text = 'Rectangular sticky toggle button state changed to: ' + toggleButton;
    } );
    var booleanRectangularStickyToggleButton = new BooleanRectangularStickyToggleButton( rectangularToggleButtonProperty, {
      baseColor: new Color( 0, 200, 200 ),
      left: roundStickyToggleButton.right + 10,
      centerY: goButton.centerY,
      minWidth: 50,
      minHeight: 35
    } );
    this.addChild( booleanRectangularStickyToggleButton );

    var inOutRadioButton = new InOutRadioButton( new Property( true ), true, new Text( 'In/Out' ) );
    this.addChild( inOutRadioButton );

    var transparentButton = new RectangularPushButton(
      {
        content: new Text( 'Transparent Button', { font: BUTTON_FONT } ),
        listener: function() { outputText.text = 'Transparent button pressed'; },
        left: helpButton.centerX,
        top: roundStickyToggleButton.bottom - 10,
        baseColor: new Color( 255, 255, 0, 0.7 )
      } );
    this.addChild( transparentButton );

    // Hook up button enable property
    buttonsEnabled.link( function( enabled ) {
      buttonA.enabled = enabled;
      buttonB.enabled = enabled;
      buttonC.enabled = enabled;
      buttonD.enabled = enabled;
      buttonE.enabled = enabled;
      fireOnDownButton.enabled = enabled;
      fireButton.enabled = enabled;
      goButton.enabled = enabled;
      helpButton.enabled = enabled;
      refreshButton.enabled = enabled;
      returnToLevelSelectButton.enabled = enabled;
      soundToggleButton.enabled = enabled;
      timerToggleButton.enabled = enabled;
      roundStickyToggleButton.enabled = enabled;
      booleanRectangularStickyToggleButton.enabled = enabled;
    } );

    // TODO: For debug, don't leave this here long term.
    var debugText = new Text( '(debug text)', { font: new PhetFont( 16 ), bottom: outputText.top - 5, left: this.layoutBounds.minX + 10  } );
    this.addChild( debugText );
    window.debugText = debugText;
  }

  return inherit( ScreenView, ButtonsView, {
    step: function( timeElapsed ) {
      // Does nothing for now.
    }
  } );
} );
