// Copyright 2013-2015, University of Colorado Boulder

/**
 * Box that can be expanded/collapsed to show/hide contents.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var Emitter = require( 'AXON/Emitter' );
  var ExpandCollapseButton = require( 'SUN/ExpandCollapseButton' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );
  var Text = require( 'SCENERY/nodes/Text' );

  // phet-io modules
  var TAccordionBox = require( 'SUN/TAccordionBox' );

  /**
   * @constructor
   *
   * @param {Node} contentNode - Content that will be shown or hidden as the accordion box is expanded/collapsed.
   * @param {Object} [options] - Various key-value pairs that control the appearance and behavior.  Some options are
   *                             specific to this class while some are passed to the superclass.  See the code where
   *                             the options are set in the early portion of the constructor for details.
   */
  function AccordionBox( contentNode, options ) {

    var self = this;

    options = _.extend( {
      // {Tandem}
      tandem: Tandem.tandemRequired(),

      // {Node} - If not provided, a Text node will be supplied. Should have and maintain well-defined bounds if passed
      //          in.
      titleNode: null,

      // {Property.<boolean>} - If not provided, a BooleanProperty will be created, defaulting to true.
      expandedProperty: null,

      // applied to multiple parts of this UI component
      cursor: 'pointer', // {string} default cursor
      lineWidth: 1,
      cornerRadius: 3,

      // box
      stroke: 'black',
      fill: 'rgb( 238, 238, 238 )',
      minWidth: 0,

      titleAlignX: 'center', // {string} horizontal alignment of the title, 'left'|'center'|'right'
      titleAlignY: 'center', // {string} vertical alignment of the title, relative to expand/collapse button 'top'|'center'
      titleXMargin: 10, // horizontal space between title and left|right edge of box
      titleYMargin: 2, // vertical space between title and top of box
      titleXSpacing: 5, // horizontal space between title and expand/collapse button
      showTitleWhenExpanded: true, // true = title is visible when expanded, false = title is hidden when expanded
      titleBarFill: null, // {Color|string} title bar fill
      titleBarStroke: null, // {Color|string} title bar stroke, used only for the expanded title bar
      titleBarExpandCollapse: true, // {boolean} clicking on the title bar expands/collapses the accordion box

      // expand/collapse button
      buttonLength: 16, // button is a square, this is the length of one side
      buttonAlign: 'left',  // {string} button alignment, 'left'|'right'
      buttonXMargin: 4, // horizontal space between button and left|right edge of box
      buttonYMargin: 2, // vertical space between button and top edge of box
      buttonTouchAreaXDilation: 0,
      buttonTouchAreaYDilation: 0,
      buttonMouseAreaXDilation: 0,
      buttonMouseAreaYDilation: 0,

      // content
      contentAlign: 'center', // {string} horizontal alignment of the content, 'left'|'center'|'right'
      contentXMargin: 15, // horizontal space between content and left/right edges of box
      contentYMargin: 8,  // horizontal space between content and bottom edge of box
      contentXSpacing: 5, // horizontal space between content and button, ignored if showTitleWhenExpanded is true
      contentYSpacing: 8, // vertical space between content and title+button, ignored if showTitleWhenExpanded is false

      // phet-io support
      phetioType: TAccordionBox,

      // a11y options
      tagName: 'div',
      accessibleAccordionTitle: 'No Title Given',


    }, options );

    // @private {Array.<function>} - Actions to take when this AccordionBox is disposed. Will be called with a proper
    //                               'this' reference to the AccordionBox.
    this.disposalActions = [];

    // @private {Node}
    this.titleNode = options.titleNode;

    // If there is no titleNode specified, we'll provide our own, and handle disposal.
    if ( !this.titleNode ) {
      this.titleNode = new Text( '', { tandem: options.tandem.createTandem( 'titleNode' ) } );
      this.disposalActions.push( function() {
        this.titleNode.dispose();
      } );
    }

    // @private {Property.<boolean>}
    this.expandedProperty = options.expandedProperty;

    if ( !this.expandedProperty ) {
      this.expandedProperty = new BooleanProperty( true, {
        tandem: options.tandem.createTandem( 'expandedProperty' )
      } );
      this.disposalActions.push( function() {
        this.expandedProperty.dispose();
      } );
    }

    // verify string options
    assert && assert( options.buttonAlign === 'left' || options.buttonAlign === 'right' );
    assert && assert( options.contentAlign === 'left' || options.contentAlign === 'right' || options.contentAlign === 'center' );
    assert && assert( options.titleAlignX === 'left' || options.titleAlignX === 'right' || options.titleAlignX === 'center' );
    assert && assert( options.titleAlignY === 'top' || options.titleAlignY === 'center' );

    // emitters for the PhET-iO data stream
    this.startedCallbacksForExpandedTitleBarDownEmitter = new Emitter();
    this.endedCallbacksForExpandedTitleBarDownEmitter = new Emitter();
    this.startedCallbacksForCollapsedTitleBarDownEmitter = new Emitter();
    this.endedCallbacksForCollapsedTitleBarDownEmitter = new Emitter();

    Node.call( this );

    // @private - expand/collapse button, links to expandedProperty, must be disposed of
    this.expandCollapseButton = new ExpandCollapseButton( this.expandedProperty, {
      sideLength: options.buttonLength,
      cursor: options.cursor,
      tandem: options.tandem.createTandem( 'expandCollapseButton' )
    } );
    this.expandCollapseButton.touchArea = this.expandCollapseButton.localBounds.dilatedXY(
      options.buttonTouchAreaXDilation,
      options.buttonTouchAreaYDilation
    );
    this.expandCollapseButton.mouseArea = this.expandCollapseButton.localBounds.dilatedXY(
      options.buttonMouseAreaXDilation,
      options.buttonMouseAreaYDilation
    );

    // Compute box dimensions
    var collapsedBoxHeight = Math.max( this.expandCollapseButton.height + ( 2 * options.buttonYMargin ), this.titleNode.height + ( 2 * options.titleYMargin ) );
    assert && assert( options.cornerRadius < collapsedBoxHeight / 2 );
    var boxWidth = Math.max( options.minWidth, this.expandCollapseButton.width + this.titleNode.width + options.buttonXMargin + options.titleXMargin + options.titleXSpacing );
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
    var expandedBox = new Rectangle(
      0,
      0,
      boxWidth,
      expandedBoxHeight,
      options.cornerRadius,
      options.cornerRadius,
      _.extend( {
        tandem: options.tandem.createTandem( 'expandedBox' ),

        // a11y
        tagName: 'div'
      }, boxOptions )
    );
    this.addChild( expandedBox );

    // Collapsed box
    var collapsedBox = new Rectangle(
      0,
      0,
      boxWidth,
      collapsedBoxHeight,
      options.cornerRadius,
      options.cornerRadius,
      _.extend( { tandem: options.tandem.createTandem( 'collapsedBox' ) }, boxOptions )
    );
    this.addChild( collapsedBox );

    // Expanded title bar has (optional) rounded top corners, square bottom corners. Clicking it operates like expand/collapse button.
    var expandedTitleBarShape = Shape.roundedRectangleWithRadii( 0, 0, boxWidth, collapsedBoxHeight, {
      topLeft: options.cornerRadius,
      topRight: options.cornerRadius
    } );
    var expandedTitleBar = new Path( expandedTitleBarShape, {
      fill: options.titleBarFill,
      stroke: options.titleBarStroke,
      lineWidth: options.lineWidth, // use same lineWidth as box, for consistent look
      cursor: options.cursor,
      tandem: options.tandem.createTandem( 'expandedTitleBar' ),

      // a11y
      tagName: 'button',
      accessibleLabel: options.accessibleAccordionTitle,
      labelTagName: 'p'
    } );
    expandedBox.addChild( expandedTitleBar );


    // Collapsed title bar has corners that match the box. Clicking it operates like expand/collapse button.
    var collapsedTitleBar = new Rectangle( 0, 0, boxWidth, collapsedBoxHeight, options.cornerRadius, options.cornerRadius, {
      fill: options.titleBarFill,
      cursor: options.cursor,
      tandem: options.tandem.createTandem( 'collapsedTitleBar' ),

      // a11y
      tagName: 'button',
      accessibleLabel: options.accessibleAccordionTitle,
      labelTagName: 'p'
    } );
    collapsedBox.addChild( collapsedTitleBar );
    if ( options.titleBarExpandCollapse ) {
      collapsedTitleBar.addInputListener( {
        down: function() {
          self.startedCallbacksForExpandedTitleBarDownEmitter.emit();
          self.expandedProperty.value = true;
          self.endedCallbacksForExpandedTitleBarDownEmitter.emit();
        }
      } );
    }

    // a11y we always want accessible tab focus on the title, even when titleBarExpandeCollapse === false
    collapsedTitleBar.addAccessibleInputListener( {
      click: function() {
        self.startedCallbacksForExpandedTitleBarDownEmitter.emit();
        self.expandedProperty.value = true;
        self.endedCallbacksForExpandedTitleBarDownEmitter.emit();

        // a11y Set focus to expanded title bar
        expandedTitleBar.focus();
      }
    } );

    // Set the input listeners for the expandedTitleBar
    // a11y we need to focus on the collapsedTitleBar when the expandedTitleBar is clicked
    if ( options.showTitleWhenExpanded ) {
      if ( options.titleBarExpandCollapse ) {
        expandedTitleBar.addInputListener( {
          down: function() {
            self.startedCallbacksForCollapsedTitleBarDownEmitter.emit();
            self.expandedProperty.value = false;
            self.endedCallbacksForCollapsedTitleBarDownEmitter.emit();
          }
        } );
      }

      // a11y we always want accessible tab focus on the title
      expandedTitleBar.addAccessibleInputListener( {
        click: function() {
          self.startedCallbacksForCollapsedTitleBarDownEmitter.emit();
          self.expandedProperty.value = false;
          self.endedCallbacksForCollapsedTitleBarDownEmitter.emit();

          // a11y Set focus to expanded title bar
          collapsedTitleBar.focus();
        }
      } );
    }

    // TODO: a11y
    this.addChild( this.titleNode );
    this.addChild( this.expandCollapseButton );

    // box outline, on top of everything else
    var expandedBoxOutline;
    var collapsedBoxOutline;
    if ( options.stroke ) {
      var outlineOptions = { stroke: options.stroke, lineWidth: options.lineWidth };
      expandedBoxOutline = new Rectangle(
        0,
        0,
        boxWidth,
        expandedBoxHeight,
        options.cornerRadius,
        options.cornerRadius,
        _.extend( { tandem: options.tandem.createTandem( 'expandedBoxOutline' ) }, outlineOptions )
      );
      collapsedBoxOutline = new Rectangle(
        0,
        0,
        boxWidth,
        collapsedBoxHeight,
        options.cornerRadius,
        options.cornerRadius,
        _.extend( { tandem: options.tandem.createTandem( 'collapsedBoxOutline' ) }, outlineOptions )
      );
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
    expandedBox.addChild( contentNode ); // do this after layout computations, see sun#280

    // button horizontal layout
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

    // title horizontal layout
    if ( options.titleAlignX === 'left' ) {
      this.titleNode.left = titleLeftSpan;
    }
    else if ( options.titleAlignX === 'right' ) {
      this.titleNode.right = titleRightSpan;
    }
    else { // center
      this.titleNode.centerX = expandedBox.centerX;
    }

    // button & title vertical layout
    if ( options.titleAlignY === 'top' ) {
      this.expandCollapseButton.top = collapsedBox.top + Math.max( options.buttonYMargin, options.titleYMargin );
      this.titleNode.top = this.expandCollapseButton.top;
    }
    else { // center
      this.expandCollapseButton.centerY = collapsedBox.centerY;
      this.titleNode.centerY = this.expandCollapseButton.centerY;
    }

    // @private expand/collapse the box
    this.expandedPropertyObserver = function( expanded ) {
      expandedBox.visible = expanded;
      collapsedBox.visible = !expanded;

      // a11y Toggle the visibility of the buttons in the PDOM
      expandedTitleBar.accessibleHidden = !expanded;
      collapsedTitleBar.accessibleHidden = expanded;

      self.titleNode.visible = ( expanded && options.showTitleWhenExpanded ) || !expanded;
    };
    this.expandedProperty.link( this.expandedPropertyObserver ); // must be unlinked in dispose

    this.mutate( _.omit( options, 'cursor' ) );
  }

  sun.register( 'AccordionBox', AccordionBox );

  return inherit( Node, AccordionBox, {
    /**
     * Ensures this node is eligible for GC.
     * @public
     */
    dispose: function() {
      while ( this.disposalActions.length ) {
        this.disposalActions.pop().call( this );
      }

      this.expandCollapseButton.dispose();
      this.expandCollapseButton = null;
      this.expandedProperty.unlink( this.expandedPropertyObserver );
      Node.prototype.dispose.call( this );
    }
  } );
} );