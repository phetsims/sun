//Render a simple button
//TODO: Button.js is not ready for use in simulations, it will need further development & discussion first.
define( function( require ) {
  "use strict";

  var Node = require( 'SCENERY/nodes/Node' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  function Button( content, options, callback ) {
    options = options || {};
    options.cursor = 'pointer';
    Node.call( this, options );

    var path = new Rectangle( 0, 0, content.width + 10, content.height + 10, 10, 10, {stroke: 'black', lineWidth: 1, fill: 'orange'} );
    this.addChild( path );
    content.centerX = path.width / 2;
    content.centerY = path.height / 2;
    this.addChild( content );
    this.addInputListener( {down: function() {callback();}} );
  }

  inherit( Button, Node );

  return Button;
} );