// Copyright 2002-2013, University of Colorado

//TODO not ready for use in simulations, it will need further development & discussion first.
//TODO add ability to detect when bounds of content node changes
/**
 * Control panel around a content node.
 *
 * @author Sam Reid
 */
define( function( require ) {
  "use strict";

  var Node = require( 'SCENERY/nodes/Node' );
  var DOM = require( 'SCENERY/nodes/DOM' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  /**
   * @param {Node} content
   * @param {object} options
   * @constructor
   */
  function PanelNode( content, options ) {

    // default options
    options = _.extend( { fill: 'white',
                          stroke: 'black',
                          lineWidth: 1,
                          xMargin: 5,
                          yMargin: 5
                        }, options );

    Node.call( this );

    this.path = new Rectangle( 0, 0, content.width + ( 2 * options.xMargin ), content.height + ( 2 * options.yMargin ), 10, 10,
                               {stroke: options.stroke, lineWidth: options.lineWidth, fill: options.fill} );
    this.addChild( this.path );
    this.addChild( content );

    content.centerX = this.path.centerX;
    content.centerY = this.path.centerY;

    //Apply options after the layout done so that options that use the bounds will work properly
    if ( options ) {
      this.mutate( options );
    }
  }

  inherit( PanelNode, Node );

  return PanelNode;
} );