// Copyright 2002-2014, University of Colorado Boulder

/**
 * Button for toggling timer on and off.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var SimpleClockIcon = require( 'SCENERY_PHET/SimpleClockIcon' );
  var ToggleButton2 = require( 'SUN/experimental/buttons/ToggleButton2' );

  // Constants
  var WIDTH = 50;
  var HEIGHT = 50;
  var MARGIN = 4;
  var X_STROKE_WIDTH = 6;

  /**
   * @param {Property} enabledProperty
   * @param {*} options
   * @constructor
   */
  function TimerToggleButton2( enabledProperty, options ) {

    // Create the node that represents the timer being on.
    var clockRadius = WIDTH * 0.35;
    var timerOnNode = new SimpleClockIcon( clockRadius );

    // Create the node that represents the timer being off.
    var timerOffNode = new Node();
    var timerOffNodeBackground = new SimpleClockIcon( clockRadius, { opacity: 0.8 } );
    timerOffNode.addChild( timerOffNodeBackground );
    var xNode = new Shape();
    var xNodeWidth = timerOffNode.width * 0.8;
    xNode.moveTo( 0, 0 );
    xNode.lineTo( xNodeWidth, xNodeWidth );
    xNode.moveTo( 0, xNodeWidth );
    xNode.lineTo( xNodeWidth, 0 );
    timerOffNode.addChild( new Path( xNode,
      {
        stroke: 'red',
        opacity: 0.55,
        lineWidth: X_STROKE_WIDTH,
        lineCap: 'round',
        centerX: timerOffNode.width / 2,
        centerY: timerOffNode.height / 2
      } ) );

    // Create the toggle button.
    ToggleButton2.call( this,
      timerOnNode,
      timerOffNode,
      enabledProperty,
      _.extend(
        {
          baseColor: new Color( 255, 242, 2 ),
          minWidth: WIDTH,
          minHeight: HEIGHT,
          xMargin: MARGIN,
          yMargin: MARGIN
        }, options ) );
  }

  return inherit( ToggleButton2, TimerToggleButton2 );
} );