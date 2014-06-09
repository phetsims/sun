// Copyright 2002-2013, University of Colorado Boulder

/**
 * A rectangular push button. The background fill changes to give feedback about state. The content node is centered in the rectangle.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PushButtonDeprecated = require( 'SUN/PushButtonDeprecated' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // Creates a node that represents the button is a specific state.
  var createNode = function( content, stroke, fill, rectangleLineWidth, rectangleXMargin, rectangleYMargin, rectangleCornerRadius ) {
    var node = new Node();
    var rectangle = new Rectangle(
      0, 0, content.width + rectangleXMargin + rectangleXMargin, content.height + rectangleYMargin + rectangleYMargin, rectangleCornerRadius, rectangleCornerRadius,
      { stroke: stroke, fill: fill, lineWidth: rectangleLineWidth } );
    node.addChild( rectangle );
    node.addChild( content );
    content.pickable = false; // the rectangle will receive hits
    content.centerX = rectangle.centerX;
    content.centerY = rectangle.centerY;
    return node;
  };

  /**
   * @param {Node} content
   * @param options
   * @constructor
   */
  function RectanglePushButtonDeprecated( content, options ) {

    options = _.extend( {
        // stroke
        rectangleStroke: 'black',
        rectangleStrokeDisabled: 'rgb(175,175,175)',
        // fill
        rectangleFillUp: new Color( 255, 200, 0 ),
        rectangleFillDisabled: 'white',
        // options that apply to all states
        rectangleLineWidth: 1,
        rectangleXMargin: 5,
        rectangleYMargin: 5,
        rectangleCornerRadius: 10
      },
      options );

    // generated colors
    assert && assert( options.rectangleFillUp instanceof Color ); //TODO can we relax this requirement?
    options.rectangleFillOver = options.rectangleFillOver || options.rectangleFillUp.brighterColor( 0.9 );
    options.rectangleFillDown = options.rectangleFillDown || options.rectangleFillUp.darkerColor( 0.9 );

    PushButtonDeprecated.call( this,
      createNode( content, options.rectangleStroke, options.rectangleFillUp, options.rectangleLineWidth, options.rectangleXMargin, options.rectangleYMargin, options.rectangleCornerRadius ),
      createNode( content, options.rectangleStroke, options.rectangleFillOver, options.rectangleLineWidth, options.rectangleXMargin, options.rectangleYMargin, options.rectangleCornerRadius ),
      createNode( content, options.rectangleStroke, options.rectangleFillDown, options.rectangleLineWidth, options.rectangleXMargin, options.rectangleYMargin, options.rectangleCornerRadius ),
      createNode( content, options.rectangleStrokeDisabled, options.rectangleFillDisabled, options.rectangleLineWidth, options.rectangleXMargin, options.rectangleYMargin, options.rectangleCornerRadius ),
      options );
  }

  return inherit( PushButtonDeprecated, RectanglePushButtonDeprecated );
} );
