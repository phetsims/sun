//Render a simple vertical check box group, where the buttons all have the same sizes
//TODO: not ready for use in simulations, it will need further development & discussion first.
define( function( require ) {
  "use strict";

  var Path = require( 'SCENERY/nodes/Path' );
  var CheckBox = require( 'SUN/CheckBox' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Shape = require( 'KITE/Shape' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * Main constructor.
   *
   * @param items  an array of {content, property}
   * @param options
   * @constructor
   */
  function VerticalCheckBoxGroup( items, options ) {
    options = options || {};
    var padding = options.padding ? options.padding : 8;

    var width = 0;
    for ( var i = 0; i < items.length; i++ ) {
      width = Math.max( width, items[i].content.width );
    }

    var children = [];
    for ( i = 0; i < items.length; i++ ) {

      //Add an invisible strut to each content to make the widths match
      var content = new Path( {shape: Shape.rect( 0, 0, width + padding, 0 ), children: [items[i].content]} );
      children.push( new CheckBox( content, items[i].property ) );
    }

    options.children = children;
    VBox.call( this, options );
  }

  inherit( VerticalCheckBoxGroup, VBox );

  return VerticalCheckBoxGroup;
} );