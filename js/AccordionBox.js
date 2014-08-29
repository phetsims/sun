// Copyright 2002-2013, University of Colorado Boulder

/**
 * Box that can be expanded/collapsed to show/hide contents.
 *
 * @author John Blanco
 * @author Chris Malley (PixelZoom, Inc.)
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
      minWidth: 0,

      // title
      titleNode: new Text( '' ), // a {Node} with well-defined bounds
      titleAlign: 'center', // horizontal alignment of the title, 'left'|'center'|'right'
      titleXMargin: 10,
      titleYMargin: 10,
      showTitleWhenExpanded: true, // true = title is visible when expanded, false = title is hidden when expanded

      // expand/collapse button
      buttonLength: 16, // button is a square, this is the length of one side
      buttonAlign: 'left',  // button alignment, 'left'|'right'
      buttonXMargin: 4,
      buttonYMargin: 4,
      expandedProperty: new Property( true ),
      buttonTouchAreaDilatedX: 16,
      buttonTouchAreaDilatedY: 16,
      buttonMouseAreaDilatedX: 0,
      buttonMouseAreaDilatedY: 0,

      // content
      contentAlign: 'center', // horizontal alignment of the content, 'left'|'center'|'right'
      contentXMargin: 15,
      contentYMargin: 8

    }, options );
    this.options = options; // @private

    Node.call( this );

    // Expand/collapse button
    var expandCollapseButton = new ExpandCollapseButton( options.expandedProperty, { sideLength: options.buttonLength } );
    expandCollapseButton.touchArea = expandCollapseButton.localBounds.dilatedXY( options.buttonTouchAreaDilatedX, options.buttonTouchAreaDilatedY );
    expandCollapseButton.mouseArea = expandCollapseButton.localBounds.dilatedXY( options.buttonMouseAreaDilatedX, options.buttonMouseAreaDilatedY );

    // Expanded box
    var boxWidth = Math.max( options.minWidth, options.buttonXMargin * 2 + options.buttonLength + options.titleXMargin * 2 + options.titleNode.width );
    if ( options.showTitleWhenExpanded ) {
      boxWidth = Math.max( boxWidth, contentNode.width + 2 * options.contentXMargin );
    }
    else {
      boxWidth = Math.max( boxWidth, options.buttonXMargin * 2 + options.buttonLength + options.contentXMargin * 2 + contentNode.width );
    }
    var collapsedBoxHeight = options.buttonYMargin * 2 + options.buttonLength;
    var expandedBoxHeight = 2 * options.contentYMargin + contentNode.height;
    if ( options.showTitleWhenExpanded ) {
      expandedBoxHeight += options.buttonYMargin * 2 + options.buttonLength;
    }
    this.expandedHeight = expandedBoxHeight; // @public This needs to be visible externally for layout purposes.

    var expandedBox = new Rectangle( 0, 0, boxWidth, expandedBoxHeight, options.cornerRadius, options.cornerRadius,
      {
        stroke: options.stroke,
        lineWidth: options.lineWidth,
        fill: options.fill
      } );
    expandedBox.addChild( contentNode );
    expandedBox.addChild( options.titleNode );
    expandedBox.addChild( expandCollapseButton );
    this.addChild( expandedBox );

    // Collapsed box
    var collapsedBox = new Rectangle( 0, 0, boxWidth, collapsedBoxHeight, options.cornerRadius, options.cornerRadius,
      {
        stroke: options.stroke,
        lineWidth: options.lineWidth,
        fill: options.fill
      } );
    collapsedBox.addChild( options.titleNode );
    collapsedBox.addChild( expandCollapseButton );
    this.addChild( collapsedBox );

    // Invisible rectangle at top that operates like expand/collapse button
    var expandCollapseBar = new Rectangle( 0, 0, boxWidth, collapsedBoxHeight, options.cornerRadius, options.cornerRadius,
      {
        fill: 'rgba( 0, 0, 0, 0)', // Invisible.
        cursor: 'pointer'
      } );
    expandCollapseBar.addInputListener( {down: function() { options.expandedProperty.set( !options.expandedProperty.get() ); }} );
    expandedBox.addChild( expandCollapseBar );
    collapsedBox.addChild( expandCollapseBar );

    // Layout
    expandCollapseButton.top = options.buttonYMargin;
    contentNode.bottom = expandedBoxHeight - options.contentYMargin;
    var contentXSpanMin = options.contentXMargin;
    var contentXSpanMax = boxWidth - options.contentXMargin;
    if ( !options.showTitleWhenExpanded && options.buttonAlign === 'left' ) {
      if ( options.buttonAlign === 'left' ) {
        contentXSpanMin += options.buttonXMargin * 2 + options.buttonLength;
      }
      else if ( options.buttonAlign === 'left' ) {
        contentXSpanMax -= options.buttonXMargin * 2 + options.buttonLength;
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

    //TODO this is currently ignoring scale issues in the y dimension
    // title scale
    options.titleNode.resetTransform();
    var availableTitleSpace = boxWidth - this.options.buttonXMargin - options.buttonLength - ( 2 * options.titleXMargin );
    if ( options.titleNode.width > availableTitleSpace ) {
      options.titleNode.scale( availableTitleSpace / options.titleNode.width );
    }

    // title location
    var titleLeftBound = options.titleXMargin;
    var titleRightBound = boxWidth - options.titleXMargin;
    if ( options.buttonAlign === 'left' ) {
      expandCollapseButton.left = options.buttonXMargin;
      titleLeftBound = expandCollapseButton.right + options.titleXMargin;
    }
    else {
      expandCollapseButton.right = boxWidth - options.buttonXMargin;
      titleLeftBound = options.titleXMargin;
    }
    options.titleNode.centerY = expandCollapseButton.centerY;
    if ( this.options.titleAlign === 'left' ) {
      options.titleNode.left = titleLeftBound;
    }
    else if ( this.options.titleAlign === 'right' ) {
      options.titleNode.right = titleRightBound;
    }
    else {
      options.titleNode.centerX = ( titleLeftBound + titleRightBound ) / 2;
    }

    // Update the visibility of the boxes and title based on the expanded/collapsed state.
    options.expandedProperty.link( function( expanded ) {
      expandedBox.visible = expanded;
      collapsedBox.visible = !expanded;
      options.titleNode.visible = !expanded || options.showTitleWhenExpanded;
    } );

    this.mutate( options );
  }

  return inherit( Node, AccordionBox );
} );