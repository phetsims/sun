// Copyright 2002-2014, University of Colorado Boulder

/**
 * Main ScreenView container for Buttons portion of the UI component demo.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  var BooleanRectangularStickyToggleButton = require( 'SUN/buttons/BooleanRectangularStickyToggleButton' );
  var BooleanRectangularToggleButtonWithContent = require( 'SUN/buttons/BooleanRectangularToggleButton' );
  var Color = require( 'SCENERY/util/Color' );
  var HTMLPushButton = require( 'SUN/buttons/HTMLPushButton' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Node = require( 'SCENERY/nodes/Node' );
  var OutsideBackgroundNode = require( 'SCENERY_PHET/OutsideBackgroundNode' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var RectangularButtonView = require( 'SUN/buttons/RectangularButtonView' );
  var RoundButtonView = require( 'SUN/buttons/RoundButtonView' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var RefreshButton = require( 'SCENERY_PHET/RefreshButton' );
  var ResetAllButton = require( 'SCENERY_PHET/ResetAllButton' );
  var ReturnToLevelSelectButton = require( 'SCENERY_PHET/ReturnToLevelSelectButton' );
  var RoundPushButton = require( 'SUN/buttons/RoundPushButton' );
  var RoundStickyToggleButton = require( 'SUN/buttons/RoundStickyToggleButton' );
  var SliderKnob = require( 'SUN/experimental/SliderKnob' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var SoundToggleButton = require( 'SCENERY_PHET/SoundToggleButton' );
  var Text = require( 'SCENERY/nodes/Text' );
  var TimerToggleButton = require( 'SCENERY_PHET/TimerToggleButton' );
  var RadioButtons = require( 'SUN/buttons/RadioButtons' );
  var Panel = require( 'SUN/Panel' );

  // Constants
  var BUTTON_FONT = new PhetFont( { size: 20 } );
  var BUTTON_CAPTION_FONT = new PhetFont( { size: 16 } );

  function ButtonsDemoView() {
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

    // add radio buttons
    var radioButtonContent = [
      { value: 'one', node: new Text( 'ONE', { font: BUTTON_FONT } ) },
      { value: 'two', node: new Text( 'TWO', { font: BUTTON_FONT } ) },
      { value: 'three', node: new Text( 'THREE', { font: BUTTON_FONT } ) },
      { value: 'four', node: new Text( 'FOUR', { font: BUTTON_FONT } ) }
    ];
    var radioButtonProperty = new Property( 'two' );
    var radioButtons = new RadioButtons( radioButtonProperty, radioButtonContent,
      {
        alignVertically: true,
        y: 15
      } );
    this.addChild( new Panel( radioButtons, {stroke: null, x: 5, y: 5} ) );

    radioButtonProperty.link( function( value ) {
      outputText.text = 'Radio button ' + value + ' pressed';
    } );

    // add sound toggle button
    var soundEnabled = new Property( true );
    var soundToggleButton = new SoundToggleButton( soundEnabled, { centerX: refreshButton.centerX, top: returnToLevelSelectButton.bottom + buttonSpacing * 5 } );
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

    // Test button behavior.
    var buttonA = new RectangularPushButton( {
      content: new Text( '--- A ---', { font: BUTTON_FONT } ),
      listener: function() { outputText.text = 'Button A pressed'; },
      left: 100,
      top: 285
    } );
    this.addChild( buttonA );

    var buttonB = new RectangularPushButton( {
      content: new Text( '--- B ---', { font: BUTTON_FONT } ),
      listener: function() { outputText.text = 'Button B pressed'; },
      left: buttonA.right + 10,
      centerY: buttonA.centerY,
      baseColor: new Color( 250, 0, 0 )
    } );
    this.addChild( buttonB );

    var buttonC = new RectangularPushButton( {
      content: new Text( '--- C ---', { font: BUTTON_FONT } ),
      listener: function() {
        outputText.text = 'Button C pressed ' + ( ++buttonCFireCount ) + 'x';
      },
      left: buttonB.right + 10,
      centerY: buttonB.centerY,
      baseColor: 'rgb( 204, 102, 204 )'
    } );
    this.addChild( buttonC );

    var fireOnDownButton = new RectangularPushButton( {
      content: new Text( 'Fire on Down Button', { font: BUTTON_FONT } ),
      listener: function() { outputText.text = 'Fire on down button pressed ' + ( ++fireOnDownCount ) + 'x'; },
      left: buttonC.right + 30,
      centerY: buttonC.centerY,
      baseColor: new Color( 255, 255, 61 ),
      fireOnDown: true,
      stroke: 'black',
      lineWidth: 1
    } );
    this.addChild( fireOnDownButton );

    var button1 = new RectangularPushButton( {
      content: new Text( '-- 1 --', { font: BUTTON_FONT } ),
      listener: function() {
        outputText.text = 'Button 1 pressed ' + ( ++buttonCFireCount ) + 'x';
      },
      left: fireOnDownButton.right + 10,
      centerY: fireOnDownButton.centerY,
      baseColor: 'rgb( 204, 102, 204 )',
      buttonAppearanceStrategy: RectangularButtonView.flatAppearanceStrategy
    } );
    this.addChild( button1 );

    var button2 = new RectangularPushButton( {
      content: new Text( '-- 2 --', { font: BUTTON_FONT } ),
      listener: function() {
        outputText.text = 'Button 2 pressed ' + ( ++buttonCFireCount ) + 'x';
      },
      centerX: button1.centerX,
      top: button1.bottom + 10,
      baseColor: '#A0D022',
      buttonAppearanceStrategy: RectangularButtonView.flatAppearanceStrategy,
      lineWidth: 1,
      stroke: '#202020'
    } );
    this.addChild( button2 );

    var button3 = new RoundPushButton( {
      content: new Text( '- 3 -', { font: BUTTON_FONT } ),
      listener: function() {
        outputText.text = 'Button 3 pressed ';
      },
      centerX: button1.centerX,
      top: button2.bottom + 10,
      buttonAppearanceStrategy: RoundButtonView.flatAppearanceStrategy
    } );
    this.addChild( button3 );

    var button4 = new RoundPushButton( {
      content: new Text( '-- 4 --', { font: BUTTON_FONT, fill: 'white' } ),
      listener: function() {
        outputText.text = 'Button 4 pressed ';
      },
      baseColor: '#CC3300',
      centerX: button1.centerX,
      top: button3.bottom + 10,
      buttonAppearanceStrategy: RoundButtonView.flatAppearanceStrategy
    } );
    this.addChild( button4 );

    var buttonEnableButton = new BooleanRectangularToggleButtonWithContent(
      new Text( 'Disable Buttons', { font: BUTTON_CAPTION_FONT } ),
      new Text( 'Enable Buttons', { font: BUTTON_CAPTION_FONT } ),
      buttonsEnabled,
      { baseColor: new Color( 204, 255, 51 ), left: buttonA.left, top: buttonA.bottom + 30 }
    );
    this.addChild( buttonEnableButton );

    var htmlButton = new HTMLPushButton( 'HTML <em>button</em> <b>example</b>', {
      listener: function() { outputText.text = 'HTML button pressed'; },
      baseColor: new Color( 64, 225, 0 ),
      centerX: buttonEnableButton.centerX,
      top: buttonEnableButton.bottom + buttonSpacing
    } );
    this.addChild( htmlButton );

    var resetAllButton = new ResetAllButton( { listener: resetAll, radius: 22, centerX: buttonC.centerX, centerY: buttonEnableButton.centerY } );
    this.addChild( resetAllButton );

    var buttonD = new RoundPushButton( {
      content: new Text( '--- D ---', { font: BUTTON_FONT } ),
      listener: function() { outputText.text = 'Button D pressed'; },
      left: resetAllButton.right + buttonSpacing,
      centerY: resetAllButton.centerY
    } );
    this.addChild( buttonD );

    var buttonE = new RoundPushButton( {
      content: new Text( '--- E ---', { font: BUTTON_FONT } ),
      listener: function() { outputText.text = 'Button E pressed'; },
      baseColor: new Color( 245, 184, 0 ),
      left: buttonD.right + buttonSpacing,
      centerY: buttonD.centerY
    } );
    this.addChild( buttonE );

    var fireButton = new RoundPushButton( {
      content: new Text( 'Fire!', { font: BUTTON_FONT } ),
      listener: function() { outputText.text = 'Fire button pressed'; },
      baseColor: 'orange',
      left: buttonE.right + buttonSpacing,
      centerY: buttonE.centerY,
      stroke: 'black',
      lineWidth: 0.5
    } );
    this.addChild( fireButton );

    var goButton = new RoundPushButton( {
      content: new Text( 'Go!', { font: BUTTON_FONT } ),
      listener: function() { outputText.text = 'Go button pressed'; },
      baseColor: new Color( 0, 163, 0 ),
      minXPadding: 10,
      centerX: resetAllButton.centerX,
      top: buttonE.bottom + 5
    } );
    this.addChild( goButton );

    var helpButton = new RoundPushButton( {
      content: new Text( 'Help', { font: BUTTON_FONT } ),
      listener: function() { outputText.text = 'Help button pressed'; },
      baseColor: new Color( 244, 154, 194 ),
      minXPadding: 10,
      left: goButton.right + 5,
      centerY: goButton.centerY
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

    var transparentButton = new RectangularPushButton( {
      content: new Text( 'Transparent Button', { font: BUTTON_FONT } ),
      listener: function() { outputText.text = 'Transparent button pressed'; },
      left: helpButton.centerX,
      top: roundStickyToggleButton.bottom - 10,
      baseColor: new Color( 255, 255, 0, 0.7 )
    } );
    this.addChild( transparentButton );

    // TODO: Mid-may 2014 - It has been requested that a slider knob be
    // TODO: created that uses the new button look.  Below is an attempt at
    // TODO: this.  It should be removed when finalised.

    // ----- 1 -------
    var sliderPrototype1 = new Node();
    var track1 = new Line( 0, 0, 80, 0, { stroke: 'black', lineWidth: 6 } );
    sliderPrototype1.addChild( track1 );

    var sliderKnob = new SliderKnob( { center: track1.center } );

    sliderKnob.addInputListener( new SimpleDragHandler( {
      // Allow moving a finger (touch) across a node to pick it up.
      allowTouchSnag: true,

      // Handler that moves the shape in model space.
      translate: function( translationParams ) {
        if ( ( translationParams.delta.x > 0 && sliderKnob.centerX < track1.width ) ||
             ( translationParams.delta.x < 0 && sliderKnob.centerX > 0 ) ) {
          sliderKnob.centerX += translationParams.delta.x;
        }
        return translationParams.position;
      }
    } ) );
    sliderPrototype1.addChild( sliderKnob );
    sliderPrototype1.centerX = htmlButton.centerX;
    sliderPrototype1.top = htmlButton.bottom + buttonSpacing;
    this.addChild( sliderPrototype1 );

    // ----- 2 -------
    var sliderPrototype2 = new Node();
    var track2 = new Line( 0, 0, 80, 0, { stroke: 'black', lineWidth: 6 } );
    sliderPrototype2.addChild( track2 );

    var sliderKnob2 = new SliderKnob( { center: track2.center, baseColor: 'orange' } );

    sliderKnob2.addInputListener( new SimpleDragHandler( {
      // Allow moving a finger (touch) across a node to pick it up.
      allowTouchSnag: true,

      // Handler that moves the shape in model space.
      translate: function( translationParams ) {
        if ( ( translationParams.delta.x > 0 && sliderKnob2.centerX < track2.width ) ||
             ( translationParams.delta.x < 0 && sliderKnob2.centerX > 0 ) ) {
          sliderKnob2.centerX += translationParams.delta.x;
        }
        return translationParams.position;
      }
    } ) );
    sliderPrototype2.addChild( sliderKnob2 );
    sliderPrototype2.left = refreshButton.right + 50;
    sliderPrototype2.centerY = refreshButton.centerY;
    this.addChild( sliderPrototype2 );

    // ----- 3 -------
    var sliderPrototype3 = new Node();
    var track3 = new Line( 0, 0, 80, 0, { stroke: 'black', lineWidth: 6 } );
    sliderPrototype3.addChild( track3 );

    var sliderKnob3 = new SliderKnob( { center: track3.center, width: 15, baseColor: '#00CC66', stroke: 'black', centerIndentWidth: 0 } );

    sliderKnob3.addInputListener( new SimpleDragHandler( {
      // Allow moving a finger (touch) across a node to pick it up.
      allowTouchSnag: true,

      // Handler that moves the shape in model space.
      translate: function( translationParams ) {
        if ( ( translationParams.delta.x > 0 && sliderKnob3.centerX < track3.width ) ||
             ( translationParams.delta.x < 0 && sliderKnob3.centerX > 0 ) ) {
          sliderKnob3.centerX += translationParams.delta.x;
        }
        return translationParams.position;
      }
    } ) );
    sliderPrototype3.addChild( sliderKnob3 );
    sliderPrototype3.left = sliderPrototype2.left;
    sliderPrototype3.top = sliderPrototype2.bottom + 30;
    this.addChild( sliderPrototype3 );

    // TODO: End of slider knob prototype(s)

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
      transparentButton.enabled = enabled;
      htmlButton.enabled = enabled;
      button1.enabled = enabled;
      button2.enabled = enabled;
      button3.enabled = enabled;
      button4.enabled = enabled;
      sliderKnob.enabled = enabled;
      radioButtons.setEnabled( enabled );
    } );

    // TODO: For debug, don't leave this here long term.
    var debugText = new Text( '(debug text)', { font: new PhetFont( 16 ), bottom: outputText.top - 5, left: this.layoutBounds.minX + 10  } );
    this.addChild( debugText );
    window.debugText = debugText;
  }

  return inherit( ScreenView, ButtonsDemoView, {
    step: function( timeElapsed ) {
      // Does nothing for now.
    }
  } );
} );
