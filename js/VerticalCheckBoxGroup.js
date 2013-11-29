// Copyright 2002-2013, University of Colorado Boulder

/**
 * A vertical group of check boxes.
 *
 * @author Sam Reid
 */
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

    options = _.extend( {
      spacing: 10, // vertical spacing
      padding: 8, //TODO what is this? It looks like it's added to the right of the check box. Shouldn't this be an x-margin, added to left and right?
      checkBoxColor: 'black',
      align: 'left',
      boxWidth: 21
    }, options );

    // compute max width of the items
    var maxWidth = 0;
    for ( var i = 0; i < items.length; i++ ) {
      maxWidth = Math.max( maxWidth, items[i].content.width );
    }

    // process each item
    var children = [];
    for ( i = 0; i < items.length; i++ ) {
      var offset = items[i].indent || 0;
      //Attach each item to an invisible strut to make the widths match.
      var content = new Path( Shape.rect( 0, 0, maxWidth + options.padding - offset, 0 ), { children: [items[i].content] } );
      var checkBox = new CheckBox( content, items[i].property, {label: items[i].label, checkBoxColor: options.checkBoxColor, boxWidth: options.boxWidth} );
      checkBox.mouseArea = checkBox.touchArea = Shape.bounds( checkBox.bounds.dilatedXY( 5, options.spacing / 2 ) );
      if ( items[i].indent ) {
        children.push( new HBox( {children: [ new Rectangle( 0, 0, items[i].indent, 1 ), checkBox ]} ) );
      }
      else {
        children.push( new HBox( {children: [checkBox]} ) );
      }
    }

    options.children = children; //TODO bad form, if options.children was already set, then this will blow it away
    VBox.call( this, options );
  }

  return inherit( VBox, VerticalCheckBoxGroup );
} );