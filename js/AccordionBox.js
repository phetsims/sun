// Copyright 2002-2013, University of Colorado Boulder

/**
 * Collapsible box that hides/shows contents when closed/open.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // Imports
  var ExpandCollapseButton = require( 'SUN/ExpandCollapseButton' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Property = require( 'AXON/Property' );
  var Shape = require( 'KITE/Shape' );

  // Constants
  var TITLE_INSET = 10;
  var CONTROL_BUTTON_DIMENSION = 16; // Can make this an option if desired.
  var CONTENT_HORIZONTAL_INSET = 15; // Can make this an option if desired.
  var CONTENT_VERTICAL_INSET = 8; // Can make this an option if desired.

  /**
   * @param {Node} contentNode that will be shown or hidden as the accordion
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
      titlePosition: 'center',
      cornerRadius: 3,
      controlButtonInsetX: 4,
      controlButtonInsetY: 4
    }, options );

    var thisNode = this;
    Node.call( this, options );

    // Create a property that tracks the open/closed state.
    this.open = new Property( options.initiallyOpen !== undefined ? options.initiallyOpen : true );

    // Create the expand/collapse button.
    var expandCollapseButton = new ExpandCollapseButton( CONTROL_BUTTON_DIMENSION, this.open );

    // Add an expanded touch area to the expand/collapse button so it works ok
    // on small screens.   Size could be moved into an option if necessary.
    var expandedTouchAreaDimension = CONTROL_BUTTON_DIMENSION * 3;
    expandCollapseButton.touchArea = Shape.rectangle(
      -expandedTouchAreaDimension / 2 + CONTROL_BUTTON_DIMENSION / 2,
      -expandedTouchAreaDimension / 2 + CONTROL_BUTTON_DIMENSION / 2,
      expandedTouchAreaDimension,
      expandedTouchAreaDimension
    );

    // Create the title, if present.
    var title = new Node();
    if ( options.title !== undefined ) {
      title = new Text( options.title, { font: options.font } );
    }

    // Create the container that will hold the contents when open.
    var containerWidth = Math.max( options.minWidth || 0,
      Math.max( contentNode.width + 2 * CONTENT_HORIZONTAL_INSET,
        options.controlButtonInsetX * 2 + CONTROL_BUTTON_DIMENSION + TITLE_INSET * 2 + title.width ) );
    var closedContainerHeight = options.controlButtonInsetY * 2 + CONTROL_BUTTON_DIMENSION;
    var openContainerHeight = options.controlButtonInsetY * 2 + CONTROL_BUTTON_DIMENSION + 2 * CONTENT_VERTICAL_INSET + contentNode.height;
    this.openHeight = openContainerHeight; // This needs to be visible externally for layout purposes.

    var openContainer = new Rectangle( 0, 0, containerWidth, openContainerHeight, options.cornerRadius, options.cornerRadius,
      {
        stroke: options.stroke,
        lineWidth: options.lineWidth,
        fill: options.fill
      } );
    openContainer.addChild( contentNode );
    openContainer.addChild( title );
    openContainer.addChild( expandCollapseButton );
    this.addChild( openContainer );

    // Create the node that represents the closed container.
    var closedContainer = new Rectangle( 0, 0, containerWidth, closedContainerHeight, options.cornerRadius, options.cornerRadius,
      {
        stroke: options.stroke,
        lineWidth: options.lineWidth,
        fill: options.fill
      } );
    closedContainer.addChild( title );
    closedContainer.addChild( expandCollapseButton );
    this.addChild( closedContainer );

    // If necessary, scale title to fit in available space.
    var availableTitleSpace = containerWidth - options.controlButtonInsetX - CONTROL_BUTTON_DIMENSION - 2 * TITLE_INSET;
    if ( title.width > availableTitleSpace ) {
      title.scale( availableTitleSpace / title.width );
    }

    // Create an invisible rectangle that allows the user to click on any part
    // of the top of the container (closed or open) in order to toggle the
    // state.
    var openCloseNode = new Rectangle( 0, 0, containerWidth, closedContainerHeight, options.cornerRadius, options.cornerRadius,
      {
        fill: 'rgba( 0, 0, 0, 0)', // Invisible.
        cursor: 'pointer'
      } );
    openCloseNode.addInputListener( {down: function() { thisNode.open.set( !thisNode.open.get() ); }} );
    openContainer.addChild( openCloseNode );
    closedContainer.addChild( openCloseNode );

    // Lay out the contents of the containers.
    expandCollapseButton.top = options.controlButtonInsetY;
    title.centerY = expandCollapseButton.centerY;
    var titleLeftBound = TITLE_INSET;
    var titleRightBound = containerWidth - TITLE_INSET;
    contentNode.bottom = openContainerHeight - CONTENT_VERTICAL_INSET;

    if ( options.buttonPosition === 'left' ) {
      expandCollapseButton.left = options.controlButtonInsetX;
      titleLeftBound = expandCollapseButton.right + TITLE_INSET;
    }
    else {
      expandCollapseButton.right = containerWidth - options.controlButtonInsetX;
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