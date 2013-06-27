// Copyright 2002-2013, University of Colorado Boulder

/**
 * Control panel around a content node.
 *
 * @author Sam Reid
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // imports
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  /**
   * @param {Node} content
   * @param {object} options
   * @constructor
   */
  function PanelNode( content, options ) {

    var thisNode = this;

    // default options
    options = _.extend( {
      fill: 'white',
      stroke: 'black',
      lineWidth: 1, // width of the background border
      xMargin: 5,
      yMargin: 5,
      cornerRadius: 10, // radius of the rounded corners on the background
      resize: true // dynamically resize when content bounds change?
    }, options );

    Node.call( thisNode );

    // correct size will be set by updateBackground
    var background = new Rectangle( 0, 0, 1, 1, {stroke: options.stroke, lineWidth: options.lineWidth, fill: options.fill} );
    this.addChild( background );
    this.addChild( content );

    // Adjust the background size to match the content.
    var updateBackground = function() {
      background.setRect( 0, 0, content.width + ( 2 * options.xMargin ), content.height + ( 2 * options.yMargin ), options.cornerRadius, options.cornerRadius );
      content.centerX = background.centerX;
      content.centerY = background.centerY;
    };
    if ( options.resize ) {
      content.addEventListener( 'bounds', function() {
        updateBackground();
      } );
    }
    updateBackground();

    // Apply options after the layout is done, so that options that use the bounds will work properly.
    this.mutate( options );
  }

  inherit( Node, PanelNode );

  return PanelNode;
} );