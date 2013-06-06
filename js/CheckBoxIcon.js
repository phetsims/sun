//Icon for a check box that shows as checked if the item is selected or unchecked if not
//Uses a phetcommon/Property style interface, with 'link' method
//Uses Font Awesome for rendering the check boxes.  Please make sure font is loaded before calling this so the sizes will be correct on construction.
define( function( require ) {
  "use strict";

  var ToggleNode = require( 'SUN/ToggleNode' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );

  function CheckBoxIcon( property ) {
    var checked = new FontAwesomeNode( 'check', {scale: 0.75} );
    var unchecked = new FontAwesomeNode( 'check_empty', {scale: 0.75} );
    ToggleNode.call( this, unchecked, checked, property );
  }

  inherit( ToggleNode, CheckBoxIcon );

  return CheckBoxIcon;
} );