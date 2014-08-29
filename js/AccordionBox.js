// Copyright 2002-2013, University of Colorado Boulder

/**
 * Collapsible box that show/hides contents when expanded/collapsed.
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
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );

  // Constants
  var TITLE_X_MARGIN = 10;
  var BUTTON_SIZE = 16; // Can make this an option if desired.

  /**
   * @param {Node} contentNode that will be shown or hidden as the accordion box is expanded/collapsed.
   * @param {*} options Various key-value pairs that control the appearance and behavior.  Some options are
   * specific to this class while some are passed to the superclass.  See the code where the options are set in the
   * early portion of the constructor for details.
   * @constructor
   */
  function AccordionBox( contentNode, options ) {

    options = _.extend( {

      // box
      stroke: 'black',
      lineWidth: 1,
      fill: 'rgb( 238, 238, 238 )',
      cornerRadius: 3,
      initiallyExpanded: true,

      // title
      title: undefined, // title {string}  //TODO support {Node}
      font: new PhetFont( 20 ),
      titleAlign: 'center', // horizontal alignment of the title, 'left'|'center'|'right'
      titleFill: 'black',
      showTitleWhenExpanded: true,

      // expand/collapse button
      buttonAlign: 'left',  // button alignment, 'left'|'right'
      buttonXMargin: 4,
      buttonYMargin: 4,

      // content
      contentAlign: 'center', // horizontal alignment of the content, 'left'|'center'|'right'
      contentXMargin: 15,
      contentYMargin: 8

    }, options );
    this.options = options; // @private

    var thisNode = this;
    Node.call( this, options );

    // Create a property that tracks the expanded/collapsed state.
    this.expandedProperty = new Property( options.initiallyExpanded );

    // @private Create the expand/collapse button.
    this.expandCollapseButton = new ExpandCollapseButton( this.expandedProperty, { sideLength: BUTTON_SIZE } );

    // Add an expanded touch area to the expand/collapse button so it works well on small screens.   Size could be
    // moved into an option if necessary.
    var expandedTouchAreaDimension = BUTTON_SIZE * 3;
    this.expandCollapseButton.touchArea = Shape.rectangle(
        -expandedTouchAreaDimension / 2 + BUTTON_SIZE / 2,
        -expandedTouchAreaDimension / 2 + BUTTON_SIZE / 2,
      expandedTouchAreaDimension,
      expandedTouchAreaDimension
    );

    // Create the titleNode, if present.
    var titleNode = new Node();
    if ( options.title !== undefined ) {
      titleNode = new Text( options.title, { font: options.font, fill: options.titleFill } );
      this.titleNode = titleNode;
    }

    // @private Create the box that will hold the contents when expanded.
    this.boxWidth = Math.max( options.minWidth || 0, options.buttonXMargin * 2 + BUTTON_SIZE + TITLE_X_MARGIN * 2 + titleNode.width );
    if ( options.showTitleWhenExpanded ) {
      this.boxWidth = Math.max( this.boxWidth, contentNode.width + 2 * options.contentXMargin );
    }
    else {
      this.boxWidth = Math.max( this.boxWidth, options.buttonXMargin * 2 + BUTTON_SIZE + options.contentXMargin * 2 + contentNode.width );
    }
    var collapsedBoxHeight = options.buttonYMargin * 2 + BUTTON_SIZE;
    var expandedBoxHeight = 2 * options.contentYMargin + contentNode.height;
    if ( options.showTitleWhenExpanded ) {
      expandedBoxHeight += options.buttonYMargin * 2 + BUTTON_SIZE;
    }
    this.expandedHeight = expandedBoxHeight; // @public This needs to be visible externally for layout purposes.

    var expandedBox = new Rectangle( 0, 0, this.boxWidth, expandedBoxHeight, options.cornerRadius, options.cornerRadius,
      {
        stroke: options.stroke,
        lineWidth: options.lineWidth,
        fill: options.fill
      } );
    expandedBox.addChild( contentNode );
    expandedBox.addChild( titleNode );
    expandedBox.addChild( this.expandCollapseButton );
    this.addChild( expandedBox );

    // Create the node that represents the collapsed box.
    var collapsedBox = new Rectangle( 0, 0, this.boxWidth, collapsedBoxHeight, options.cornerRadius, options.cornerRadius,
      {
        stroke: options.stroke,
        lineWidth: options.lineWidth,
        fill: options.fill
      } );
    collapsedBox.addChild( titleNode );
    collapsedBox.addChild( this.expandCollapseButton );
    this.addChild( collapsedBox );

    // If necessary, scale titleNode to fit in available space.
    this.adjustTitleNodeSize();

    // Create an invisible rectangle that allows the user to click on any part of the top of the box (expanded or
    // collapsed) in order to toggle the state.
    var expandCollapseBar = new Rectangle( 0, 0, this.boxWidth, collapsedBoxHeight, options.cornerRadius, options.cornerRadius,
      {
        fill: 'rgba( 0, 0, 0, 0)', // Invisible.
        cursor: 'pointer'
      } );
    expandCollapseBar.addInputListener( {down: function() { thisNode.expandedProperty.set( !thisNode.expandedProperty.get() ); }} );
    expandedBox.addChild( expandCollapseBar );
    collapsedBox.addChild( expandCollapseBar );

    // Lay out the contents of the boxes.
    this.expandCollapseButton.top = options.buttonYMargin;
    this.titleLeftBound = TITLE_X_MARGIN;
    this.titleRightBound = this.boxWidth - TITLE_X_MARGIN;
    contentNode.bottom = expandedBoxHeight - options.contentYMargin;

    if ( options.buttonAlign === 'left' ) {
      this.expandCollapseButton.left = options.buttonXMargin;
      this.titleLeftBound = this.expandCollapseButton.right + TITLE_X_MARGIN;
    }
    else {
      this.expandCollapseButton.right = this.boxWidth - options.buttonXMargin;
      this.titleLeftBound = TITLE_X_MARGIN;
    }

    var contentXSpanMin = options.contentXMargin;
    var contentXSpanMax = this.boxWidth - options.contentXMargin;
    if ( !options.showTitleWhenExpanded && options.buttonAlign === 'left' ) {
      if ( options.buttonAlign === 'left' ) {
        contentXSpanMin += options.buttonXMargin * 2 + BUTTON_SIZE;
      }
      else if ( options.buttonAlign === 'left' ) {
        contentXSpanMax -= options.buttonXMargin * 2 + BUTTON_SIZE;
      }
    }
    if ( options.contentAlign === 'left' ) {
      contentNode.left = contentXSpanMin;
    }
    else if ( options.contentAlign === 'right' ) {
      contentNode.right = contentXSpanMax;
    }
    else {
      contentNode.centerX = ( contentXSpanMin + contentXSpanMax ) / 2;
    }

    this.updateTitleLocation();

    // Update the visibility of the boxes and title based on the expanded/collapsed state.
    this.expandedProperty.link( function( expanded ) {
      expandedBox.visible = expanded;
      collapsedBox.visible = !expanded;
      titleNode.visible = !expanded || options.showTitleWhenExpanded;
    } );
  }

  return inherit( Node, AccordionBox, {
    set title( t ) {
      this.titleNode.text = t;
      this.adjustTitleNodeSize();
      this.updateTitleLocation();
    },

    get title() {
      return this.options.title;
    },

    updateTitleLocation: function() {
      this.titleNode.centerY = this.expandCollapseButton.centerY;
      if ( this.options.titleAlign === 'left' ) {
        this.titleNode.left = this.titleLeftBound;
      }
      else if ( this.options.titleAlign === 'right' ) {
        this.titleNode.right = this.titleRightBound;
      }
      else {
        this.titleNode.centerX = ( this.titleLeftBound + this.titleRightBound ) / 2;
      }
    },

    //TODO this is currently ignoring scale issues in the y dimension
    adjustTitleNodeSize: function() {
      this.titleNode.resetTransform();
      var availableTitleSpace = this.boxWidth - this.options.buttonXMargin - BUTTON_SIZE - 2 * TITLE_X_MARGIN;
      if ( this.titleNode.width > availableTitleSpace ) {
        this.titleNode.scale( availableTitleSpace / this.titleNode.width );
      }
    }
  } );
} );