//Icon for a check box that shows as checked if the item is selected or unchecked if not
//Uses a Fort.Model.property style interface, with 'link' method
//Uses Font Awesome for rendering the check boxes.  Please make sure font is loaded before calling this so the sizes will be correct on construction.
define( function( require ) {
  "use strict";

  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Image = require( 'SCENERY/nodes/Image' );
  var DOM = require( 'SCENERY/nodes/DOM' );
  var Inheritance = require( 'PHETCOMMON/util/Inheritance' );

  function CheckBoxIcon( property ) {
    var checkBoxIcon = this;
    Node.call( this, {} );
    var checked = new Image( $( '.phet-icon-check' )[0], {scale: 0.025} );
    var unchecked = new Image( $( '.phet-icon-unchecked' )[0], {scale: 0.025} );
    property.link( function( m, newValue ) {
      checkBoxIcon.children = [newValue ? checked : unchecked];
    } );
  }

  Inheritance.inheritPrototype( CheckBoxIcon, Node );

  return CheckBoxIcon;
} );