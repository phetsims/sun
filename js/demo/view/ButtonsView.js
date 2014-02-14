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
//  var TestButton01 = require( 'BUTTONS/view/TestButton01' );
//  var RefreshButton = require( 'BUTTONS/view/RefreshButton' );
//  var ReturnToLevelSelectButton = require( 'BUTTONS/view/ReturnToLevelSelectButton' );

  function ButtonsView( model ) {
    ScreenView.call( this, { renderer: 'svg' } );

    // add various test buttons.
//    this.addChild( new RefreshButton( function() { console.log( 'Refresh pressed' ); }, { width: 20, centerX: 100, centerY: 200 } ) );
//    this.addChild( new RefreshButton( function() { console.log( 'Refresh pressed' ); }, { centerX: 100, centerY: 100 } ) );
//    var disabledRefreshButton = new RefreshButton( function() { console.log( 'Refresh pressed' ); }, { centerX: 200, centerY: 100 } );
//    disabledRefreshButton.enabled = false;
//    this.addChild( disabledRefreshButton );
//    this.addChild( new ReturnToLevelSelectButton( function() { console.log( 'Return to level selection pressed' ); }, { centerX: 400, centerY: 100 } ) );
    this.addChild( new ResetAllButton( function() { console.log( 'Reset All pressed' ); }, { radius: 22, x: 400, y: 300 } ) );
//    this.addChild( new TestButton01( { centerX: 300, centerY: 300 } ) );
  }

  return inherit( ScreenView, ButtonsView, {
    step: function( timeElapsed ) {
      // Does nothing for now.
    }
  } );
} );
