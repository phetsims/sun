// Copyright 2013-2021, University of Colorado Boulder

/**
 * Box that can be expanded/collapsed to show/hide contents.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import Emitter from '../../axon/js/Emitter.js';
import Shape from '../../kite/js/Shape.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import merge from '../../phet-core/js/merge.js';
import FocusHighlightFromNode from '../../scenery/js/accessibility/FocusHighlightFromNode.js';
import PDOMPeer from '../../scenery/js/accessibility/pdom/PDOMPeer.js';
import Node from '../../scenery/js/nodes/Node.js';
import Path from '../../scenery/js/nodes/Path.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import Text from '../../scenery/js/nodes/Text.js';
import accordionBoxClosedSoundPlayer from '../../tambo/js/shared-sound-players/accordionBoxClosedSoundPlayer.js';
import accordionBoxOpenedSoundPlayer from '../../tambo/js/shared-sound-players/accordionBoxOpenedSoundPlayer.js';
import EventType from '../../tandem/js/EventType.js';
import Tandem from '../../tandem/js/Tandem.js';
import IOType from '../../tandem/js/types/IOType.js';
import ExpandCollapseButton from './ExpandCollapseButton.js';
import sun from './sun.js';

// The definition for how AccordionBox sets its accessibleName in the PDOM. Forward it onto its expandCollapseButton.
// See AccordionBox.md for further style guide and documentation on the pattern.
const ACCESSIBLE_NAME_BEHAVIOR = ( node, options, accessibleName, callbacksForOtherNodes ) => {
  callbacksForOtherNodes.push( () => {
    node.expandCollapseButton.accessibleName = accessibleName;
  } );
  return options;
};

class AccordionBox extends Node {

  /**
   * @param {Node} contentNode - Content that will be shown or hidden as the accordion box is expanded/collapsed.
   * @param {Object} [options] - Various key-value pairs that control the appearance and behavior.  Some options are
   *                             specific to this class while some are passed to the superclass.  See the code where
   *                             the options are set in the early portion of the constructor for details.
   */
  constructor( contentNode, options ) {

    options = merge( {

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
      contentYMargin: 8,  // vertical space between content and bottom edge of box
      contentXSpacing: 5, // horizontal space between content and button, ignored if showTitleWhenExpanded is true
      contentYSpacing: 8, // vertical space between content and title+button, ignored if showTitleWhenExpanded is false

      // {*|null} options for the title bar, defaults filled in below
      titleBarOptions: null,

      // {Playable} - sound generators for expand and collapse
      expandedSoundPlayer: accordionBoxOpenedSoundPlayer,
      collapsedSoundPlayer: accordionBoxClosedSoundPlayer,

      // pdom
      tagName: 'div',
      headingTagName: 'h3', // specify the heading that this AccordionBox will be, TODO: use this.headingLevel when no longer experimental https://github.com/phetsims/scenery/issues/855
      accessibleNameBehavior: ACCESSIBLE_NAME_BEHAVIOR,

      // phet-io support
      tandem: Tandem.REQUIRED,
      phetioType: AccordionBox.AccordionBoxIO,
      phetioEventType: EventType.USER,
      visiblePropertyOptions: { phetioFeatured: true }
    }, options );

    // titleBarOptions defaults
    options.titleBarOptions = merge( {
      fill: null, // {Color|string|null} title bar fill
      stroke: null // {Color|string|null} title bar stroke, used only for the expanded title bar
    }, options.titleBarOptions );

    // expandCollapseButtonOptions defaults
    options.expandCollapseButtonOptions = merge( {
      sideLength: 16, // button is a square, this is the length of one side
      cursor: options.cursor,
      valueOnSoundPlayer: options.expandedSoundPlayer,
      valueOffSoundPlayer: options.collapsedSoundPlayer,
      tandem: options.tandem.createTandem( 'expandCollapseButton' )
    }, options.expandCollapseButtonOptions );

    // verify string options
    assert && assert( options.buttonAlign === 'left' || options.buttonAlign === 'right' );
    assert && assert( options.contentAlign === 'left' || options.contentAlign === 'right' || options.contentAlign === 'center' );
    assert && assert( options.titleAlignX === 'left' || options.titleAlignX === 'right' || options.titleAlignX === 'center' );
    assert && assert( options.titleAlignY === 'top' || options.titleAlignY === 'center' );

    super();

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

    // @private - Fires when this instance is disposed.
    // AccordionBox does not use the {function} this.disposeAccordionBox pattern used in other PhET components.
    // Instead, this Emitter will fire in the dispose method, and a listener must be added to this Emitter for anything
    // that needs to be cleaned up.  This simplifies conditional disposal, but distributes disposal throughout the
    // constructor.
    this.disposeEmitterAccordionBox = new Emitter();

    // @private {Node}
    this.titleNode = options.titleNode;

    // If there is no titleNode specified, we'll provide our own, and handle disposal.
    if ( !this.titleNode ) {
      this.titleNode = new Text( '', { tandem: options.tandem.createTandem( 'titleNode' ) } );
      this.disposeEmitterAccordionBox.addListener( () => this.titleNode.dispose() );
    }

    // Allow touches to go through to the collapsedTitleBar which handles the input event
    // Note: This mutates the titleNode, so if it is used in multiple places it will become unpickable
    // in those places as well.
    this.titleNode.pickable = false;

    // @public {Property.<boolean>}
    this.expandedProperty = options.expandedProperty;
    if ( !this.expandedProperty ) {
      this.expandedProperty = new BooleanProperty( true, {
        tandem: options.tandem.createTandem( 'expandedProperty' )
      } );
      this.disposeEmitterAccordionBox.addListener( () => this.expandedProperty.dispose() );
    }

    // @private - expand/collapse button, links to expandedProperty, must be disposed of
    this.expandCollapseButton = new ExpandCollapseButton( this.expandedProperty, options.expandCollapseButtonOptions );
    this.disposeEmitterAccordionBox.addListener( () => this.expandCollapseButton.dispose() );

    // Expanded box
    const boxOptions = {
      fill: options.fill,
      cornerRadius: options.cornerRadius
    };

    // @private {Rectangle} - Expanded box
    this.expandedBox = new Rectangle( boxOptions );

    // @private {Rectangle} - Collapsed box
    this.collapsedBox = new Rectangle( boxOptions );

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

    // @private {Path}
    this.expandedTitleBar = new Path( null, merge( {
      lineWidth: options.lineWidth, // use same lineWidth as box, for consistent look
      cursor: options.cursor
    }, options.titleBarOptions ) );
    this.disposeEmitterAccordionBox.addListener( () => this.expandedTitleBar.dispose() );
    this.expandedBox.addChild( this.expandedTitleBar );

    // @private {Rectangle} - Collapsed title bar has corners that match the box. Clicking it operates like
    //                        expand/collapse button.
    this.collapsedTitleBar = new Rectangle( merge( {
      cornerRadius: options.cornerRadius,
      cursor: options.cursor
    }, options.titleBarOptions ) );
    this.disposeEmitterAccordionBox.addListener( () => this.collapsedTitleBar.dispose() );
    this.collapsedBox.addChild( this.collapsedTitleBar );

    if ( options.titleBarExpandCollapse ) {
      this.collapsedTitleBar.addInputListener( {
        down: () => {
          if ( this.expandCollapseButton.isEnabled() ) {
            this.phetioStartEvent( 'expanded' );
            this.expandedProperty.value = true;
            options.expandedSoundPlayer.play();
            this.phetioEndEvent();
          }
        }
      } );
    }

    // Set the input listeners for the expandedTitleBar
    if ( options.showTitleWhenExpanded ) {
      if ( options.titleBarExpandCollapse ) {
        this.expandedTitleBar.addInputListener( {
          down: () => {
            if ( this.expandCollapseButton.isEnabled() ) {
              this.phetioStartEvent( 'collapsed' );
              options.collapsedSoundPlayer.play();
              this.expandedProperty.value = false;
              this.phetioEndEvent();
            }
          }
        } );
      }
    }

    // If we hide the button or make it unpickable, disable interactivity of the title bar,
    // see https://github.com/phetsims/sun/issues/477 and https://github.com/phetsims/sun/issues/573.
    const pickableListener = () => {
      const pickable = this.expandCollapseButton.visible && this.expandCollapseButton.pickable;
      this.collapsedTitleBar.pickable = pickable;
      this.expandedTitleBar.pickable = pickable;
    };
    this.expandCollapseButton.visibleProperty.lazyLink( pickableListener );
    this.expandCollapseButton.pickableProperty.lazyLink( pickableListener );

    this.expandCollapseButton.enabledProperty.link( enabled => {
      this.collapsedTitleBar.cursor = enabled ? options.cursor : null;
      this.expandedTitleBar.cursor = enabled ? options.cursor : null;
    } );

    // Set the focusHighlight for the interactive PDOM element based on the dimensions of the whole title bar.
    this.expandCollapseButton.setFocusHighlight( new FocusHighlightFromNode( this.expandedTitleBar ) );

    // optional box outline, on top of everything else
    if ( options.stroke ) {

      const outlineOptions = {
        stroke: options.stroke,
        lineWidth: options.lineWidth,
        cornerRadius: options.cornerRadius,

        // don't occlude input events from the collapsedTitleBar, which handles the events
        pickable: false
      };

      // @private
      this.expandedBoxOutline = new Rectangle( outlineOptions );
      this.expandedBox.addChild( this.expandedBoxOutline );

      // @private
      this.collapsedBoxOutline = new Rectangle( outlineOptions );
      this.collapsedBox.addChild( this.collapsedBoxOutline );
    }

    this.expandedBox.addChild( this._contentNode );

    // @private {Node} - Holds the main components when the content's bounds are valid
    this.containerNode = new Node();
    this.addChild( this.containerNode );

    // pdom display
    const pdomContentNode = new Node( {
      tagName: 'div',
      ariaRole: 'region',
      pdomOrder: [ this._contentNode ],
      ariaLabelledbyAssociations: [ {
        otherNode: this.expandCollapseButton,
        otherElementName: PDOMPeer.PRIMARY_SIBLING,
        thisElementName: PDOMPeer.PRIMARY_SIBLING
      } ]
    } );
    const pdomHeading = new Node( {
      tagName: options.headingTagName,
      pdomOrder: [ this.expandCollapseButton ]
    } );

    const pdomContainerNode = new Node( {
      children: [ pdomHeading, pdomContentNode ]
    } );
    this.addChild( pdomContainerNode );

    this.layout();

    // Watch future changes for re-layout (don't want to trigger on our first layout and queue useless ones)
    if ( options.resize ) {
      const layoutListener = this.layout.bind( this );
      contentNode.boundsProperty.lazyLink( layoutListener );
      this.titleNode.boundsProperty.lazyLink( layoutListener );
      this.disposeEmitterAccordionBox.addListener( () => {
        contentNode.boundsProperty.unlink( layoutListener );
        this.titleNode.boundsProperty.unlink( layoutListener );
      } );
    }

    // expand/collapse the box
    const expandedPropertyObserver = expanded => {
      this.expandedBox.visible = expanded;
      this.collapsedBox.visible = !expanded;

      // NOTE: This does not increase the bounds of the AccordionBox, since the localBounds for the workaroundBox have
      // been set elsewhere.
      this.workaroundBox.rectBounds = ( expanded ? this.expandedBox : this.collapsedBox ).bounds.dilated( 10 );

      this.titleNode.visible = ( expanded && options.showTitleWhenExpanded ) || !expanded;

      pdomContainerNode.setPDOMAttribute( 'aria-hidden', !expanded );
    };
    this.expandedProperty.link( expandedPropertyObserver );
    this.disposeEmitterAccordionBox.addListener( () => this.expandedProperty.unlink( expandedPropertyObserver ) );

    this.mutate( _.omit( options, 'cursor' ) );

    // @private - reset things that are owned by AccordionBox
    this.resetAccordionBox = () => {

      // If expandedProperty wasn't provided via options, we own it and therefore need to reset it.
      if ( !options.expandedProperty ) {
        this.expandedProperty.reset();
      }
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'AccordionBox', this );
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeEmitterAccordionBox.emit();
    super.dispose();
  }

  /**
   * @public
   */
  reset() {
    this.resetAccordionBox();
  }

  /**
   * Performs layout that positions everything that can change.
   * @private
   */
  layout() {
    const hasValidBounds = this._contentNode.bounds.isValid();
    this.containerNode.children = hasValidBounds ? [
      this.expandedBox,
      this.collapsedBox,
      this.workaroundBox,
      this.titleNode,
      this.expandCollapseButton
    ] : [];

    if ( !hasValidBounds ) {
      return;
    }

    const collapsedBoxHeight = this.getCollapsedBoxHeight();
    const boxWidth = this.getBoxWidth();
    const expandedBoxHeight = this.getExpandedBoxHeight();

    this.expandedBox.rectWidth = boxWidth;
    this.expandedBox.rectHeight = expandedBoxHeight;

    const expandedBounds = this.expandedBox.selfBounds;

    // expandedBoxOutline exists only if options.stroke is truthy
    if ( this.expandedBoxOutline ) {
      this.expandedBoxOutline.rectWidth = boxWidth;
      this.expandedBoxOutline.rectHeight = expandedBoxHeight;
    }

    this.expandedTitleBar.shape = this.getTitleBarShape();

    this.collapsedBox.rectWidth = boxWidth;
    this.collapsedBox.rectHeight = collapsedBoxHeight;

    this.workaroundBox.localBounds = this.collapsedBox.bounds;

    this.collapsedTitleBar.rectWidth = boxWidth;
    this.collapsedTitleBar.rectHeight = collapsedBoxHeight;

    // collapsedBoxOutline exists only if options.stroke is truthy
    if ( this.collapsedBoxOutline ) {
      this.collapsedBoxOutline.rectWidth = boxWidth;
      this.collapsedBoxOutline.rectHeight = collapsedBoxHeight;
    }

    // content layout
    this._contentNode.bottom = expandedBounds.bottom - this._contentYMargin;
    let contentSpanLeft = expandedBounds.left + this._contentXMargin;
    let contentSpanRight = expandedBounds.right - this._contentXMargin;
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
    let titleLeftSpan = expandedBounds.left + this._titleXMargin;
    let titleRightSpan = expandedBounds.right - this._titleXMargin;
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
  }

  /**
   * Returns the Shape of the title bar.
   * @private
   *
   * Expanded title bar has (optional) rounded top corners, square bottom corners. Clicking it operates like
   * expand/collapse button.
   *
   * @returns {Shape}
   */
  getTitleBarShape() {
    return Shape.roundedRectangleWithRadii( 0, 0, this.getBoxWidth(), this.getCollapsedBoxHeight(), {
      topLeft: this._cornerRadius,
      topRight: this._cornerRadius
    } );
  }

  /**
   * Returns the computed width of the box (ignoring things like stroke width)
   * @private
   *
   * @returns {number}
   */
  getBoxWidth() {

    // Initial width is dependent on width of title section of the accordion box
    let width = Math.max( this._minWidth, this._buttonXMargin + this.expandCollapseButton.width + this._titleXSpacing + this.titleNode.width + this._titleXMargin );

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
  }

  /**
   * Returns the ideal height of the collapsed box (ignoring things like stroke width)
   * @private
   *
   * @returns {number}
   */
  getCollapsedBoxHeight() {
    return Math.max( this.expandCollapseButton.height + ( 2 * this._buttonYMargin ), this.titleNode.height + ( 2 * this._titleYMargin ) );
  }

  /**
   * Returns the ideal height of the expanded box (ignoring things like stroke width)
   * @private
   *
   * @returns {number}
   */
  getExpandedBoxHeight() {
    // content is below button+title
    if ( this._showTitleWhenExpanded ) {
      return this.getCollapsedBoxHeight() + this._contentNode.height + this._contentYMargin + this._contentYSpacing;
    }
    // content is next to button
    else {
      return Math.max( this.expandCollapseButton.height + ( 2 * this._buttonYMargin ), this._contentNode.height + ( 2 * this._contentYMargin ) );
    }
  }
}

AccordionBox.AccordionBoxIO = new IOType( 'AccordionBoxIO', {
  valueType: AccordionBox,
  supertype: Node.NodeIO,
  events: [ 'expanded', 'collapsed' ]
} );

sun.register( 'AccordionBox', AccordionBox );
export default AccordionBox;