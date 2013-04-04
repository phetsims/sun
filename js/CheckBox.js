//Render a simple toggle button (without icons or anything)
//TODO: not ready for use in simulations, it will need further development & discussion first.
define( function( require ) {
  "use strict";

  var Node = require( 'SCENERY/nodes/Node' );
  var ToggleButton = require( 'SUN/ToggleButton' );
  var CheckBoxIcon = require( 'SUN/CheckBoxIcon' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var DOM = require( 'SCENERY/nodes/DOM' );
  var inherit = require( 'PHET_CORE/inherit' );

  function CheckBox( content, property, options ) {
    options = options || {};
    options.cursor = 'pointer';
    Node.call( this, options );

    var toggleButton = new ToggleButton( new HBox( {spacing: 10, children: [new CheckBoxIcon( property ), content]} ), property );
    this.addChild( toggleButton );
  }

  inherit( CheckBox, Node );

  return CheckBox;
} );