//Render a simple toggle button (without icons or anything)
//TODO: not ready for use in simulations, it will need further development & discussion first.
define( function( require ) {
  "use strict";

  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var Inheritance = require( 'PHETCOMMON/util/Inheritance' );

  function ToggleButton( content, options, property ) {
    options = options || {};
    options.cursor = 'pointer';
    Node.call( this, options );

    var buttonShape = new Path( {shape: Shape.roundRect( 0, 0, content.width + 10, content.height + 10, 10, 10 ), stroke: 'black', lineWidth: 1, fill: 'orange'} );
    this.addChild( buttonShape );
    content.centerX = buttonShape.width / 2;
    content.centerY = buttonShape.height / 2;
    this.addChild( content );
    this.addInputListener( {down: function() { property.set( !property.get() ); }} );
  }

  Inheritance.inheritPrototype( ToggleButton, Node );

  return ToggleButton;
} );