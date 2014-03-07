// Copyright 2002-2014, University of Colorado Boulder

/**
 * Main ScreenView container for Buttons portion of the UI component demo.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';
  var ScreenView = require( 'JOIST/ScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ResetAllButton = require( 'SCENERY_PHET/ResetAllButton' );
  var TestButton01 = require( 'SUN/experimental/buttons/TestButton01' );
  var TestButton02 = require( 'SUN/experimental/buttons/TestButton02' );
  var RefreshButton = require( 'SUN/experimental/buttons/RefreshButton' );
  var ReturnToLevelSelectButton = require( 'SUN/experimental/buttons/ReturnToLevelSelectButton' );
  var Color = require( 'SCENERY/util/Color' );
  var RectangularPushButton2 = require( 'SUN/experimental/buttons/RectangularPushButton2' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var OutsideBackgroundNode = require( 'SCENERY_PHET/OutsideBackgroundNode' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Vector2 = require( 'DOT/Vector2' );

  // Constants
  var BUTTON_CAPTION_FONT = new PhetFont( { size: 16 } );

  function ButtonsView( model ) {
    ScreenView.call( this, { renderer: 'svg' } );

    // background
    this.addChild( new OutsideBackgroundNode(
      ModelViewTransform2.createOffsetXYScaleMapping( new Vector2( 0, this.layoutBounds.height / 2 ), 1, -1 ),
      this.layoutBounds.height / 2,
      -this.layoutBounds.height / 2 ) );

    // convenience vars for layout
    var rightEdge = this.layoutBounds.width * 0.67;
    var buttonSpacing = 10;

    // add refresh button and caption
    var refreshButton = new RefreshButton( { listener: function() { console.log( 'Refresh pressed' ) }, right: rightEdge, centerY: 50 } );
    this.addChild( refreshButton );
    var refreshButtonLabel = new Text( 'Refresh Button: ', { font: BUTTON_CAPTION_FONT, right: refreshButton.left - 5, centerY: refreshButton.centerY } );
    this.addChild( refreshButtonLabel );

    // add return to level select button and caption
    var returnToLevelSelectButton = new ReturnToLevelSelectButton( function() { console.log( 'Return to level select pressed' ); }, { right: rightEdge, centerY: 100 } );
    this.addChild( returnToLevelSelectButton );
    var returnToLevelSelectButtonLabel = new Text( 'Return to Level Selection Button: ', { font: BUTTON_CAPTION_FONT, right: returnToLevelSelectButton.left - 5, centerY: returnToLevelSelectButton.centerY } );
    this.addChild( returnToLevelSelectButtonLabel );

    // add reset all button and caption
    var resetAllButton = new ResetAllButton( function() { console.log( 'Reset All pressed' ); }, { radius: 22, centerX: refreshButton.centerX, y: 150 } );
    this.addChild( resetAllButton );
    var resetAllButtonLabel = new Text( 'Reset All Button: ', { font: BUTTON_CAPTION_FONT, right: resetAllButton.left - 5, centerY: resetAllButton.centerY } );
    this.addChild( resetAllButtonLabel );

    // test disabled refresh button
    var disabledRefreshButton = new RefreshButton( { right: rightEdge, centerY: 200 } );
    disabledRefreshButton.enabled = false;
    this.addChild( disabledRefreshButton );

    this.addChild( new TestButton01( { centerX: 300, centerY: 300 } ) );
    this.addChild( new TestButton02( { centerX: 300, centerY: 350, baseColor: new Color( 0, 100, 0 ) } ) );
    this.addChild( new RectangularPushButton2( new Text( 'Model Test' ),
      {
        centerX: 250,
        centerY: 250,
        listener: function() { console.log( 'Dude, you pressed it!' ); }
      } ) );
    var buttonA = new RectangularPushButton2( new Text( '--- A ---', { font: new PhetFont( 20 )} ),
      {
        centerX: 250,
        centerY: 200,
        listener: function() { console.log( 'Dude, you pressed it!' ); }
      } );
    buttonA.enabled = false;
    this.addChild( buttonA );

  }

  return inherit( ScreenView, ButtonsView, {
    step: function( timeElapsed ) {
      // Does nothing for now.
    }
  } );
} );
