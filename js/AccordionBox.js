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

  /**
   * @param {Node} contentNode that will be shown or hidden as the accordion box is expanded/collapsed.
   * @param {Object} options Various key-value pairs that control the appearance and behavior.  Some options are specific
   * to this class while some are passed to the superclass.  See the code where the options are set in the early
   * portion of the constructor for details.
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
      titleXMargin: 10, // horizontal space between title and left|right edge of box
      titleYMargin: 2, // vertical space between title and top of box
      titleXSpacing: 5, // horizontal space between title and expand/collapse button
      showTitleWhenExpanded: true, // true = title is visible when expanded, false = title is hidden when expanded

      // expand/collapse button
      buttonLength: 16, // button is a square, this is the length of one side
      buttonAlign: 'left',  // button alignment, 'left'|'right'
      buttonXMargin: 4, // horizontal space between button and left|right edge of box
      buttonYMargin: 2, // vertical space between button and top edge of box
      expandedProperty: new Property( true ),
      buttonTouchAreaDilatedX: 16,
      buttonTouchAreaDilatedY: 16,
      buttonMouseAreaDilatedX: 0,
      buttonMouseAreaDilatedY: 0,

      // content
      contentAlign: 'center', // horizontal alignment of the content, 'left'|'center'|'right'
      contentXMargin: 15, // horizontal space between content and left/right edges of box
      contentYMargin: 8,  // horizontal space between content and bottom edge of box
      contentXSpacing: 5, // horizontal space between content and button, ignored if showTitleWhenExpanded is true
      contentYSpacing: 8 // vertical space between content and title+button, ignored if showTitleWhenExpanded is false

    }, options );

    // verify string options
    assert && assert( options.buttonAlign === 'left' || options.buttonAlign === 'right' );
    assert && assert( options.contentAlign === 'left' || options.contentAlign === 'right' || options.contentAlign === 'center' );
    assert && assert( options.titleAlign === 'left' || options.titleAlign === 'right' || options.titleAlign === 'center' );

    Node.call( this );

    // Expand/collapse button
    var expandCollapseButton = new ExpandCollapseButton( options.expandedProperty, { sideLength: options.buttonLength } );
    expandCollapseButton.touchArea = expandCollapseButton.localBounds.dilatedXY( options.buttonTouchAreaDilatedX, options.buttonTouchAreaDilatedY );
    expandCollapseButton.mouseArea = expandCollapseButton.localBounds.dilatedXY( options.buttonMouseAreaDilatedX, options.buttonMouseAreaDilatedY );

    // Compute box dimensions
    var collapsedBoxHeight = Math.max( expandCollapseButton.height + ( 2 * options.buttonYMargin ), options.titleNode.height + ( 2 * options.titleYMargin ) );
    var boxWidth = Math.max( options.minWidth, expandCollapseButton.width + options.titleNode.width + options.buttonXMargin + options.titleXMargin + options.titleXSpacing );
    var expandedBoxHeight;
    if ( options.showTitleWhenExpanded ) {
      // content is below button+title
      boxWidth = Math.max( boxWidth, contentNode.width + ( 2 * options.contentXMargin ) );
      expandedBoxHeight = collapsedBoxHeight + contentNode.height + options.contentYMargin + options.contentYSpacing;
    }
    else {
      // content is next to button
      boxWidth = Math.max( boxWidth, expandCollapseButton.width + contentNode.width + options.buttonXMargin + options.contentXMargin + options.contentXSpacing );
      expandedBoxHeight = Math.max( expandCollapseButton.height + ( 2 * options.buttonYMargin ), contentNode.height + ( 2 * options.contentYMargin ) );
    }
    this.expandedHeight = expandedBoxHeight; // @public This needs to be visible externally for layout purposes.

    // Options common to both boxes
    var boxOptions = {
      stroke: options.stroke,
      lineWidth: options.lineWidth,
      fill: options.fill
    };

    // Expanded box
    var expandedBox = new Rectangle( 0, 0, boxWidth, expandedBoxHeight, options.cornerRadius, options.cornerRadius, boxOptions );
    expandedBox.addChild( contentNode );
    this.addChild( expandedBox );

    // Collapsed box
    var collapsedBox = new Rectangle( 0, 0, boxWidth, collapsedBoxHeight, options.cornerRadius, options.cornerRadius, boxOptions );
    this.addChild( collapsedBox );

    // Invisible rectangle at top that operates like expand/collapse button
    var expandCollapseBar = new Rectangle( 0, 0, boxWidth, collapsedBoxHeight, options.cornerRadius, options.cornerRadius, {
      fill: 'rgba( 0, 0, 0, 0)', // Invisible.
      cursor: 'pointer'
    } );
    expandCollapseBar.addInputListener( {
      down: function() {
        options.expandedProperty.value = !options.expandedProperty.value;
      }
    } );
    this.addChild( expandCollapseBar );

    this.addChild( options.titleNode );
    this.addChild( expandCollapseButton );

    // content layout
    contentNode.bottom = expandedBox.bottom - options.contentYMargin;
    var contentSpanLeft = expandedBox.left + options.contentXMargin;
    var contentSpanRight = expandedBox.right - options.contentXMargin;
    if ( !options.showTitleWhenExpanded ) {
      // content will be placed next to button
      if ( options.buttonAlign === 'left' ) {
        contentSpanLeft += expandCollapseButton.width + options.contentXSpacing;
      }
      else { // right on right
        contentSpanRight -= expandCollapseButton.width + options.contentXSpacing;
      }
    }
    if ( options.contentAlign === 'left' ) {
      contentNode.left = contentSpanLeft;
    }
    else if ( options.contentAlign === 'right' ) {
      contentNode.right = contentSpanRight;
    }
    else { // center
      contentNode.centerX = ( contentSpanLeft + contentSpanRight ) / 2;
    }

    // button & title layout
    expandCollapseButton.centerY = options.titleNode.centerY = collapsedBox.centerY;
    var titleLeftSpan = expandedBox.left + options.titleXMargin;
    var titleRightSpan = expandedBox.right - options.titleXMargin;
    if ( options.buttonAlign === 'left' ) {
      expandCollapseButton.left = expandedBox.left + options.buttonXMargin;
      titleLeftSpan = expandCollapseButton.right + options.titleXSpacing;
    }
    else {
      expandCollapseButton.right = expandedBox.right - options.buttonXMargin;
      titleRightSpan = expandCollapseButton.left - options.titleXSpacing;
    }
    if ( options.titleAlign === 'left' ) {
      options.titleNode.left = titleLeftSpan;
    }
    else if ( options.titleAlign === 'right' ) {
      options.titleNode.right = titleRightSpan;
    }
    else { // center
      options.titleNode.centerX = expandedBox.centerX;
    }

    // Update the visibility of the boxes based on the expanded/collapsed state.
    var expandedPropertyObserver = function( expanded ) {
      expandedBox.visible = expanded;
      collapsedBox.visible = !expanded;
      options.titleNode.visible = ( expanded && options.showTitleWhenExpanded ) || !expanded;
    };
    options.expandedProperty.link( expandedPropertyObserver );

    // @public Unlinks from expandedProperty. The node is no longer functional after calling this function.
    this.unlink = function() {
      options.expandedProperty.unlink( expandedPropertyObserver );
    };

    this.mutate( options );
  }

  return inherit( Node, AccordionBox );
} );