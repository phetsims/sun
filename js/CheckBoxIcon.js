//Icon for a check box that shows as checked if the item is selected or unchecked if not
//Uses a Fort.Model.property style interface, with 'link' method
//Uses Font Awesome for rendering the check boxes.  Please make sure font is loaded before calling this so the sizes will be correct on construction.
define( function( require ) {
  "use strict";

  var ToggleNode = require( 'SUN/ToggleNode' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );

  function CheckBoxIcon( property ) {
    var checked = new Image( $( '.phet-icon-check' )[0], {scale: 0.025} );
    var unchecked = new Image( $( '.phet-icon-unchecked' )[0], {scale: 0.025} );
    ToggleNode.call( this, unchecked, checked, property );
  }

  inherit( CheckBoxIcon, ToggleNode );

  return CheckBoxIcon;
} );