//Render a simple toggle button (without icons or anything)
//TODO: not ready for use in simulations, it will need further development & discussion first.
define( function( require ) {
  "use strict";

  var Node = require( 'SCENERY/nodes/Node' );
  var ToggleButton = require( 'SUN/ToggleButton' );
  var CheckBoxIcon = require( 'SUN/CheckBoxIcon' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Inheritance = require( 'PHETCOMMON/util/Inheritance' );

  function CheckBox( content, options, property ) {
    options = options || {};
    options.cursor = 'pointer';
    Node.call( this, options );

    this.addChild( new ToggleButton( new HBox( {spacing: 10, children: [new CheckBoxIcon( property ), content]} ), {}, property ) );
  }

  Inheritance.inheritPrototype( CheckBox, Node );

  return CheckBox;
} );