//Render a simple button
//TODO: Button.js is not ready for use in simulations, it will need further development & discussion first.
define( function( require ) {
  "use strict";

  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var Inheritance = require( 'PHETCOMMON/util/Inheritance' );

  function Button( content, options, callback ) {
    options = options || {};
    options.cursor = 'pointer';
    Node.call( this, options );

    var buttonShape = new Path( {shape: Shape.rect( 0, 0, content.width + 10, content.height + 10 ), stroke: 'black', lineWidth: 1, fill: 'orange'} );
    this.addChild( buttonShape );
    content.centerX = buttonShape.width / 2;
    content.centerY = buttonShape.height / 2;
    this.addChild( content );
    this.addInputListener( {down: function() {callback();}} );
  }

  Inheritance.inheritPrototype( Button, Node );

  return Button;
} );