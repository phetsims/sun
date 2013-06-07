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
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );

  // Constants
  var CONTROL_BUTTON_INSET = 4; // Can make this an option if desired.
  var CONTROL_BUTTON_DIMENSION = 20; // Can make this an option if desired.
  var CONTROL_BUTTON_SYMBOL_WIDTH = CONTROL_BUTTON_DIMENSION * 0.6;
  var MIN_CONTENT_INSET = 5; // Can make this an option if desired.
  var SYMBOL_LINE_WIDTH = 3;

  /**
   * @param {Node} contentNode that will be vertically centered to the right of the button
   * @param {object} options TODO: Clean up option info.  List: initiallyOpen, minWidth, title
   * @constructor
   */
  function AccordionBox( contentNode, options ) {

    options = _.extend( { // defaults
                          stroke: 'black', // color used to stroke the outer edge of the button
                          lineWidth: 1,
                          fill: 'rgb( 238, 238, 238 )', // default background color
                          font: '20px Tahoma'
                        }, options );

    var thisNode = this;
    Node.call( this, options );

    // Create a property that tracks the open/closed state.
    var open = new Property( options.initiallyOpen || true );

    // Create the open/close control nodes.
    var openNode = new Rectangle( 0, 0, CONTROL_BUTTON_DIMENSION, CONTROL_BUTTON_DIMENSION, 3, 3,
                                  {
                                    cursor: 'pointer',
                                    top: CONTROL_BUTTON_INSET,
                                    left: CONTROL_BUTTON_INSET,
                                    fill: new LinearGradient( 0, 0, CONTROL_BUTTON_DIMENSION, CONTROL_BUTTON_DIMENSION ).
                                      addColorStop( 0, 'rgb(0, 230, 0 )' ).
                                      addColorStop( 1, 'rgb(0, 179, 0 )' )

                                  } );
    var plusSymbolShape = new Shape().
      moveTo( CONTROL_BUTTON_SYMBOL_WIDTH / 2, 0 ).
      lineTo( CONTROL_BUTTON_SYMBOL_WIDTH / 2, CONTROL_BUTTON_SYMBOL_WIDTH ).
      moveTo( 0, CONTROL_BUTTON_SYMBOL_WIDTH / 2 ).
      lineTo( CONTROL_BUTTON_SYMBOL_WIDTH, CONTROL_BUTTON_SYMBOL_WIDTH / 2 );
    openNode.addChild( new Path( { shape: plusSymbolShape,
                                   lineWidth: SYMBOL_LINE_WIDTH,
                                   stroke: 'white',
                                   centerX: CONTROL_BUTTON_DIMENSION / 2,
                                   centerY: CONTROL_BUTTON_DIMENSION / 2
                                 } ) );
    openNode.addInputListener( {down: function() { open.set( true ); }} );

    var closeNode = new Rectangle( 0, 0, CONTROL_BUTTON_DIMENSION, CONTROL_BUTTON_DIMENSION, 3, 3,
                                   {
                                     cursor: 'pointer',
                                     top: CONTROL_BUTTON_INSET,
                                     left: CONTROL_BUTTON_INSET,
                                     fill: new LinearGradient( 0, 0, CONTROL_BUTTON_DIMENSION, CONTROL_BUTTON_DIMENSION ).
                                       addColorStop( 0, 'rgb(255, 26, 26 )' ).
                                       addColorStop( 1, 'rgb(200, 0, 0 )' )
                                   } );
    var minusSymbolShape = new Shape().moveTo( -CONTROL_BUTTON_SYMBOL_WIDTH / 2, 0 ).
      lineTo( CONTROL_BUTTON_SYMBOL_WIDTH / 2, 0 );
    closeNode.addChild( new Path( { shape: minusSymbolShape,
                                    lineWidth: SYMBOL_LINE_WIDTH,
                                    stroke: 'white',
                                    centerX: CONTROL_BUTTON_DIMENSION / 2,
                                    centerY: CONTROL_BUTTON_DIMENSION / 2
                                  } ) );
    closeNode.addInputListener( {down: function() { open.set( false ); }} );

    // Create the container that will hold the contents when open.
    var containerWidth = contentNode.width + 2 * MIN_CONTENT_INSET;
    var closedContainerHeight = CONTROL_BUTTON_INSET * 2 + closeNode.height;
    var openContainerHeight = CONTROL_BUTTON_INSET * 2 + openNode.height + 2 * MIN_CONTENT_INSET + contentNode.height;

    var openContainer = new Rectangle( 0, 0, containerWidth, openContainerHeight, 3, 3,
                                       {
                                         stroke: options.stroke,
                                         lineWidth: options.lineWidth,
                                         fill: options.fill
                                       } );
    openContainer.addChild( closeNode );
    contentNode.center = new Vector2( containerWidth / 2, openContainerHeight - MIN_CONTENT_INSET - contentNode.height / 2 );
    openContainer.addChild( contentNode );
    this.addChild( openContainer );

    // Create the node that represents the closed container.
    var closedContainer = new Rectangle( 0, 0, containerWidth, closedContainerHeight, 3, 3,
                                         {
                                           stroke: options.stroke,
                                           lineWidth: options.lineWidth,
                                           fill: options.fill
                                         } );
    closedContainer.addChild( openNode );
    this.addChild( closedContainer );

    // Update the visibility of the containers based on the open/closed state.
    open.link( function( isOpen ) {
      openContainer.visible = isOpen;
      closedContainer.visible = !isOpen;
    } );
  }

  inherit( Node, AccordionBox );

  return AccordionBox;
} );