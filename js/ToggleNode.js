//Icon that just shows one value if the property is selected or another value if the property is deselected
define( function( require ) {
  "use strict";

  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var inherit = require( 'PHET_CORE/inherit' );

  function ToggleNode( off, on, property ) {
    var toggleNode = this;
    Node.call( this, {} );
    var background = new Path( {shape: Shape.bounds( on.bounds.union( off.bounds ) )} );
    property.link( function( newValue ) { toggleNode.children = [background, newValue ? on : off]; } );
  }

  inherit( ToggleNode, Node );

  return ToggleNode;
} );