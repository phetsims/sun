// Copyright 2013, University of Colorado

/**
 * Collapsible box that hides/shows contents when closed/open.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // imports
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  /**
   * @param {Node} contentNode that will be vertically centered to the right of the button
   * @param {object} options
   * @constructor
   */
  function AccordionBox( contentNode, options ) {

    options = _.extend( {
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
    thisNode.addChild( contentNode );

    // layout
    contentNode.left = outerCircle.right + options.xSpacing;
    contentNode.centerY = outerCircle.centerY;

    // add a "hit area" over the entire button, so we don't have a dead spot between button and node
    thisNode.addChild( new Rectangle( thisNode.left, thisNode.top, thisNode.width, thisNode.height ) );

    // sync control with model
    property.addObserver( function( newValue ) {
      outerCircle.fill = ( newValue === value ) ? options.selectedColor : options.unselectedColor;
      innerCircle.visible = ( newValue === value );
    } );

    // set property value on 'up' event
    thisNode.addInputListener( new ButtonListener( {
      fire: function() {
        property.set( value );
      }
    } ) );
  }

  inherit( Node, AccordionBox );

  return AccordionBox;
} );