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
  var ReturnToLevelSelectButton2 = require( 'SUN/experimental/buttons/ReturnToLevelSelectButton2' );
  var Color = require( 'SCENERY/util/Color' );
  var RectangularPushButton2 = require( 'SUN/experimental/buttons/RectangularPushButton2' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var OutsideBackgroundNode = require( 'SCENERY_PHET/OutsideBackgroundNode' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Vector2 = require( 'DOT/Vector2' );

  function ButtonsView( model ) {
    ScreenView.call( this, { renderer: 'svg' } );

    // Add background colors.
    this.addChild( new OutsideBackgroundNode(
      ModelViewTransform2.createOffsetXYScaleMapping( new Vector2( 0, this.layoutBounds.height / 2 ), 1, -1 ),
      this.layoutBounds.height / 2,
      -this.layoutBounds.height / 2 ) );

    // add various test buttons.
    this.addChild( new RefreshButton( function() { console.log( 'Refresh pressed' ); }, { centerX: 100, centerY: 50 } ) );
    this.addChild( new RefreshButton( function() { console.log( 'Refresh pressed' ); }, { centerX: 100, centerY: 150 } ) );
    this.addChild( new RefreshButton( function() { console.log( 'Refresh pressed' ); }, { centerX: 100, centerY: 250 } ) );
    this.addChild( new RefreshButton( function() { console.log( 'Refresh pressed' ); }, { centerX: 100, centerY: 350 } ) );
    var disabledRefreshButton = new RefreshButton( function() { console.log( 'Refresh pressed' ); }, { centerX: 250, centerY: 100 } );
    disabledRefreshButton.enabled = false;
    this.addChild( disabledRefreshButton );
    this.addChild( new ReturnToLevelSelectButton( function() { console.log( 'Return to level selection pressed' ); }, { centerX: 400, centerY: 100 } ) );
    this.addChild( new ResetAllButton( function() { console.log( 'Reset All pressed' ); }, { radius: 22, x: 400, y: 300 } ) );
    this.addChild( new TestButton01( { centerX: 300, centerY: 300 } ) );
    this.addChild( new TestButton02( { centerX: 300, centerY: 350, baseColor: new Color( 0, 100, 0 ) } ) );
    this.addChild( new ReturnToLevelSelectButton2( function() { console.log( 'Return to level selection pressed' ); }, { centerX: 375, centerY: 150 } ) );
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
