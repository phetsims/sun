// Copyright 2002-2014, University of Colorado Boulder

/**
 * Base type for a button with a s
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // Includes
  var inherit = require( 'PHET_CORE/inherit' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var RaisedEdgesButton = require( 'SUN/experimental/buttons/RaisedEdgesButton' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  // Constants
  var DEFAULT_WIDTH = 15;

  /**
   * @param {function} callback
   * @param {Object} options
   * @constructor
   */
  function RefreshButton( callback, options ) {
    options = _.extend( {
      width: DEFAULT_WIDTH
    }, options );

    // Create the top arrow shape, starting at the rightmost edge.  The
    // following params can be tweaked to adjust the look.
    var tailThickness = options.width * 0.3;
    var headWidth = tailThickness * 2.2;
    var radius = options.width - tailThickness / 2;
    var neckAngle = -Math.PI * 0.175;
    var endToNeckAngularSpan = -0.75 * Math.PI;
    var arrowHeadAngularSpan = -Math.PI * 0.25;
    var pointOffset = 0.05 * options.width;
    //---- End of tweak params ----
    var tailCenter = new Vector2( radius, 0 );
    var neckCenter = tailCenter.rotated( endToNeckAngularSpan );
    var tip = new Vector2( radius + pointOffset, 0 ).rotated( endToNeckAngularSpan + arrowHeadAngularSpan );
    var neckOuter = neckCenter.plus( new Vector2( tailThickness / 2, 0 ).rotated( Math.PI - neckAngle ) );
    var headOuterPoint = neckCenter.plus( new Vector2( headWidth / 2, 0 ).rotated( Math.PI - neckAngle ) );
    var headInnerPoint = neckCenter.plus( new Vector2( headWidth / 2, 0 ).rotated( -neckAngle ) );
    var neckInner = neckCenter.plus( new Vector2( tailThickness / 2, 0 ).rotated( -neckAngle ) );
    var outerControlPointDistance = options.width * 1.3; // Multiplier empirically determined
    var ocp1 = new Vector2( outerControlPointDistance, 0 ).rotated( endToNeckAngularSpan / 3 );
    var ocp2 = new Vector2( outerControlPointDistance, 0 ).rotated( 2 / 3 * endToNeckAngularSpan );
    var icpScale = 0.7;  // Multiplier empirically determined
    var icp1 = new Vector2( ocp2.x * icpScale, ocp2.y * icpScale );
    var icp2 = new Vector2( ocp1.x * icpScale, ocp1.y * icpScale );
    var upperArrowShape = new Shape();
    upperArrowShape.moveTo( options.width - tailThickness, 0 );
    upperArrowShape.lineTo( options.width, 0 );
    upperArrowShape.cubicCurveTo( ocp1.x, ocp1.y, ocp2.x, ocp2.y, neckOuter.x, neckOuter.y );
    upperArrowShape.lineTo( headOuterPoint.x, headOuterPoint.y );
    upperArrowShape.lineTo( tip.x, tip.y );
    upperArrowShape.lineTo( headInnerPoint.x, headInnerPoint.y );
    upperArrowShape.lineTo( neckInner.x, neckInner.y );
    upperArrowShape.cubicCurveTo( icp1.x, icp1.y, icp2.x, icp2.y, tailCenter.x - tailThickness / 2, tailCenter.y );
    upperArrowShape.close();

    // Create a rotated copy for the lower arrow.
    var lowerArrowShape = upperArrowShape.copy().transformed( Matrix3.rotationZ( Math.PI ) );

    // Put it all together.
    var doubleArrowNode = new Node();
    doubleArrowNode.addChild( new Path( upperArrowShape, { fill: 'rgb( 88, 88, 90 )' } ) );
    doubleArrowNode.addChild( new Path( lowerArrowShape, { fill: 'rgb( 88, 88, 90 )', y: options.width * 0.2 } ) );

    RaisedEdgesButton.call( this, callback, doubleArrowNode, options );
  }

  return inherit( RaisedEdgesButton, RefreshButton );
} );