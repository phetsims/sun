// Copyright 2002-2013, University of Colorado Boulder

//Render a simple vertical check box group, where the buttons all have the same sizes
//TODO: not ready for use in simulations, it will need further development & discussion first.
define( function( require ) {
  'use strict';

  var Path = require( 'SCENERY/nodes/Path' );
  var CheckBox = require( 'SUN/CheckBox' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * Main constructor.
   *
   * @param items  an array of {content, property, indent}
   * @param options
   * @constructor
   */
  function VerticalCheckBoxGroup( items, options ) {
    options = _.extend( { spacing: 10, checkBoxColor: 'black' }, options );
    var padding = options.padding ? options.padding : 8; //TODO should be handled in _.extend

    var width = 0;
    for ( var i = 0; i < items.length; i++ ) {
      width = Math.max( width, items[i].content.width );
    }

    var children = [];
    for ( i = 0; i < items.length; i++ ) {

      var offset = items[i].indent || 0;
      var content = new Path( {shape: Shape.rect( 0, 0, width + padding - offset, 0 ), children: [items[i].content], renderer: 'svg'} );
      //Add an invisible strut to each content to make the widths match
      var checkBox = new CheckBox( content, items[i].property, {label: items[i].label, checkBoxColor: options.checkBoxColor,

        //Increase padding to match the spacing so the touch hit areas will be adjacent.
        touchAreaTopPadding: 5,
        touchAreaBottomPadding: 5,
        touchAreaLeftPadding: 5,
        touchAreaRightPadding: 5} );
      if ( items[i].indent ) {
        children.push( new HBox( {children: [ new Rectangle( 0, 0, items[i].indent, 1 ), checkBox ]} ) );
      }
      else {
        children.push( new HBox( {children: [checkBox]} ) );
      }
    }

    //TODO these options should be added using _.extend(options, {children:..., renderer:..., align:...})
    options.children = children;
    options.renderer = 'svg';
    options.align = 'left';
    VBox.call( this, options );
  }

  return inherit( VBox, VerticalCheckBoxGroup );
} );