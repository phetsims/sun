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

  /**
   * @param {Node} contentNode that will be shown or hidden as the accordion box is opened/closed.
   * @param {Object} options Various key-value pairs that control the appearance and behavior.  Some options are
   * specific to this class while some are passed to the superclass.  See the code where the options are set in the
   * early portion of the constructor for details.
   * @constructor
   */
  function AccordionBox( contentNode, options ) {

    options = _.extend( {
      // defaults
      stroke: 'black', // color used to stroke the outer edge of the container
      lineWidth: 1,
      fill: 'rgb( 238, 238, 238 )', // background color
      font: '20px Arial',
      contentPosition: 'center',
      buttonPosition: 'left',
      titlePosition: 'center',
      cornerRadius: 3,
      controlButtonXMargin: 4,
      controlButtonYMargin: 4,
      contentXMargin: 15,
      contentYMargin: 8,
      titleFill: 'black',
      title: undefined,
      showTitleWhenOpen: true
    }, options );
    this.options = options;

    var thisNode = this;
    Node.call( this, options );

    // Create a property that tracks the open/closed state.
    this.open = new Property( options.initiallyOpen !== undefined ? options.initiallyOpen : true );

    // Create the expand/collapse button.
    this.expandCollapseButton = new ExpandCollapseButton( this.open, { sideLength: CONTROL_BUTTON_DIMENSION } );

    // Add an expanded touch area to the expand/collapse button so it works well on small screens.   Size could be
    // moved into an option if necessary.
    var expandedTouchAreaDimension = CONTROL_BUTTON_DIMENSION * 3;
    this.expandCollapseButton.touchArea = Shape.rectangle(
        -expandedTouchAreaDimension / 2 + CONTROL_BUTTON_DIMENSION / 2,
        -expandedTouchAreaDimension / 2 + CONTROL_BUTTON_DIMENSION / 2,
      expandedTouchAreaDimension,
      expandedTouchAreaDimension
    );

    // Create the titleNode, if present.
    var titleNode = new Node();
    if ( options.title !== undefined ) {
      titleNode = new Text( options.title, { font: options.font, fill: options.titleFill } );
      this.titleNode = titleNode;
    }

    // Control title visibility, if applicable.
    if ( !options.showTitleWhenOpen ) {
      this.open.link( function( open ) {
        titleNode.visible = !open;
      } );
    }

    // Create the container that will hold the contents when open.
    this.containerWidth = Math.max( options.minWidth || 0, options.controlButtonXMargin * 2 + CONTROL_BUTTON_DIMENSION + TITLE_INSET * 2 + titleNode.width );
    if ( options.showTitleWhenOpen ) {
      this.containerWidth = Math.max( this.containerWidth, contentNode.width + 2 * options.contentXMargin );
    }
    else {
      this.containerWidth = Math.max( this.containerWidth, options.controlButtonXMargin * 2 + CONTROL_BUTTON_DIMENSION + options.contentXMargin * 2 + contentNode.width );
    }
    var closedContainerHeight = options.controlButtonYMargin * 2 + CONTROL_BUTTON_DIMENSION;
    var openContainerHeight = 2 * options.contentYMargin + contentNode.height;
    if ( options.showTitleWhenOpen ) {
      openContainerHeight += options.controlButtonYMargin * 2 + CONTROL_BUTTON_DIMENSION;
    }
    this.openHeight = openContainerHeight; // This needs to be visible externally for layout purposes.

    var openContainer = new Rectangle( 0, 0, this.containerWidth, openContainerHeight, options.cornerRadius, options.cornerRadius,
      {
        stroke: options.stroke,
        lineWidth: options.lineWidth,
        fill: options.fill
      } );
    openContainer.addChild( contentNode );
    openContainer.addChild( titleNode );
    openContainer.addChild( this.expandCollapseButton );
    this.addChild( openContainer );

    // Create the node that represents the closed container.
    var closedContainer = new Rectangle( 0, 0, this.containerWidth, closedContainerHeight, options.cornerRadius, options.cornerRadius,
      {
        stroke: options.stroke,
        lineWidth: options.lineWidth,
        fill: options.fill
      } );
    closedContainer.addChild( titleNode );
    closedContainer.addChild( this.expandCollapseButton );
    this.addChild( closedContainer );

    // If necessary, scale titleNode to fit in available space.
    this.adjustTitleNodeSize();

    // Create an invisible rectangle that allows the user to click on any part of the top of the container (closed or
    // open) in order to toggle the state.
    var openCloseNode = new Rectangle( 0, 0, this.containerWidth, closedContainerHeight, options.cornerRadius, options.cornerRadius,
      {
        fill: 'rgba( 0, 0, 0, 0)', // Invisible.
        cursor: 'pointer'
      } );
    openCloseNode.addInputListener( {down: function() { thisNode.open.set( !thisNode.open.get() ); }} );
    openContainer.addChild( openCloseNode );
    closedContainer.addChild( openCloseNode );

    // Lay out the contents of the containers.
    this.expandCollapseButton.top = options.controlButtonYMargin;
    this.titleLeftBound = TITLE_INSET;
    this.titleRightBound = this.containerWidth - TITLE_INSET;
    contentNode.bottom = openContainerHeight - options.contentYMargin;

    if ( options.buttonPosition === 'left' ) {
      this.expandCollapseButton.left = options.controlButtonXMargin;
      this.titleLeftBound = this.expandCollapseButton.right + TITLE_INSET;
    }
    else {
      this.expandCollapseButton.right = this.containerWidth - options.controlButtonXMargin;
      this.titleLeftBound = TITLE_INSET;
    }

    var contentXSpanMin = options.contentXMargin;
    var contentXSpanMax = this.containerWidth - options.contentXMargin;
    if ( !options.showTitleWhenOpen && options.buttonPosition === 'left' ) {
      if ( options.buttonPosition === 'left' ) {
        contentXSpanMin += options.controlButtonXMargin * 2 + CONTROL_BUTTON_DIMENSION;
      }
      else if ( options.buttonPosition === 'left' ) {
        contentXSpanMax -= options.controlButtonXMargin * 2 + CONTROL_BUTTON_DIMENSION;
      }
    }
    if ( options.contentPosition === 'left' ) {
      contentNode.left = contentXSpanMin;
    }
    else if ( options.contentPosition === 'right' ) {
      contentNode.right = contentXSpanMax;
    }
    else {
      contentNode.centerX = ( contentXSpanMin + contentXSpanMax ) / 2;
    }

    this.updateTitleLocation();

    // Update the visibility of the containers based on the open/closed state.
    this.open.link( function( isOpen ) {
      openContainer.visible = isOpen;
      closedContainer.visible = !isOpen;
    } );
  }

  return inherit( Node, AccordionBox, {
    set title( t ) {
      this.titleNode.text = t;
      this.adjustTitleNodeSize();
      this.updateTitleLocation();
    },

    //TODO: What to do if no titleNode?
    get title() {
      return this.titleNode.text;
    },

    updateTitleLocation: function() {
      this.titleNode.centerY = this.expandCollapseButton.centerY;
      if ( this.options.titlePosition === 'left' ) {
        this.titleNode.left = this.titleLeftBound;
      }
      else if ( this.options.titlePosition === 'right' ) {
        this.titleNode.right = this.titleRightBound;
      }
      else {
        this.titleNode.centerX = ( this.titleLeftBound + this.titleRightBound ) / 2;
      }
    },

    adjustTitleNodeSize: function() {
      this.titleNode.resetTransform();
      var availableTitleSpace = this.containerWidth - this.options.controlButtonXMargin - CONTROL_BUTTON_DIMENSION - 2 * TITLE_INSET;
      if ( this.titleNode.width > availableTitleSpace ) {
        this.titleNode.scale( availableTitleSpace / this.titleNode.width );
      }
    }
  } );
} );