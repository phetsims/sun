// Copyright 2013, University of Colorado

/**
 * Scenery-based radio button, pseudo-Aqua look. See "options" comment for list of options.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function ( require ) {

  // imports
  var Circle = require( "SCENERY/nodes/Circle" );
  var inherit = require( "PHET_CORE/inherit" );
  var Node = require( "SCENERY/nodes/Node" );
  var Text = require( "SCENERY/nodes/Text" );

  /**
   * @param {Property} property
   * @param value the value that corresponds to this button, same type as property
   * @param {Node} node node the will be vertically centered to the right of the button
   * @param {object} options
   * @constructor
   */
  function RadioButtonNode( property, value, node, options ) {

    var thisNode = this;
    Node.call( thisNode );

    // options
    options = options || {};
    var selectedColor = options.selectedColor || 'rgb( 143, 197, 250 )'; // color used to fill the button when it's selected
    var unselectedColor = options.unselectedColor || 'white'; // color used to fill the button when it's unselected
    var centerColor = options.centerColor || 'black'; // color used to fill the center of teh button when it's selected
    var radius = options.radius || 12; // radius of the button
    var xSpacing = options.xSpacing || 6; // horizontal space between the button and the node
    var stroke = options.stroke || 'black'; // color used to stroke the outer edge of the button

    // nodes
    var outerCircle = new Circle( radius, { fill: unselectedColor, stroke: stroke } );
    var innerCircle = new Circle( radius / 3, { fill: centerColor } );

    // rendering order
    thisNode.addChild( outerCircle );
    thisNode.addChild( innerCircle );
    thisNode.addChild( node );

    // layout
    node.left = outerCircle.right + xSpacing;
    node.centerY = outerCircle.centerY;

    // sync control with model
    property.addObserver( function ( newValue ) {
      outerCircle.fill = ( newValue === value ) ? selectedColor : unselectedColor;
      innerCircle.visible = ( newValue === value );
    } );

    // set property value on 'up' event
    thisNode.addInputListener(
      {
        up: function () {
          property.set( value );
        }
      } );
  }

  inherit( RadioButtonNode, Node );

  return RadioButtonNode;
} );