// Copyright 2002-2013, University of Colorado Boulder

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
  var CONTROL_BUTTON_INSET = 4;
  var TITLE_INSET = 10;
  var CONTROL_BUTTON_DIMENSION = 16; // Can make this an option if desired.
  var CONTROL_BUTTON_SYMBOL_WIDTH = CONTROL_BUTTON_DIMENSION * 0.6;
  var CONTENT_HORIZONTAL_INSET = 15; // Can make this an option if desired.
  var CONTENT_VERTICAL_INSET = 8; // Can make this an option if desired.
  var SYMBOL_LINE_WIDTH = 3;
  var CORNER_ROUNDING = 3;

  /**
   * @param {Node} contentNode that will be shown or hidden as the accordian
   * box is opened/closed.
   * @param {object} options Various key-value pairs that control the
   * appearance and behavior.  These are passed through to the Node super
   * class.  Additional options specific to this class are:
   *    initiallyOpen: boolean, controls initial open/closed state
   *    minWidth: minimum width in pixels.  If none specified, this will be calculated
   *    title: string
   *    buttonPosition: left, right, or center
   *    contentPosition: left, right, or center
   *    titlePosition: left, right, or center
   * @constructor
   */
  function AccordionBox( contentNode, options ) {

    options = _.extend( { // defaults
                          stroke: 'black', // color used to stroke the outer edge of the button
                          lineWidth: 1,
                          fill: 'rgb( 238, 238, 238 )', // default background color
                          font: '20px Arial',
                          contentPosition: 'center',
                          buttonPosition: 'left',
                          titlePosition: 'center'
                        }, options );

    var thisNode = this;
    Node.call( this, options );

    // Create a property that tracks the open/closed state.
    this.open = new Property( options.initiallyOpen !== undefined ? options.initiallyOpen : true );

    // Create the open/close control nodes.
    var openNode = new Rectangle( 0, 0, CONTROL_BUTTON_DIMENSION, CONTROL_BUTTON_DIMENSION, 3, 3,
                                  {
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

    var closeNode = new Rectangle( 0, 0, CONTROL_BUTTON_DIMENSION, CONTROL_BUTTON_DIMENSION, 3, 3,
                                   {
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

    // Create the title, if present.
    var title = new Node();
    if ( options.title !== undefined ) {
      title = new Text( options.title, { font: options.font } );
    }

    // Create the container that will hold the contents when open.
    var containerWidth = Math.max( options.minWidth || 0,
                                   Math.max( contentNode.width + 2 * CONTENT_HORIZONTAL_INSET,
                                             CONTROL_BUTTON_INSET * 2 + CONTROL_BUTTON_DIMENSION + TITLE_INSET * 2 + title.width ) );
    var closedContainerHeight = CONTROL_BUTTON_INSET * 2 + CONTROL_BUTTON_DIMENSION;
    var openContainerHeight = CONTROL_BUTTON_INSET * 2 + CONTROL_BUTTON_DIMENSION + 2 * CONTENT_VERTICAL_INSET + contentNode.height;
    this.openHeight = openContainerHeight; // This needs to be visible externally for layout purposes.

    var openContainer = new Rectangle( 0, 0, containerWidth, openContainerHeight, CORNER_ROUNDING, CORNER_ROUNDING,
                                       {
                                         stroke: options.stroke,
                                         lineWidth: options.lineWidth,
                                         fill: options.fill
                                       } );
    openContainer.addChild( closeNode );
    openContainer.addChild( contentNode );
    openContainer.addChild( title );
    this.addChild( openContainer );

    // Create the node that represents the closed container.
    var closedContainer = new Rectangle( 0, 0, containerWidth, closedContainerHeight, CORNER_ROUNDING, CORNER_ROUNDING,
                                         {
                                           stroke: options.stroke,
                                           lineWidth: options.lineWidth,
                                           fill: options.fill
                                         } );
    closedContainer.addChild( openNode );
    closedContainer.addChild( title );
    this.addChild( closedContainer );

    // If necessary, scale title to fit in available space.
    var availableTitleSpace = containerWidth - CONTROL_BUTTON_INSET - CONTROL_BUTTON_DIMENSION - 2 * TITLE_INSET;
    if ( title.width > availableTitleSpace ) {
      title.scale( availableTitleSpace / title.width );
    }

    // Create an invisible rectangle that allows the user to click on any part
    // of the top of the container (closed or open) in order to toggle the
    // state.
    var openCloseNode = new Rectangle( 0, 0, containerWidth, closedContainerHeight, CORNER_ROUNDING, CORNER_ROUNDING,
                                       {
                                         fill: 'rgba( 0, 0, 0, 0)', // Invisible.
                                         cursor: 'pointer'
                                       } );
    openCloseNode.addInputListener( {down: function() { thisNode.open.set( !thisNode.open.get() ); }} );
    openContainer.addChild( openCloseNode );
    closedContainer.addChild( openCloseNode );

    // Lay out the contents of the containers.
    openNode.top = CONTROL_BUTTON_INSET;
    closeNode.top = CONTROL_BUTTON_INSET;
    title.centerY = openNode.centerY;
    var titleLeftBound = TITLE_INSET;
    var titleRightBound = containerWidth - TITLE_INSET;
    contentNode.bottom = openContainerHeight - CONTENT_VERTICAL_INSET;

    if ( options.buttonPosition === 'left' ) {
      openNode.left = CONTROL_BUTTON_INSET;
      closeNode.left = CONTROL_BUTTON_INSET;
      titleLeftBound = openNode.right + TITLE_INSET;
    }
    else {
      openNode.right = containerWidth - CONTROL_BUTTON_INSET;
      closeNode.right = containerWidth - CONTROL_BUTTON_INSET;
      titleLeftBound = TITLE_INSET;
    }

    if ( options.contentPosition === 'left' ) {
      contentNode.left = CONTENT_HORIZONTAL_INSET;
    }
    else if ( options.contentPosition === 'right' ) {
      contentNode.right = CONTENT_HORIZONTAL_INSET;
    }
    else {
      contentNode.centerX = containerWidth / 2;
    }

    if ( options.titlePosition === 'left' ) {
      title.left = titleLeftBound;
    }
    else if ( options.titlePosition === 'right' ) {
      title.right = titleRightBound;
    }
    else {
      title.centerX = ( titleLeftBound + titleRightBound ) / 2;
    }

    // Update the visibility of the containers based on the open/closed state.
    this.open.link( function( isOpen ) {
      openContainer.visible = isOpen;
      closedContainer.visible = !isOpen;
    } );
  }

  inherit( Node, AccordionBox );

  return AccordionBox;
} );