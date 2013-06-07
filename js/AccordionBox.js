// Copyright 2013, University of Colorado

/**
 * Collapsible box that hides/shows contents when closed/open.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // Imports
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Vector2 = require( 'DOT/Vector2' );
  var Property = require( 'AXON/Property' );
  var Shape = require( 'KITE/Shape' );

  // Constants
  var CONTROL_BUTTON_INSET = 4; // Can make this an option if desired.
  var CONTROL_BUTTON_DIMENSION = 20; // Can make this an option if desired.
  var CONTROL_BUTTON_SYMBOL_WIDTH = CONTROL_BUTTON_DIMENSION * 0.6;
  var CONTENT_INSET = 5; // Can make this an option if desired.
  var SYMBOL_LINE_WIDTH = 3;

  /**
   * @param {Node} contentNode that will be vertically centered to the right of the button
   * @param {object} options TODO: Clean up option info.  List: initiallyOpen
   * @constructor
   */
  function AccordionBox( contentNode, options ) {

    options = _.extend( { // defaults
                          stroke: 'black', // color used to stroke the outer edge of the button
                          lineWidth: 1,
                          fill: 'rgb( 238, 238, 238 )', // default background color
                          font: "20px Tahoma"
                        }, options );

    var thisNode = this;
    Node.call( this, options );

    // Create a property that tracks the open/closed state.
    var open = new Property( options.initiallyOpen || true );

    // Create the open/close nodes.
    var openNode = new Rectangle( CONTROL_BUTTON_INSET,
                                  CONTROL_BUTTON_INSET,
                                  CONTROL_BUTTON_DIMENSION,
                                  CONTROL_BUTTON_DIMENSION,
                                  3,
                                  3,
                                  {stroke: 'black', lineWidth: 1, fill: 'green', cursor: 'pointer' } );
    var plusShape = new Shape().moveTo( -CONTROL_BUTTON_SYMBOL_WIDTH / 2, 0 ).
      lineTo( CONTROL_BUTTON_SYMBOL_WIDTH / 2, 0 ).
      moveTo( 0, -CONTROL_BUTTON_SYMBOL_WIDTH / 2 ).
      lineTo( 0, CONTROL_BUTTON_SYMBOL_WIDTH / 2 );
    openNode.addChild( new Path( { shape: plusShape,
                                   lineWidth: SYMBOL_LINE_WIDTH,
                                   stroke: 'white',
                                   center: openNode.center } ) );

    openNode.addInputListener( {down: function() { open.set( true ); }} );

    var closeNode = new Rectangle( CONTROL_BUTTON_INSET,
                                   CONTROL_BUTTON_INSET,
                                   CONTROL_BUTTON_DIMENSION,
                                   CONTROL_BUTTON_DIMENSION,
                                   3,
                                   3,
                                   {stroke: 'black', lineWidth: 1, fill: 'red', cursor: 'pointer'} );
    var minusShape = new Shape().moveTo( -CONTROL_BUTTON_SYMBOL_WIDTH / 2, 0 ).
      lineTo( CONTROL_BUTTON_SYMBOL_WIDTH / 2, 0 );
    closeNode.addChild( new Path( { shape: minusShape,
                                   lineWidth: SYMBOL_LINE_WIDTH,
                                   stroke: 'white',
                                   center: closeNode.center } ) );
    closeNode.addInputListener( {down: function() { open.set( false ); }} );

    var panelWidth = contentNode.width + 2 * CONTENT_INSET;
    var closedHeight = CONTROL_BUTTON_INSET * 2 + closeNode.height;
    var openHeight = CONTROL_BUTTON_INSET * 2 + openNode.height + 2 * CONTENT_INSET + contentNode.height;

    var openContainer = new Rectangle( 0, 0, panelWidth, openHeight, 3, 3,
                                       {
                                         stroke: options.stroke,
                                         lineWidth: options.lineWidth,
                                         fill: options.fill
                                       } );
    openContainer.addChild( closeNode );
    contentNode.center = new Vector2( panelWidth / 2, openHeight - CONTENT_INSET - contentNode.height / 2 );
    openContainer.addChild( contentNode );
    this.addChild( openContainer );

    var closedContainer = new Rectangle( 0, 0, panelWidth, closedHeight, 3, 3,
                                         {
                                           stroke: options.stroke,
                                           lineWidth: options.lineWidth,
                                           fill: options.fill
                                         } );
    closedContainer.addChild( openNode );
    this.addChild( closedContainer );


    // Update the state of this node based on the open/closed state.
    open.link( function( isOpen ) {
      openContainer.visible = isOpen;
      closedContainer.visible = !isOpen;
    } );
  }

  inherit( Node, AccordionBox );

  return AccordionBox;
} );