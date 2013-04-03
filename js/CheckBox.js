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

  function CheckBox( content, options, property ) {
    var checkBox = this;
    options = options || {};
    options.cursor = 'pointer';
    Node.call( this, options );

    var toggleButton = new ToggleButton( new HBox( {spacing: 10, children: [new CheckBoxIcon( property ), content]} ), {}, property );
    this.addChild( toggleButton );

    //Create a peer for accessibility
    this.peer = new DOM( $( '<input type="checkbox">' ), { interactive: true} );
    var $elm = $( checkBox.peer.element );
    property.link( function( m, value ) { $elm.attr( 'checked', value ); } );
    $elm.click( function() {property.set( !property.get() )} );
    //TODO: Add Public API for focus highlight?
    $elm.focusin( function() { toggleButton.path.lineWidth = 5; } );
    $elm.focusout( function() {toggleButton.path.lineWidth = 1;} );
  }

  inherit( CheckBox, Node );

  return CheckBox;
} );