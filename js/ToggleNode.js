// Copyright 2002-2013, University of Colorado Boulder

/**
 * Shows one node if the property is true or another node if the property is false.
 * Used to indicate boolean state.
 *
 * @author Sam Reid
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  "use strict";

  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {Node} falseNode
   * @param {Node} trueNode
   * @param {Property} booleanProperty
   * @constructor
   */
  function ToggleNode( falseNode, trueNode, booleanProperty ) {
    var thisNode = this;
    Node.call( thisNode );
    var background = new Path( { shape: Shape.bounds( trueNode.bounds.union( falseNode.bounds ) ) } );
    booleanProperty.link( function( value ) {
      thisNode.children = [ background, value ? trueNode : falseNode ];
    } );
  }

  inherit( Node, ToggleNode );

  return ToggleNode;
} );