// Copyright 2002-2013, University of Colorado Boulder

/**
 * A rectangular button.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // imports
  var Button = require( 'SUN/Button' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  /**
   * @param {Node} content
   * @param {Function} callback
   * @param options
   * @constructor
   */
  function RectangleButton( content, callback, options ) {

    options = _.extend( {
        rectangleFill: 'white',
        rectangleFillDisabled: 'rgb(225,225,225)',
        rectangleStroke: 'black',
        rectangleStrokeDisabled: 'rgb(175,175,175)',
        rectangleLineWidth: 1,
        //TODO default margins and corner radius should be computed based on content dimensions
        rectangleXMargin: 5,
        rectangleYMargin: 5,
        rectangleCornerRadius: 10
      },
      options );

    var thisButton = this;

    // parent for content + rectangle
    var node = new Node();

    // rectangle around the content
    var rectangle = new Rectangle(
      0, 0, content.width + ( 2 * options.rectangleXMargin ), content.height + ( 2 * options.rectangleYMargin ), options.rectangleCornerRadius, options.rectangleCornerRadius,
      { rectangleLineWidth: options.lineWidth } );
    node.addChild( rectangle );

    // content centered in the rectangle
    content.centerX = rectangle.width / 2;
    content.centerY = rectangle.height / 2;
    node.addChild( content );

    Button.call( thisButton, node, callback );

    // enable/disable the pieces that are specific to this subtype
    thisButton._enabled.link( function( enabled ) {
      rectangle.fill = enabled ? options.rectangleFill : options.rectangleFillDisabled;
      rectangle.stroke = enabled ? options.rectangleStroke : options.rectangleStrokeDisabled;
    } );

    thisButton.mutate( options );
  }

  inherit( Button, RectangleButton );

  return RectangleButton;
} );
