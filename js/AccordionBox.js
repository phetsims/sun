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

      // {boolean} - If true, the AccordionBox will resize itself as needed when the title/content resizes.
      //             See https://github.com/phetsims/sun/issues/304
      resize: false,

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

    // verify string options
    assert && assert( options.buttonAlign === 'left' || options.buttonAlign === 'right' );
    assert && assert( options.contentAlign === 'left' || options.contentAlign === 'right' || options.contentAlign === 'center' );
    assert && assert( options.titleAlignX === 'left' || options.titleAlignX === 'right' || options.titleAlignX === 'center' );
    assert && assert( options.titleAlignY === 'top' || options.titleAlignY === 'center' );

    // @private
    this._contentAlign = options.contentAlign;
    this._contentNode = contentNode;
    this._cornerRadius = options.cornerRadius;
    this._buttonXMargin = options.buttonXMargin;
    this._buttonYMargin = options.buttonYMargin;
    this._contentXMargin = options.contentXMargin;
    this._contentYMargin = options.contentYMargin;
    this._contentXSpacing = options.contentXSpacing;
    this._contentYSpacing = options.contentYSpacing;
    this._titleAlignX = options.titleAlignX;
    this._titleAlignY = options.titleAlignY;
    this._titleXMargin = options.titleXMargin;
    this._titleYMargin = options.titleYMargin;
    this._titleXSpacing = options.titleXSpacing;
    this._minWidth = options.minWidth;
    this._showTitleWhenExpanded = options.showTitleWhenExpanded;
    this._buttonAlign = options.buttonAlign;

    // emitters for the PhET-iO data stream
    this.startedCallbacksForExpandedTitleBarDownEmitter = new Emitter( { indicateCallbacks: false } );
    this.endedCallbacksForExpandedTitleBarDownEmitter = new Emitter( { indicateCallbacks: false } );
    this.startedCallbacksForCollapsedTitleBarDownEmitter = new Emitter( { indicateCallbacks: false } );
    this.endedCallbacksForCollapsedTitleBarDownEmitter = new Emitter( { indicateCallbacks: false } );

    // @private {Array.<function>} - Actions to take when this AccordionBox is disposed. Will be called with a proper
    //                               'this' reference to the AccordionBox.
    this.disposalActions = [];

    // @private {Node}
    this.titleNode = options.titleNode;

    // If there is no titleNode specified, we'll provide our own, and handle disposal.
    if ( !this.titleNode ) {
      this.titleNode = new Text( '', { tandem: options.tandem.createTandem( 'titleNode' ) } );
      this.disposalActions.push( function() {
        self.titleNode.dispose();
      } );
    }

    // @private {Property.<boolean>}
    this.expandedProperty = options.expandedProperty;

    if ( !this.expandedProperty ) {
      this.expandedProperty = new BooleanProperty( true, {
        tandem: options.tandem.createTandem( 'expandedProperty' )
      } );
      this.disposalActions.push( function() {
        self.expandedProperty.dispose();
      } );
    }

    Node.call( this );

    // @private - expand/collapse button, links to expandedProperty, must be disposed of
    this.expandCollapseButton = new ExpandCollapseButton( this.expandedProperty, {
      sideLength: options.buttonLength,
      cursor: options.cursor,
      tandem: options.tandem.createTandem( 'expandCollapseButton' )
    } );
    this.disposalActions.push( function() {
      self.expandCollapseButton.dispose();
    } );
    this.expandCollapseButton.touchArea = this.expandCollapseButton.localBounds.dilatedXY(
      options.buttonTouchAreaXDilation,
      options.buttonTouchAreaYDilation
    );
    this.expandCollapseButton.mouseArea = this.expandCollapseButton.localBounds.dilatedXY(
      options.buttonMouseAreaXDilation,
      options.buttonMouseAreaYDilation
    );

    // Expanded box
    var boxOptions = { fill: options.fill };

    // @private {Rectangle} - Expanded box
    this.expandedBox = new Rectangle( _.extend( {
      cornerRadius: options.cornerRadius,
      tandem: options.tandem.createTandem( 'expandedBox' ),
      tagName: 'div' // a11y
    }, boxOptions ) );
    this.disposalActions.push( function() {
      self.expandedBox.dispose();
    } );
    this.addChild( this.expandedBox );

    // @private {Rectangle} - Collapsed box
    this.collapsedBox = new Rectangle( _.extend( {
      cornerRadius: options.cornerRadius,
      tandem: options.tandem.createTandem( 'collapsedBox' )
    }, boxOptions ) );
    this.disposalActions.push( function() {
      self.collapsedBox.dispose();
    } );
    this.addChild( this.collapsedBox );

    // @private {Path}
    this.expandedTitleBar = new Path( null, {
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
    this.disposalActions.push( function() {
      self.expandedTitleBar.dispose();
    } );
    this.expandedBox.addChild( this.expandedTitleBar );

    // @private {Rectangle} - Collapsed title bar has corners that match the box. Clicking it operates like
    //                        expand/collapse button.
    this.collapsedTitleBar = new Rectangle( {
      cornerRadius: options.cornerRadius,
      fill: options.titleBarFill,
      cursor: options.cursor,
      tandem: options.tandem.createTandem( 'collapsedTitleBar' ),

      // a11y
      tagName: 'button',
      accessibleLabel: options.accessibleAccordionTitle,
      labelTagName: 'p'
    } );
    this.disposalActions.push( function() {
      self.collapsedTitleBar.dispose();
    } );
    this.collapsedBox.addChild( this.collapsedTitleBar );

    if ( options.titleBarExpandCollapse ) {
      this.collapsedTitleBar.addInputListener( {
        down: function() {
          self.startedCallbacksForExpandedTitleBarDownEmitter.emit();
          self.expandedProperty.value = true;
          self.endedCallbacksForExpandedTitleBarDownEmitter.emit();
        }
      } );
    }

    // a11y we always want accessible tab focus on the title, even when titleBarExpandeCollapse === false
    this.collapsedTitleBar.addAccessibleInputListener( {
      click: function() {
        self.startedCallbacksForExpandedTitleBarDownEmitter.emit();
        self.expandedProperty.value = true;
        self.endedCallbacksForExpandedTitleBarDownEmitter.emit();

        // a11y Set focus to expanded title bar
        self.expandedTitleBar.focus();
      }
    } );

    // Set the input listeners for the expandedTitleBar
    // a11y we need to focus on the collapsedTitleBar when the expandedTitleBar is clicked
    if ( options.showTitleWhenExpanded ) {
      if ( options.titleBarExpandCollapse ) {
        this.expandedTitleBar.addInputListener( {
          down: function() {
            self.startedCallbacksForCollapsedTitleBarDownEmitter.emit();
            self.expandedProperty.value = false;
            self.endedCallbacksForCollapsedTitleBarDownEmitter.emit();
          }
        } );
      }

      // a11y we always want accessible tab focus on the title
      this.expandedTitleBar.addAccessibleInputListener( {
        click: function() {
          self.startedCallbacksForCollapsedTitleBarDownEmitter.emit();
          self.expandedProperty.value = false;
          self.endedCallbacksForCollapsedTitleBarDownEmitter.emit();

          // a11y Set focus to expanded title bar
          self.collapsedTitleBar.focus();
        }
      } );
    }

    // TODO: a11y
    this.addChild( this.titleNode );
    this.addChild( this.expandCollapseButton );

    // box outline, on top of everything else
    if ( options.stroke ) {
      var outlineOptions = { stroke: options.stroke, lineWidth: options.lineWidth };

      // @private {Rectangle} - May not be set
      this.expandedBoxOutline = new Rectangle( _.extend( {
        cornerRadius: options.cornerRadius,
        tandem: options.tandem.createTandem( 'expandedBoxOutline' )
      }, outlineOptions ) );
      this.disposalActions.push( function() {
        self.expandedBoxOutline.dispose();
      } );
      this.expandedBox.addChild( this.expandedBoxOutline );

      // @private {Rectangle} - May not be set
      this.collapsedBoxOutline = new Rectangle( _.extend( {
        cornerRadius: options.cornerRadius,
        tandem: options.tandem.createTandem( 'collapsedBoxOutline' )
      }, outlineOptions ) );
      this.collapsedBox.addChild( this.collapsedBoxOutline );
      this.disposalActions.push( function() {
        self.collapsedBoxOutline.dispose();
      } );
    }

    this.expandedBox.addChild( this._contentNode );

    this.layout();

    // Watch future changes for re-layout (don't want to trigger on our first layout and queue useless ones)
    if ( options.resize ) {
      var layoutListener = this.layout.bind( this );
      contentNode.on( 'bounds', layoutListener );
      this.titleNode.on( 'bounds', layoutListener );
      this.disposalActions.push( function() {
        contentNode.off( 'bounds', layoutListener );
        self.titleNode.off( 'bounds', layoutListener );
      } );
    }

    // expand/collapse the box
    var expandedPropertyObserver = function( expanded ) {
      self.expandedBox.visible = expanded;
      self.collapsedBox.visible = !expanded;

      // a11y Toggle the visibility of the buttons in the PDOM
      self.expandedTitleBar.accessibleHidden = !expanded;
      self.collapsedTitleBar.accessibleHidden = expanded;

      self.titleNode.visible = ( expanded && options.showTitleWhenExpanded ) || !expanded;
    };
    this.expandedProperty.link( expandedPropertyObserver );
    this.disposalActions.push( function() {
      self.expandedProperty.unlink( expandedPropertyObserver );
    } );

    if ( this.constructor.name === 'DoubleNumberLineAccordionBox' ) {
      this.inspect();
    }

    this.mutate( _.omit( options, 'cursor' ) );
  }

  sun.register( 'AccordionBox', AccordionBox );

  return inherit( Node, AccordionBox, {
    /**
     * Performs layout that positions everything that can change.
     * @private
     */
    layout: function() {
      var collapsedBoxHeight = this.getCollapsedBoxHeight();
      var boxWidth = this.getBoxWidth();
      var expandedBoxHeight = this.getExpandedBoxHeight();

      this.expandedBox.rectWidth = boxWidth;
      this.expandedBox.rectHeight = expandedBoxHeight;

      var expandedBounds = this.expandedBox.selfBounds;

      this.expandedBoxOutline.rectWidth = boxWidth;
      this.expandedBoxOutline.rectHeight = expandedBoxHeight;

      this.expandedTitleBar.shape = this.getTitleBarShape();

      this.collapsedBox.rectWidth = boxWidth;
      this.collapsedBox.rectHeight = collapsedBoxHeight;

      this.collapsedTitleBar.rectWidth = boxWidth;
      this.collapsedTitleBar.rectHeight = collapsedBoxHeight;

      this.collapsedBoxOutline.rectWidth = boxWidth;
      this.collapsedBoxOutline.rectHeight = collapsedBoxHeight;

      // content layout
      this._contentNode.bottom = expandedBounds.bottom - this._contentYMargin;
      var contentSpanLeft = expandedBounds.left + this._contentXMargin;
      var contentSpanRight = expandedBounds.right - this._contentXMargin;
      if ( !this._showTitleWhenExpanded ) {
        // content will be placed next to button
        if ( this._buttonAlign === 'left' ) {
          contentSpanLeft += this.expandCollapseButton.width + this._contentXSpacing;
        }
        else { // right on right
          contentSpanRight -= this.expandCollapseButton.width + this._contentXSpacing;
        }
      }
      if ( this._contentAlign === 'left' ) {
        this._contentNode.left = contentSpanLeft;
      }
      else if ( this._contentAlign === 'right' ) {
        this._contentNode.right = contentSpanRight;
      }
      else { // center
        this._contentNode.centerX = ( contentSpanLeft + contentSpanRight ) / 2;
      }

      // button horizontal layout
      var titleLeftSpan = expandedBounds.left + this._titleXMargin;
      var titleRightSpan = expandedBounds.right - this._titleXMargin;
      if ( this._buttonAlign === 'left' ) {
        this.expandCollapseButton.left = expandedBounds.left + this._buttonXMargin;
        titleLeftSpan = this.expandCollapseButton.right + this._titleXSpacing;
      }
      else {
        this.expandCollapseButton.right = expandedBounds.right - this._buttonXMargin;
        titleRightSpan = this.expandCollapseButton.left - this._titleXSpacing;
      }

      // title horizontal layout
      if ( this._titleAlignX === 'left' ) {
        this.titleNode.left = titleLeftSpan;
      }
      else if ( this._titleAlignX === 'right' ) {
        this.titleNode.right = titleRightSpan;
      }
      else { // center
        this.titleNode.centerX = expandedBounds.centerX;
      }

      // button & title vertical layout
      if ( this._titleAlignY === 'top' ) {
        this.expandCollapseButton.top = this.collapsedBox.top + Math.max( this._buttonYMargin, this._titleYMargin );
        this.titleNode.top = this.expandCollapseButton.top;
      }
      else { // center
        this.expandCollapseButton.centerY = this.collapsedBox.centerY;
        this.titleNode.centerY = this.expandCollapseButton.centerY;
      }
    },

    /**
     * Returns the Shape of the title bar.
     * @private
     *
     * Expanded title bar has (optional) rounded top corners, square bottom corners. Clicking it operates like
     * expand/collapse button.
     *
     * @returns {Shape}
     */
    getTitleBarShape: function() {
      return Shape.roundedRectangleWithRadii( 0, 0, this.getBoxWidth(), this.getCollapsedBoxHeight(), {
        topLeft: this._cornerRadius,
        topRight: this._cornerRadius
      } );
    },

    /**
     * Returns the computed width of the box (ignoring things like stroke width)
     * @private
     *
     * @returns {number}
     */
    getBoxWidth: function() {
      var width = Math.max( this._minWidth, this.expandCollapseButton.width + this.titleNode.width + this._buttonXMargin + this._titleXMargin + this._titleXSpacing );

      // content is below button+title
      if ( this._showTitleWhenExpanded ) {
        return Math.max( width, this._contentNode.width + ( 2 * this._contentXMargin ) );
      }
      // content is next to button
      else {
        return Math.max( width, this.expandCollapseButton.width + this._contentNode.width + this._buttonXMargin + this._contentXMargin + this._contentXSpacing );
      }
    },

    /**
     * Returns the ideal height of the collapsed box (ignoring things like stroke width)
     * @private
     *
     * @returns {number}
     */
    getCollapsedBoxHeight: function() {
      return Math.max( this.expandCollapseButton.height + ( 2 * this._buttonYMargin ), this.titleNode.height + ( 2 * this._titleYMargin ) );
    },

    /**
     * Returns the ideal height of the expanded box (ignoring things like stroke width)
     * @private
     *
     * @returns {number}
     */
    getExpandedBoxHeight: function() {
      // content is below button+title
      if ( this._showTitleWhenExpanded ) {
        return this.getCollapsedBoxHeight() + this._contentNode.height + this._contentYMargin + this._contentYSpacing;
      }
      // content is next to button
      else {
        return Math.max( this.expandCollapseButton.height + ( 2 * this._buttonYMargin ), this._contentNode.height + ( 2 * this._contentYMargin ) );
      }
    },

    /**
     * Ensures this node is eligible for GC.
     * @public
     */
    dispose: function() {
      while ( this.disposalActions.length ) {
        this.disposalActions.pop().call( this );
      }
      Node.prototype.dispose.call( this );
    }
  } );
} );