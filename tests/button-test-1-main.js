// Copyright 2002-2013, University of Colorado Boulder

/**
 * Main entry point for the button test app.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // Imports
  var Color = require( 'SCENERY/util/Color' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var PushButtonNew = require( 'SCENERY_PHET/PushButtonNew' );
  var PushButtonNew2 = require( 'SCENERY_PHET/PushButtonNew2' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ResetAllButton = require( 'SCENERY_PHET/ResetAllButton' );
  var Scene = require( 'SCENERY/Scene' );
  var scenery = require( 'SCENERY/scenery' );
  var Shape = require( 'KITE/Shape' );
  var SimpleClockIcon = require( 'SCENERY_PHET/SimpleClockIcon' );
  var Text = require( 'SCENERY/nodes/Text' );

  // Constants
  var SCENE_WIDTH = 1024;
  var SCENE_HEIGHT = 600;

  var $body = $( 'body' );
  $body.css( 'padding', '0' ).css( 'margin', '0' ).css( 'overflow', 'hidden' ); // prevent scrollbars

  // Add a div to the DOM to hold the main scene.
  var $simDiv = $( '<div>' ).attr( 'id', 'sim' ).css( 'position', 'absolute' ).css( 'left', 0 ).css( 'top', 0 ).css( 'cursor', 'default' );
  $simDiv.width( SCENE_WIDTH );
  $simDiv.height( SCENE_HEIGHT );
  $body.append( $simDiv );

  // Create and initialize the main scene for this app.
  var scene = new Scene( $simDiv, { allowDevicePixelRatioScaling: false, accessible: true } );
  scenery.Util.polyfillRequestAnimationFrame();
  scene.initializeStandaloneEvents();
  scene.updateOnRequestAnimationFrame( $simDiv );

  // Add a sky/ground background.
  scene.addChild( new Rectangle( 0, 0, SCENE_WIDTH / 2, SCENE_HEIGHT, 0, 0,
    {
      fill: new LinearGradient( 0, 0, 0, SCENE_HEIGHT ).
        addColorStop( 0, 'rgb( 1, 172, 228  )' ).
        addColorStop( 0.375, 'rgb( 208, 236, 251 )' ).
        addColorStop( 0.3751, 'rgb( 144, 199, 86 )' ).
        addColorStop( 0.75, 'rgb( 103, 162, 87 )' ).
        addColorStop( 0.7501, 'rgb( 223, 192, 129 )' ).
        addColorStop( 1, 'rgb( 223, 192, 129 )' ),
      stroke: 'black'
    } ) );

  // Add a background so that the bounds are clear.
  scene.addChild( new Rectangle( SCENE_WIDTH / 2, 0, SCENE_WIDTH / 2, SCENE_HEIGHT, 0, 0,
    {
      fill: new LinearGradient( 0, 0, 0, SCENE_HEIGHT ).
        addColorStop( 0, 'rgb( 0, 0, 0 )' ).
        addColorStop( 0.25, 'rgb( 0, 0, 0 )' ).
        addColorStop( 0.2501, 'rgb( 255, 255, 255 )' ).
        addColorStop( 0.5, 'rgb( 255, 255, 255 )' ).
        addColorStop( 0.501, 'rgb( 255, 255, 223 )' ).
        addColorStop( 0.75, 'rgb( 255, 255, 223 )' ).
        addColorStop( 0.751, 'rgb( 255, 255, 153 )' ).
        addColorStop( 1, 'rgb( 255, 255, 153 )' ),
      stroke: 'black'
    } ) );

  // Add the buttons to be demonstrated.
  scene.addChild( new ResetAllButton( function() {}, { centerX: SCENE_WIDTH * 0.4, centerY: SCENE_HEIGHT * 0.6 } ) );

  scene.addChild( new PushButtonNew2(
    function() { },
    new SimpleClockIcon( 12 ),
    {
      centerX: SCENE_WIDTH * 0.2,
      centerY: SCENE_HEIGHT * 0.2
    } ) );
  scene.addChild( new PushButtonNew2(
    function() { },
    new Text( 'Test Button', { font: new PhetFont( { size: 14 } ) } ),
    {
      centerX: SCENE_WIDTH * 0.1,
      centerY: SCENE_HEIGHT * 0.5
    } ) );

  var rightArrowShape = new Shape().
    moveTo( 0, 0 ).
    lineTo( 17, 10 ).
    lineTo( 0, 20 ).
    close();
  var rightArrowNode = new Path( rightArrowShape, { fill: 'black' } );
  scene.addChild( new PushButtonNew2(
    function() { },
    rightArrowNode,
    {
      widthProportion: 1.6,
      heightProportion: 1.4,
      baseColor: new Color( 80, 255, 36 ),
      centerX: SCENE_WIDTH * 0.4,
      centerY: SCENE_HEIGHT * 0.8
    } ) );
} );