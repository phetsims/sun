// Copyright 2013, University of Colorado

/**
 * Scenery-based radio button, pseudo-Aqua look. See "options" comment for list of options.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // imports
  var Circle = require( 'SCENERY/nodes/Circle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  /**
   * @param property
   * @param value the value that corresponds to this button, same type as property
   * @param {Node} node that will be vertically centered to the right of the button
   * @param {object} options
   * @constructor
   */
  function RadioButton( property, value, node, options ) {

    options = _.extend( {
                          cursor: 'pointer',
                          selectedColor: 'rgb( 143, 197, 250 )', // color used to fill the button when it's selected
                          unselectedColor: 'white', // color used to fill the button when it's unselected
                          centerColor: 'black', // color used to fill the center of teh button when it's selected
                          radius: 16, // radius of the button
                          xSpacing: 8, // horizontal space between the button and the node
                          stroke: 'black' // color used to stroke the outer edge of the button
                        }, options );

    var thisNode = this;
    Node.call( thisNode, options );

    // nodes
    var outerCircle = new Circle( options.radius, { fill: options.unselectedColor, stroke: options.stroke } );
    var innerCircle = new Circle( options.radius / 3, { fill: options.centerColor } );

    // rendering order
    thisNode.addChild( outerCircle );
    thisNode.addChild( innerCircle );
    thisNode.addChild( node );

    // layout
    node.left = outerCircle.right + options.xSpacing;
    node.centerY = outerCircle.centerY;

    // add a "hit area" over the entire button, so we don't have a dead spot between button and node
    thisNode.addChild( new Rectangle( thisNode.left, thisNode.top, thisNode.width, thisNode.height ) );

    // sync control with model
    property.addObserver( function( newValue ) {
      outerCircle.fill = ( newValue === value ) ? options.selectedColor : options.unselectedColor;
      innerCircle.visible = ( newValue === value );
    } );

    // set property value on 'up' event
    thisNode.addInputListener(
        {
          up: function() {
            property.set( value );
          }
        } );
  }

  inherit( RadioButton, Node );

  return RadioButton;
} );