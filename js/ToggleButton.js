//Render a simple toggle button (without icons or anything)
//TODO: not ready for use in simulations, it will need further development & discussion first.
define( function( require ) {
  "use strict";

  var Node = require( 'SCENERY/nodes/Node' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  function ToggleButton( content, property, options ) {
    options = options || {};
    options.cursor = 'pointer';
    Node.call( this, options );

    this.path = new Rectangle( 0, 0, content.width + 10, content.height + 10, 10, 10, {stroke: 'black', lineWidth: 1, fill: 'orange'} );
    this.addChild( this.path );
    content.centerX = this.path.width / 2;
    content.centerY = this.path.height / 2;
    this.addChild( content );
    this.addInputListener( {down: function() { property.set( !property.get() ); }} );
  }

  inherit( ToggleButton, Node );

  return ToggleButton;
} );