// Copyright 2002-2013, University of Colorado Boulder

//Render a simple vertical check box group, where the buttons all have the same sizes
//TODO: not ready for use in simulations, it will need further development & discussion first.
//TODO: Abstract out common functionality between this and VerticalCheckBoxGroup
define( function( require ) {
  "use strict";

  var Path = require( 'SCENERY/nodes/Path' );
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
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
    options = _.extend( { spacing: 3 }, options );
    var padding = options.padding ? options.padding : 8; //TODO should be handled in _.extend

    var width = 0;
    for ( var i = 0; i < items.length; i++ ) {
      width = Math.max( width, items[i].node.width );
    }

    var children = [];
    for ( i = 0; i < items.length; i++ ) {

      //Add an invisible strut to each content to make the widths match
      var content = new Path( {shape: Shape.rect( 0, 0, width + padding, 0 ), children: [items[i].node], renderer: 'svg'} );
      children.push( new AquaRadioButton( items[i].property, items[i].value, content, {radius: 12} ) );//Made the radius smaller here so the whole panel won't take up too much vertical space
    }

    //TODO these options should be added using _.extend(options, {children:..., renderer:....})
    options.children = children;
    options.renderer = 'svg';
    VBox.call( this, options );
  }

  inherit( VBox, VerticalCheckBoxGroup );

  return VerticalCheckBoxGroup;
} );