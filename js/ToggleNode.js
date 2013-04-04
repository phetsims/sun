//Icon that just shows one value if the property is selected or another value if the property is deselected
define( function( require ) {
  "use strict";

  var Node = require( 'SCENERY/nodes/Node' );
  var inherit = require( 'PHET_CORE/inherit' );

  function ToggleNode( off, on, property ) {
    var toggleNode = this;
    Node.call( this, {} );
    property.link( function( m, newValue ) { toggleNode.children = [newValue ? on : off]; } );
  }

  inherit( ToggleNode, Node );

  return ToggleNode;
} );