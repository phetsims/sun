//Possibly invisible rectangular background for a node for purposes of increasing hit area or making it so that an unfilled shape is filled for purposes of pickability (such as FontAwesomeNodes) 
define( function( require ) {
  "use strict";

  var Image = require( 'SCENERY/nodes/Image' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var DOM = require( 'SCENERY/nodes/DOM' );
  var Node = require( 'SCENERY/nodes/Node' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Scene = require( 'SCENERY/Scene' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var inherit = require( 'PHET_CORE/inherit' );

  function BoundsNode( child, options ) {
    Node.call( this, options );
    this.addChild( new Rectangle( child.bounds.minX, child.bounds.minY, child.bounds.width, child.bounds.height ) );
    this.addChild( child );
  }

  inherit( Node, BoundsNode );

  return BoundsNode;
} );