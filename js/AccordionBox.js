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
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Property = require( 'AXON/Property' );

  /**
   * @param {Node} contentNode that will be shown or hidden as the accordion box is expanded/collapsed.
   * @param {Object} [options] Various key-value pairs that control the appearance and behavior.  Some options are
   * specific to this class while some are passed to the superclass.  See the code where the options are set in the
   * early portion of the constructor for details.
   * @constructor
   */
  function AccordionBox( contentNode, options ) {

    options = _.extend( {

      // applied to multiple parts of this UI component
      cursor: 'pointer', // {string} default cursor
      lineWidth: 1,
      cornerRadius: 3,

      // box
      stroke: 'black',
      fill: 'rgb( 238, 238, 238 )',
      minWidth: 0,

      // title
      titleNode: new Text( '' ), // a {Node} with well-defined bounds
      titleAlign: 'center', // horizontal alignment of the title, 'left'|'center'|'right'
      titleXMargin: 10, // horizontal space between title and left|right edge of box
      titleYMargin: 2, // vertical space between title and top of box
      titleXSpacing: 5, // horizontal space between title and expand/collapse button
      showTitleWhenExpanded: true, // true = title is visible when expanded, false = title is hidden when expanded
      titleBarFill: null, // {Color|String} title bar fill
      titleBarStroke: null, // {Color|String} title bar stroke, used only for the expanded title bar

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

    // @private Expand/collapse button, links to expandedProperty, must be disposed of
    this.expandCollapseButton = new ExpandCollapseButton( options.expandedProperty, {
      sideLength: options.buttonLength,
      cursor: options.cursor
    } );
    this.expandCollapseButton.touchArea = this.expandCollapseButton.localBounds.dilatedXY( options.buttonTouchAreaDilatedX, options.buttonTouchAreaDilatedY );
    this.expandCollapseButton.mouseArea = this.expandCollapseButton.localBounds.dilatedXY( options.buttonMouseAreaDilatedX, options.buttonMouseAreaDilatedY );

    // Compute box dimensions
    var collapsedBoxHeight = Math.max( this.expandCollapseButton.height + ( 2 * options.buttonYMargin ), options.titleNode.height + ( 2 * options.titleYMargin ) );
    assert && assert( options.cornerRadius < collapsedBoxHeight / 2 );
    var boxWidth = Math.max( options.minWidth, this.expandCollapseButton.width + options.titleNode.width + options.buttonXMargin + options.titleXMargin + options.titleXSpacing );
    var expandedBoxHeight;
    if ( options.showTitleWhenExpanded ) {
      // content is below button+title
      boxWidth = Math.max( boxWidth, contentNode.width + ( 2 * options.contentXMargin ) );
      expandedBoxHeight = collapsedBoxHeight + contentNode.height + options.contentYMargin + options.contentYSpacing;
    }
    else {
      // content is next to button
      boxWidth = Math.max( boxWidth, this.expandCollapseButton.width + contentNode.width + options.buttonXMargin + options.contentXMargin + options.contentXSpacing );
      expandedBoxHeight = Math.max( this.expandCollapseButton.height + ( 2 * options.buttonYMargin ), contentNode.height + ( 2 * options.contentYMargin ) );
    }

    // Expanded box
    var boxOptions = { fill: options.fill };
    var expandedBox = new Rectangle( 0, 0, boxWidth, expandedBoxHeight, options.cornerRadius, options.cornerRadius, boxOptions );
    expandedBox.addChild( contentNode );
    this.addChild( expandedBox );

    // Collapsed box
    var collapsedBox = new Rectangle( 0, 0, boxWidth, collapsedBoxHeight, options.cornerRadius, options.cornerRadius, boxOptions );
    this.addChild( collapsedBox );

    // Expanded title bar has rounded top corners, square bottom corners. Clicking it operates like expand/collapse button.
    var expandedTitleBar = null;
    var expandedTitleBarOptions = {
      fill: options.titleBarFill,
      stroke: options.titleBarStroke,
      lineWidth: options.lineWidth, // use same lineWidth as box, for consistent look
      cursor: options.cursor
    };
    if ( options.cornerRadius === 0 || !options.titleBarFill ) {
      // no rounded corners or no title bar visible, so use a Rectangle
      expandedTitleBar = new Rectangle( 0, 0, boxWidth, collapsedBoxHeight, expandedTitleBarOptions );
    }
    else {
      // rounded top corners, square bottom corners (start at bottom left and move clockwise)
      expandedTitleBar = new Path( new Shape()
          .moveTo( 0, collapsedBoxHeight )
          .lineTo( 0, options.cornerRadius )
          .arc( options.cornerRadius, options.cornerRadius, options.cornerRadius, Math.PI, 1.5 * Math.PI )
          .lineTo( boxWidth - options.cornerRadius, 0 )
          .arc( boxWidth - options.cornerRadius, options.cornerRadius, options.cornerRadius, 1.5 * Math.PI, 0 )
          .lineTo( boxWidth, collapsedBoxHeight )
          .close(),
        expandedTitleBarOptions );
    }
    expandedBox.addChild( expandedTitleBar );
    expandedTitleBar.addInputListener( {
      down: function() {
        options.expandedProperty.value = false;
      }
    } );

    // Collapsed title bar has corners that match the box. Clicking it operates like expand/collapse button.
    var collapsedTitleBar = new Rectangle( 0, 0, boxWidth, collapsedBoxHeight, options.cornerRadius, options.cornerRadius, {
      fill: options.titleBarFill,
      cursor: options.cursor
    } );
    collapsedBox.addChild( collapsedTitleBar );
    collapsedTitleBar.addInputListener( {
      down: function() {
        options.expandedProperty.value = true;
      }
    } );

    this.addChild( options.titleNode );
    this.addChild( this.expandCollapseButton );

    // box outline, on top of everything else
    var expandedBoxOutline, collapsedBoxOutline;
    if ( options.stroke ) {
      var outlineOptions = { stroke: options.stroke, lineWidth: options.lineWidth };
      expandedBoxOutline = new Rectangle( 0, 0, boxWidth, expandedBoxHeight, options.cornerRadius, options.cornerRadius, outlineOptions );
      collapsedBoxOutline = new Rectangle( 0, 0, boxWidth, collapsedBoxHeight, options.cornerRadius, options.cornerRadius, outlineOptions );
      expandedBox.addChild( expandedBoxOutline );
      collapsedBox.addChild( collapsedBoxOutline );
    }

    // content layout
    contentNode.bottom = expandedBox.bottom - options.contentYMargin;
    var contentSpanLeft = expandedBox.left + options.contentXMargin;
    var contentSpanRight = expandedBox.right - options.contentXMargin;
    if ( !options.showTitleWhenExpanded ) {
      // content will be placed next to button
      if ( options.buttonAlign === 'left' ) {
        contentSpanLeft += this.expandCollapseButton.width + options.contentXSpacing;
      }
      else { // right on right
        contentSpanRight -= this.expandCollapseButton.width + options.contentXSpacing;
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
    this.expandCollapseButton.centerY = options.titleNode.centerY = collapsedBox.centerY;
    var titleLeftSpan = expandedBox.left + options.titleXMargin;
    var titleRightSpan = expandedBox.right - options.titleXMargin;
    if ( options.buttonAlign === 'left' ) {
      this.expandCollapseButton.left = expandedBox.left + options.buttonXMargin;
      titleLeftSpan = this.expandCollapseButton.right + options.titleXSpacing;
    }
    else {
      this.expandCollapseButton.right = expandedBox.right - options.buttonXMargin;
      titleRightSpan = this.expandCollapseButton.left - options.titleXSpacing;
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

    // @private expand/collapse the box
    this.expandedPropertyObserver = function( expanded ) {
      expandedBox.visible = expanded;
      collapsedBox.visible = !expanded;
      options.titleNode.visible = ( expanded && options.showTitleWhenExpanded ) || !expanded;
    };
    this.expandedProperty = options.expandedProperty; // @private
    this.expandedProperty.link( this.expandedPropertyObserver ); // must be unlinked in dispose

    this.mutate( _.omit( options, 'cursor' ) );
  }

  return inherit( Node, AccordionBox, {

    // Ensures that this node is eligible for GC.
    dispose: function() {
      this.expandCollapseButton.dispose();
      this.expandCollapseButton = null;
      this.expandedProperty.unlink( this.expandedPropertyObserver );
    }
  } );
} );