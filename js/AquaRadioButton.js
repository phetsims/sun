// Copyright 2002-2013, University of Colorado Boulder

/**
 * Radio button with a pseudo-Aqua (Mac OS) look. See "options" comment for list of options.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var Circle = require( 'SCENERY/nodes/Circle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var RadioButton = require( 'SUN/RadioButton' );

  /**
   * @param property
   * @param value the value that corresponds to this button, same type as property
   * @param {Node} node that will be vertically centered to the right of the button
   * @param {object} options
   * @constructor
   */
  function AquaRadioButton( property, value, node, options ) {

    options = _.extend( {
      cursor: 'pointer',
      selectedColor: 'rgb( 143, 197, 250 )', // color used to fill the button when it's selected
      deselectedColor: 'white', // color used to fill the button when it's deselected
      centerColor: 'black', // color used to fill the center of teh button when it's selected
      radius: 16, // radius of the button
      xSpacing: 8, // horizontal space between the button and the node
      stroke: 'black' // color used to stroke the outer edge of the button
    }, options );

    // selected node
    var selectedNode = new Node();
    var innerCircle = new Circle( options.radius / 3, { fill: options.centerColor } );
    var outerCircleSelected = new Circle( options.radius, { fill: options.selectedColor, stroke: options.stroke } );
    selectedNode.addChild( outerCircleSelected );
    selectedNode.addChild( innerCircle );
    selectedNode.addChild( node );
    node.left = outerCircleSelected.right + options.xSpacing;
    node.centerY = outerCircleSelected.centerY;

    // deselected node
    var deselectedNode = new Node();
    var outerCircleDeselected = new Circle( options.radius, { fill: options.deselectedColor, stroke: options.stroke } );
    deselectedNode.addChild( outerCircleDeselected );
    deselectedNode.addChild( node );
    node.left = outerCircleDeselected.right + options.xSpacing;
    node.centerY = outerCircleDeselected.centerY;

    RadioButton.call( this, property, value, selectedNode, deselectedNode, options );
  }

  inherit( RadioButton, AquaRadioButton );

  return AquaRadioButton;
} );