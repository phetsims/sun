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
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var OutsideBackgroundNode = require( 'SCENERY_PHET/OutsideBackgroundNode' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var RectangularPushButton2 = require( 'SUN/experimental/buttons/RectangularPushButton2' );
  var RefreshButton = require( 'SUN/experimental/buttons/RefreshButton' );
  var ResetAllButton = require( 'SCENERY_PHET/ResetAllButton' );
  var ReturnToLevelSelectButton = require( 'SUN/experimental/buttons/ReturnToLevelSelectButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var SoundToggleButton2 = require( 'SUN/experimental/buttons/SoundToggleButton2' );
  var TestButton01 = require( 'SUN/experimental/buttons/TestButton01' );
  var TestButton02 = require( 'SUN/experimental/buttons/TestButton02' );
  var Text = require( 'SCENERY/nodes/Text' );
  var TimerToggleButton2 = require( 'SUN/experimental/buttons/TimerToggleButton2' );
  var ToggleButton2 = require( 'SUN/experimental/buttons/ToggleButton2' );
  var Vector2 = require( 'DOT/Vector2' );

  // Constants
  var BUTTON_FONT = new PhetFont( { size: 20 } );
  var BUTTON_CAPTION_FONT = new PhetFont( { size: 16 } );

  function ButtonsView( model ) {
    ScreenView.call( this, { renderer: 'svg' } );

    // background
    this.addChild( new OutsideBackgroundNode(
      ModelViewTransform2.createOffsetXYScaleMapping( new Vector2( 0, this.layoutBounds.height * 0.55 ), 1, -1 ),
      this.layoutBounds.height / 2,
      -this.layoutBounds.height / 2 ) );

    // convenience vars for layout
    var rightEdge = this.layoutBounds.width * 0.6;
    var buttonSpacing = 10;

    // add refresh button and caption
    var refreshButton = new RefreshButton(
      {
        listener: function() { console.log( 'Refresh pressed' ); },
        right: rightEdge,
        top: 10
      } );
    this.addChild( refreshButton );
    var refreshButtonLabel = new Text( 'Refresh Button: ', { font: BUTTON_CAPTION_FONT, right: refreshButton.left - 5, centerY: refreshButton.centerY } );
    this.addChild( refreshButtonLabel );

    // add return to level select button and caption
    var returnToLevelSelectButton = new ReturnToLevelSelectButton(
      {
        listener: function() { console.log( 'Return to level select pressed' ); },
        centerX: refreshButton.centerX,
        top: refreshButton.bottom + buttonSpacing
      } );
    this.addChild( returnToLevelSelectButton );
    var returnToLevelSelectButtonLabel = new Text( 'Return to Level Selection Button: ', { font: BUTTON_CAPTION_FONT, right: returnToLevelSelectButton.left - 5, centerY: returnToLevelSelectButton.centerY } );
    this.addChild( returnToLevelSelectButtonLabel );

    // add reset all button and caption
    var resetAllButton = new ResetAllButton( function() { console.log( 'Reset All pressed' ); },
      { radius: 22, centerX: refreshButton.centerX, top: returnToLevelSelectButton.bottom + buttonSpacing } );
    this.addChild( resetAllButton );
    var resetAllButtonLabel = new Text( 'Reset All Button: ', { font: BUTTON_CAPTION_FONT, right: resetAllButton.left - 5, centerY: resetAllButton.centerY } );
    this.addChild( resetAllButtonLabel );

    // add sound toggle button
    var soundToggleButton = new SoundToggleButton2( new Property( true ), { centerX: refreshButton.centerX, y: resetAllButton.bottom + buttonSpacing } );
    this.addChild( soundToggleButton );
    var soundToggleButtonLabel = new Text( 'Sound Toggle Button: ', { font: BUTTON_CAPTION_FONT, right: soundToggleButton.left - 5, centerY: soundToggleButton.centerY } );
    this.addChild( soundToggleButtonLabel );

    // add timer toggle button
    var timerEnabled = new Property( true );
    var timerToggleButton = new TimerToggleButton2( timerEnabled, { centerX: refreshButton.centerX, y: soundToggleButton.bottom + 5 } );
    this.addChild( timerToggleButton );
    var timerToggleButtonLabel = new Text( 'Timer Toggle Button: ', { font: BUTTON_CAPTION_FONT, right: timerToggleButton.left - 5, centerY: timerToggleButton.centerY } );
    this.addChild( timerToggleButtonLabel );

    // In order to demonstrate what disabled looks like, hook the timer
    // enabled property up to enable/disable the other buttons.
    timerEnabled.link( function( enabled ) {
      refreshButton.enabled = enabled;
      returnToLevelSelectButton.enabled = enabled;
      soundToggleButton.enabled = enabled;
    } );

    // Text area for outputting test information
    var outputText = new Text( 'Output Area', { font: new PhetFont( 16 ), bottom: this.layoutBounds.height - 5, left: this.layoutBounds + 10  } );
    this.addChild( outputText );

    // Test button behavior.
    var buttonA = new RectangularPushButton2(
      new Text( '--- A ---', { font: BUTTON_FONT } ),
      {
        listener: function() { outputText.text = 'Button A pressed'},
        left: 100,
        top: 300
      } );
    this.addChild( buttonA );
    var buttonB = new RectangularPushButton2(
      new Text( '--- B ---', { font: BUTTON_FONT } ),
      {
        listener: function() { outputText.text = 'Button B pressed'},
        left: buttonA.right + 10,
        centerY: buttonA.centerY,
        baseColor: new Color( 250, 0, 0 )
      } );
    this.addChild( buttonB );

    var buttonC = new RectangularPushButton2(
      new Text( '--- C ---', { font: BUTTON_FONT } ),
      {
        listener: function() { outputText.text = 'Button C pressed'},
        left: buttonB.right + 10,
        centerY: buttonB.centerY,
        baseColor: new Color( 204, 102, 204 )
      } );
    this.addChild( buttonC );

    var fireOnDownButton = new RectangularPushButton2(
      new Text( 'Fire on Down Button', { font: BUTTON_FONT } ),
      {
        listener: function() { outputText.text = 'Fire on down button pressed' },
        left: buttonC.right + 30,
        centerY: buttonC.centerY,
        baseColor: new Color( 255, 255, 61 ),
        fireOnDown: true
      } );
    this.addChild( fireOnDownButton );

    // Set up a property for testing button enable/disable.
    var buttonsEnabled = new Property( true );

    buttonsEnabled.link( function( enabled ) {
      buttonA.enabled = enabled;
      buttonB.enabled = enabled;
      buttonC.enabled = enabled;
      fireOnDownButton.enabled = enabled;
    } );

    var buttonEnableButton = new ToggleButton2(
      new Text( 'Disable Buttons', { font: BUTTON_CAPTION_FONT } ),
      new Text( 'Enable Buttons', { font: BUTTON_CAPTION_FONT } ),
      buttonsEnabled,
      { baseColor: new Color( 204, 255, 51 ), left: buttonA.left, top: buttonA.bottom + 30 }
    );
    this.addChild( buttonEnableButton );
  }

  return inherit( ScreenView, ButtonsView, {
    step: function( timeElapsed ) {
      // Does nothing for now.
    }
  } );
} );
