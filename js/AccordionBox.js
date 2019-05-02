// Copyright 2013-2019, University of Colorado Boulder

/**
 * Box that can be expanded/collapsed to show/hide contents.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var AccordionBoxIO = require( 'SUN/AccordionBoxIO' );
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var Emitter = require( 'AXON/Emitter' );
  var ExpandCollapseButton = require( 'SUN/ExpandCollapseButton' );
  var inherit = require( 'PHET_CORE/inherit' );
  var InstanceRegistry = require( 'PHET_CORE/documentation/InstanceRegistry' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetioObject = require( 'TANDEM/PhetioObject' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );
  var Text = require( 'SCENERY/nodes/Text' );

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
      cornerRadius: 10,

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
      titleBarExpandCollapse: true, // {boolean} clicking on the title bar expands/collapses the accordion box

      // {*|null} options passed to ExpandCollapseButton constructor, defaults filled in below
      expandCollapseButtonOptions: null,

      // expand/collapse button layout
      buttonAlign: 'left',  // {string} button alignment, 'left'|'right'
      buttonXMargin: 4, // horizontal space between button and left|right edge of box
      buttonYMargin: 2, // vertical space between button and top edge of box

      // content
      contentAlign: 'center', // {string} horizontal alignment of the content, 'left'|'center'|'right'
      contentXMargin: 15, // horizontal space between content and left/right edges of box
      contentYMargin: 8,  // horizontal space between content and bottom edge of box
      contentXSpacing: 5, // horizontal space between content and button, ignored if showTitleWhenExpanded is true
      contentYSpacing: 8, // vertical space between content and title+button, ignored if showTitleWhenExpanded is false

      // {*|null} options for the title bar, defaults filled in below
      titleBarOptions: null,

      // phet-io support
      tandem: Tandem.required,
      phetioType: AccordionBoxIO,
      phetioEventType: PhetioObject.EventType.USER

    }, options );

    // titleBarOptions defaults
    options.titleBarOptions = _.extend( {
      fill: null, // {Color|string|null} title bar fill
      stroke: null // {Color|string|null} title bar stroke, used only for the expanded title bar
    }, options.titleBarOptions );

    // expandCollapseButtonOptions defaults
    options.expandCollapseButtonOptions = _.extend( {
      sideLength: 16, // button is a square, this is the length of one side
      cursor: options.cursor,
      tandem: options.tandem.createTandem( 'expandCollapseButton' )
    }, options.expandCollapseButtonOptions );

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

    // @private Add listeners to handle dispose
    this.disposeEmitterAccordionBox = new Emitter();

    // @private {Node}
    this.titleNode = options.titleNode;

    // If there is no titleNode specified, we'll provide our own, and handle disposal.
    if ( !this.titleNode ) {
      this.titleNode = new Text( '', { tandem: options.tandem.createTandem( 'titleNode' ) } );
      this.disposeEmitterAccordionBox.addListener( function() {
        self.titleNode.dispose();
      } );
    }

    // @public {Property.<boolean>}
    this.expandedProperty = options.expandedProperty;
    if ( !this.expandedProperty ) {
      this.expandedProperty = new BooleanProperty( true, {
        tandem: options.tandem.createTandem( 'expandedProperty' )
      } );
      this.disposeEmitterAccordionBox.addListener( function() {
        self.expandedProperty.dispose();
      } );
    }

    Node.call( this );

    // @private - expand/collapse button, links to expandedProperty, must be disposed of
    this.expandCollapseButton = new ExpandCollapseButton( this.expandedProperty, options.expandCollapseButtonOptions );
    this.disposeEmitterAccordionBox.addListener( function() {
      self.expandCollapseButton.dispose();
    } );

    // Expanded box
    var boxOptions = {
      fill: options.fill,
      cornerRadius: options.cornerRadius
    };

    // @private {Rectangle} - Expanded box
    this.expandedBox = new Rectangle( boxOptions );
    this.addChild( this.expandedBox );

    // @private {Rectangle} - Collapsed box
    this.collapsedBox = new Rectangle( boxOptions );
    this.addChild( this.collapsedBox );

    // @private {Rectangle} - Transparent rectangle for working around issues like
    // https://github.com/phetsims/graphing-quadratics/issues/86. The current hypothesis is that browsers (in this case,
    // IE11) sometimes don't compute the correct region of the screen that needs to get redrawn when something changes.
    // This means that old content can be left in regions where it has since disappeared in the SVG.
    // Adding transparent objects that are a bit larger seems to generally work (since browsers don't get the region
    // wrong by more than a few pixels generally), and in the past has resolved the issues.
    this.workaroundBox = new Rectangle( {
      fill: 'transparent',
      pickable: false
    } );
    this.addChild( this.workaroundBox );

    // @private {Path}
    this.expandedTitleBar = new Path( null, _.extend( {
      lineWidth: options.lineWidth, // use same lineWidth as box, for consistent look
      cursor: options.cursor
    }, options.titleBarOptions ) );
    this.disposeEmitterAccordionBox.addListener( function() {
      self.expandedTitleBar.dispose();
    } );
    this.expandedBox.addChild( this.expandedTitleBar );

    // @private {Rectangle} - Collapsed title bar has corners that match the box. Clicking it operates like
    //                        expand/collapse button.
    this.collapsedTitleBar = new Rectangle( _.extend( {
      cornerRadius: options.cornerRadius,
      cursor: options.cursor
    }, options.titleBarOptions ) );
    this.disposeEmitterAccordionBox.addListener( function() {
      self.collapsedTitleBar.dispose();
    } );
    this.collapsedBox.addChild( this.collapsedTitleBar );

    if ( options.titleBarExpandCollapse ) {
      this.collapsedTitleBar.addInputListener( {
        down: function() {
          self.phetioStartEvent( 'expanded' );
          self.expandedProperty.value = true;
          self.phetioEndEvent();
        }
      } );
    }

    // Set the input listeners for the expandedTitleBar
    if ( options.showTitleWhenExpanded ) {
      if ( options.titleBarExpandCollapse ) {
        this.expandedTitleBar.addInputListener( {
          down: function() {
            self.phetioStartEvent( 'collapsed' );
            self.expandedProperty.value = false;
            self.phetioEndEvent();
          }
        } );
      }
    }

    // If we hide the button, disable interactivity of the title bar, see https://github.com/phetsims/sun/issues/477
    this.expandCollapseButton.on( 'visibility', () => {
      this.collapsedTitleBar.pickable = this.expandCollapseButton.visible;
      this.expandedTitleBar.pickable = this.expandCollapseButton.visible;
    } );

    this.addChild( this.titleNode );
    this.addChild( this.expandCollapseButton );

    // optional box outline, on top of everything else
    if ( options.stroke ) {

      var outlineOptions = {
        stroke: options.stroke,
        lineWidth: options.lineWidth,
        cornerRadius: options.cornerRadius
      };

      // @private
      this.expandedBoxOutline = new Rectangle( outlineOptions );
      this.expandedBox.addChild( this.expandedBoxOutline );

      // @private
      this.collapsedBoxOutline = new Rectangle( outlineOptions );
      this.collapsedBox.addChild( this.collapsedBoxOutline );
    }

    this.expandedBox.addChild( this._contentNode );

    this.layout();

    // Watch future changes for re-layout (don't want to trigger on our first layout and queue useless ones)
    if ( options.resize ) {
      var layoutListener = this.layout.bind( this );
      contentNode.on( 'bounds', layoutListener );
      this.titleNode.on( 'bounds', layoutListener );
      this.disposeEmitterAccordionBox.addListener( function() {
        contentNode.off( 'bounds', layoutListener );
        self.titleNode.off( 'bounds', layoutListener );
      } );
    }

    // expand/collapse the box
    var expandedPropertyObserver = function( expanded ) {
      self.expandedBox.visible = expanded;
      self.collapsedBox.visible = !expanded;

      // NOTE: This does not increase the bounds of the AccordionBox, since the localBounds for the workaroundBox have
      // been set elsewhere.
      self.workaroundBox.rectBounds = ( expanded ? self.expandedBox : self.collapsedBox ).bounds.dilated( 10 );

      self.titleNode.visible = ( expanded && options.showTitleWhenExpanded ) || !expanded;
    };
    this.expandedProperty.link( expandedPropertyObserver );
    this.disposeEmitterAccordionBox.addListener( function() {
      self.expandedProperty.unlink( expandedPropertyObserver );
    } );

    this.mutate( _.omit( options, 'cursor' ) );

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'AccordionBox', this );
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

      if ( !this._showTitleWhenExpanded ) {
        this.expandedTitleBar.focusHighlight = Shape.bounds( this.expandCollapseButton.bounds.dilatedXY( this._buttonXMargin, this._buttonYMargin ) );
      }

      this.collapsedBox.rectWidth = boxWidth;
      this.collapsedBox.rectHeight = collapsedBoxHeight;

      this.workaroundBox.localBounds = this.collapsedBox.bounds;

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

      // Initial width is dependent on width of title section of the accordion box
      var width = Math.max( this._minWidth, this._buttonXMargin + this.expandCollapseButton.width + this._titleXSpacing + this.titleNode.width + this._titleXMargin );

      // Limit width by the necessary space for the title node
      if ( this._titleAlignX === 'center' ) {
        // Handles case where the spacing on the left side of the title is larger than the spacing on the right side.
        width = Math.max( width, ( this._buttonXMargin + this.expandCollapseButton.width + this._titleXSpacing ) * 2 + this.titleNode.width );

        // Handles case where the spacing on the right side of the title is larger than the spacing on the left side.
        width = Math.max( width, ( this._titleXMargin ) * 2 + this.titleNode.width );
      }

      // Compare width of title section to content section of the accordion box
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
      this.disposeEmitterAccordionBox.emit();
      Node.prototype.dispose.call( this );
    }
  } );
} );