// Copyright 2013-2024, University of Colorado Boulder

/**
 * Box that can be expanded/collapsed to show/hide contents.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import Property from '../../axon/js/Property.js';
import { Shape } from '../../kite/js/imports.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import { HighlightFromNode, InteractiveHighlighting, isHeightSizable, isWidthSizable, LayoutConstraint, Node, NodeOptions, PaintableOptions, Path, PathOptions, PDOMBehaviorFunction, PDOMPeer, Rectangle, RectangleOptions, Sizable, Text } from '../../scenery/js/imports.js';
import accordionBoxClosedSoundPlayer from '../../tambo/js/shared-sound-players/accordionBoxClosedSoundPlayer.js';
import accordionBoxOpenedSoundPlayer from '../../tambo/js/shared-sound-players/accordionBoxOpenedSoundPlayer.js';
import SoundClipPlayer from '../../tambo/js/sound-generators/SoundClipPlayer.js';
import EventType from '../../tandem/js/EventType.js';
import Tandem from '../../tandem/js/Tandem.js';
import IOType from '../../tandem/js/types/IOType.js';
import { VoicingResponse } from '../../utterance-queue/js/ResponsePacket.js';
import ExpandCollapseButton, { ExpandCollapseButtonOptions } from './ExpandCollapseButton.js';
import sun from './sun.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';

type SelfOptions = {
  // If not provided, a Text node will be supplied. Should have and maintain well-defined bounds if passed in
  titleNode?: Node;

  // If not provided, a BooleanProperty will be created, defaulting to true.
  expandedProperty?: Property<boolean>;

  // If true (the default), we'll adjust the title so that it isn't pickable at all
  overrideTitleNodePickable?: boolean;

  // If true, the AccordionBox will resize itself as needed when the title/content resizes.
  // See https://github.com/phetsims/sun/issues/304
  resize?: boolean;

  // applied to multiple parts of this UI component (NOTE: cursor is NOT applied to the main node!!)
  cursor?: NodeOptions[ 'cursor' ];
  lineWidth?: PathOptions[ 'lineWidth' ];
  cornerRadius?: RectangleOptions[ 'cornerRadius' ];

  // For the box
  stroke?: PaintableOptions[ 'stroke' ];
  fill?: PaintableOptions[ 'fill' ];
  minWidth?: number;

  // horizontal alignment of the title, 'left'|'center'|'right'
  titleAlignX?: 'center' | 'left' | 'right';

  // vertical alignment of the title, relative to expand/collapse button 'top'|'center'
  titleAlignY?: 'top' | 'center';

  // horizontal space between title and left|right edge of box
  titleXMargin?: number;

  // vertical space between title and top of box
  titleYMargin?: number;

  // horizontal space between title and expand/collapse button
  titleXSpacing?: number;

  // true = title is visible when expanded, false = title is hidden when expanded
  // When true, the content is shown beneath the title. When false, the content is shown to the side of the title
  showTitleWhenExpanded?: boolean;

  // If true, the expanded box will use the bounds of the content node when collapsed
  useExpandedBoundsWhenCollapsed?: boolean;

  // clicking on the title bar expands/collapses the accordion box
  titleBarExpandCollapse?: boolean;

  // if true, the content will overlap the title when expanded, and will use contentYMargin at the top
  allowContentToOverlapTitle?: boolean;

  // options passed to ExpandCollapseButton constructor
  expandCollapseButtonOptions?: ExpandCollapseButtonOptions;

  // expand/collapse button layout
  buttonAlign?: 'left' | 'right'; // button alignment, 'left'|'right'
  buttonXMargin?: number; // horizontal space between button and left|right edge of box
  buttonYMargin?: number; // vertical space between button and top edge of box

  // content
  contentAlign?: 'left' | 'center' | 'right'; // horizontal alignment of the content
  contentVerticalAlign?: 'top' | 'center' | 'bottom'; // vertical alignment of the content (if the preferred size is larger)
  contentXMargin?: number; // horizontal space between content and left/right edges of box
  contentYMargin?: number; // vertical space between content and bottom edge of box (and top if allowContentToOverlapTitle is true)
  contentXSpacing?: number; // horizontal space between content and button, ignored if showTitleWhenExpanded is true
  contentYSpacing?: number; // vertical space between content and title+button, ignored if showTitleWhenExpanded is false

  titleBarOptions?: RectangleOptions;

  // sound generators for expand and collapse
  expandedSoundPlayer?: SoundClipPlayer;
  collapsedSoundPlayer?: SoundClipPlayer;

  // voicing - These are defined here in AccordionBox (duplicated from Voicing) so that they can be passed to the
  // expandCollapse button, which handles voicing for AccordionBox, without AccordionBox mixing Voicing itself.
  voicingNameResponse?: VoicingResponse;
  voicingObjectResponse?: VoicingResponse;
  voicingContextResponse?: VoicingResponse;
  voicingHintResponse?: VoicingResponse;

  // pdom
  headingTagName?: string;
};

export type AccordionBoxOptions = SelfOptions & NodeOptions;

export default class AccordionBox extends Sizable( Node ) {

  public readonly expandedProperty: Property<boolean>;

  private readonly expandCollapseButton: ExpandCollapseButton;
  private readonly expandedBox: Rectangle;
  private readonly collapsedBox: Rectangle;
  private readonly expandedTitleBar: InteractiveHighlightPath;
  private readonly collapsedTitleBar: InteractiveHighlightRectangle;
  private readonly resetAccordionBox: () => void;

  // Only defined if there is a stroke
  private readonly expandedBoxOutline: Rectangle | null = null;
  private readonly collapsedBoxOutline: Rectangle | null = null;

  private readonly constraint: AccordionBoxConstraint;

  public static readonly AccordionBoxIO = new IOType( 'AccordionBoxIO', {
    valueType: AccordionBox,
    supertype: Node.NodeIO,
    events: [ 'expanded', 'collapsed' ]
  } );

  /**
   * @param contentNode - Content that  will be shown or hidden as the accordion box is expanded/collapsed. NOTE: AccordionBox
   *                      places this Node in a pdomOrder, so you should not do that yourself.
   * @param [providedOptions]
   */
  public constructor( contentNode: Node, providedOptions?: AccordionBoxOptions ) {

    const options = optionize<AccordionBoxOptions, StrictOmit<SelfOptions, 'expandCollapseButtonOptions'>, NodeOptions>()( {

      titleNode: null as unknown as Node,
      expandedProperty: null as unknown as BooleanProperty,
      resize: true,

      overrideTitleNodePickable: true,
      allowContentToOverlapTitle: false,

      // applied to multiple parts of this UI component
      cursor: 'pointer',
      lineWidth: 1,
      cornerRadius: 10,

      // box
      stroke: 'black',
      fill: 'rgb( 238, 238, 238 )',
      minWidth: 0,

      titleAlignX: 'center',
      titleAlignY: 'center',
      titleXMargin: 10,
      titleYMargin: 2,
      titleXSpacing: 5,
      showTitleWhenExpanded: true,
      useExpandedBoundsWhenCollapsed: true,
      titleBarExpandCollapse: true,

      // expand/collapse button layout
      buttonAlign: 'left',
      buttonXMargin: 4,
      buttonYMargin: 2,

      // content
      contentAlign: 'center',
      contentVerticalAlign: 'center',
      contentXMargin: 15,
      contentYMargin: 8,
      contentXSpacing: 5,
      contentYSpacing: 8,

      // sound
      expandedSoundPlayer: accordionBoxOpenedSoundPlayer,
      collapsedSoundPlayer: accordionBoxClosedSoundPlayer,

      // pdom
      tagName: 'div',
      headingTagName: 'h3', // specify the heading that this AccordionBox will be, TODO: use this.headingLevel when no longer experimental https://github.com/phetsims/scenery/issues/855
      accessibleNameBehavior: AccordionBox.ACCORDION_BOX_ACCESSIBLE_NAME_BEHAVIOR,

      // voicing
      voicingNameResponse: null,
      voicingObjectResponse: null,
      voicingContextResponse: null,
      voicingHintResponse: null,

      // phet-io support
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'AccordionBox',
      phetioType: AccordionBox.AccordionBoxIO,
      phetioEventType: EventType.USER,
      visiblePropertyOptions: { phetioFeatured: true },

      titleBarOptions: {
        fill: null, // title bar fill
        stroke: null // title bar stroke, used only for the expanded title bar
      }
    }, providedOptions );

    // expandCollapseButtonOptions defaults
    options.expandCollapseButtonOptions = combineOptions<ExpandCollapseButtonOptions>( {
      sideLength: 16, // button is a square, this is the length of one side
      cursor: options.cursor,
      valueOnSoundPlayer: options.expandedSoundPlayer,
      valueOffSoundPlayer: options.collapsedSoundPlayer,

      // voicing
      voicingNameResponse: options.voicingNameResponse,
      voicingObjectResponse: options.voicingObjectResponse,
      voicingContextResponse: options.voicingContextResponse,
      voicingHintResponse: options.voicingHintResponse,

      // phet-io
      tandem: options.tandem.createTandem( 'expandCollapseButton' )
    }, options.expandCollapseButtonOptions );

    super();

    let titleNode = options.titleNode;

    // If there is no titleNode specified, we'll provide our own, and handle disposal.
    if ( !titleNode ) {
      titleNode = new Text( '', {
        tandem: options.tandem.createTandem( 'titleText' )
      } );
      this.disposeEmitter.addListener( () => titleNode.dispose() );
    }

    // Allow touches to go through to the collapsedTitleBar which handles the input event
    // Note: This mutates the titleNode, so if it is used in multiple places it will become unpickable
    // in those places as well.
    if ( options.overrideTitleNodePickable ) {
      titleNode.pickable = false;
    }

    this.expandedProperty = options.expandedProperty;
    if ( !this.expandedProperty ) {
      this.expandedProperty = new BooleanProperty( true, {
        tandem: options.tandem.createTandem( 'expandedProperty' ),
        phetioFeatured: true
      } );
      this.disposeEmitter.addListener( () => this.expandedProperty.dispose() );
    }

    // expand/collapse button, links to expandedProperty, must be disposed of
    this.expandCollapseButton = new ExpandCollapseButton( this.expandedProperty, options.expandCollapseButtonOptions );
    this.disposeEmitter.addListener( () => this.expandCollapseButton.dispose() );

    // Expanded box
    const boxOptions = {
      fill: options.fill,
      cornerRadius: options.cornerRadius
    };

    this.expandedBox = new Rectangle( boxOptions );
    this.collapsedBox = new Rectangle( boxOptions );

    this.expandedTitleBar = new InteractiveHighlightPath( null, combineOptions<ExpandCollapseButtonOptions>( {
      lineWidth: options.lineWidth, // use same lineWidth as box, for consistent look
      cursor: options.cursor
    }, options.titleBarOptions ) );
    this.expandedBox.addChild( this.expandedTitleBar );

    // Collapsed title bar has corners that match the box. Clicking it operates like expand/collapse button.
    this.collapsedTitleBar = new InteractiveHighlightRectangle( combineOptions<RectangleOptions>( {
      cornerRadius: options.cornerRadius,
      cursor: options.cursor
    }, options.titleBarOptions ) );
    this.collapsedBox.addChild( this.collapsedTitleBar );

    // Set the focusHighlight for the interactive PDOM element based on the dimensions of the whole title bar (not just the button).
    const expandedFocusHighlight = new HighlightFromNode( this.expandedTitleBar );
    const collapsedFocusHighlight = new HighlightFromNode( this.collapsedTitleBar );

    this.disposeEmitter.addListener( () => {
      this.collapsedTitleBar.dispose();
      this.expandedTitleBar.dispose();
    } );

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
    else {

      // When titleBar doesn't expand or collapse, don't show interactive highlights for them
      this.expandedTitleBar.interactiveHighlight = 'invisible';
      this.collapsedTitleBar.interactiveHighlight = 'invisible';
    }

    // Set the input listeners for the expandedTitleBar
    if ( options.showTitleWhenExpanded && options.titleBarExpandCollapse ) {
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

    // If we hide the button or make it unpickable, disable interactivity of the title bar,
    // see https://github.com/phetsims/sun/issues/477 and https://github.com/phetsims/sun/issues/573.
    const pickableListener = () => {
      const pickable = this.expandCollapseButton.visible && this.expandCollapseButton.pickable;
      this.collapsedTitleBar.pickable = pickable;
      this.expandedTitleBar.pickable = pickable;
    };

    // Add listeners to the expand/collapse button.  These do not need to be unlinked because this component owns the
    // button.
    this.expandCollapseButton.visibleProperty.lazyLink( pickableListener );
    this.expandCollapseButton.pickableProperty.lazyLink( pickableListener );
    this.expandCollapseButton.enabledProperty.link( enabled => {

      // Since there are listeners on the titleBars from InteractiveHighlighting, setting pickable: false isn't enough
      // to hide pointer cursor.
      const showCursor = options.titleBarExpandCollapse && enabled;
      this.collapsedTitleBar.cursor = showCursor ? ( options.cursor || null ) : null;
      this.expandedTitleBar.cursor = showCursor ? ( options.cursor || null ) : null;
    } );

    this.expandedBox.addChild( contentNode );

    // optional box outline, on top of everything else
    if ( options.stroke ) {

      const outlineOptions = {
        stroke: options.stroke,
        lineWidth: options.lineWidth,
        cornerRadius: options.cornerRadius,

        // don't occlude input events from the collapsedTitleBar, which handles the events
        pickable: false
      };

      this.expandedBoxOutline = new Rectangle( outlineOptions );
      this.expandedBox.addChild( this.expandedBoxOutline );

      this.collapsedBoxOutline = new Rectangle( outlineOptions );
      this.collapsedBox.addChild( this.collapsedBoxOutline );
    }

    // Holds the main components when the content's bounds are valid
    const containerNode = new Node( {
      excludeInvisibleChildrenFromBounds: !options.useExpandedBoundsWhenCollapsed
    } );
    this.addChild( containerNode );

    // pdom display
    const pdomContentNode = new Node( {
      tagName: 'div',
      ariaRole: 'region',
      pdomOrder: [ contentNode ],
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

    this.constraint = new AccordionBoxConstraint(
      this,
      contentNode,
      containerNode,
      this.expandedBox,
      this.collapsedBox,
      this.expandedTitleBar,
      this.collapsedTitleBar,
      this.expandedBoxOutline,
      this.collapsedBoxOutline,
      titleNode,
      this.expandCollapseButton,
      options
    );
    this.constraint.updateLayout();

    // Don't update automatically if resize:false
    this.constraint.enabled = options.resize;

    // expand/collapse the box
    const expandedPropertyObserver = () => {
      const expanded = this.expandedProperty.value;

      this.expandedBox.visible = expanded;
      this.collapsedBox.visible = !expanded;

      this.expandCollapseButton.setFocusHighlight( expanded ? expandedFocusHighlight : collapsedFocusHighlight );

      titleNode.visible = ( expanded && options.showTitleWhenExpanded ) || !expanded;

      pdomContainerNode.setPDOMAttribute( 'aria-hidden', !expanded );

      this.expandCollapseButton.voicingSpeakFullResponse( {
        hintResponse: null
      } );
    };
    this.expandedProperty.link( expandedPropertyObserver );

    this.disposeEmitter.addListener( () => this.expandedProperty.unlink( expandedPropertyObserver ) );

    this.mutate( _.omit( options, 'cursor' ) );

    // reset things that are owned by AccordionBox
    this.resetAccordionBox = () => {

      // If expandedProperty wasn't provided via options, we own it and therefore need to reset it.
      if ( !options.expandedProperty ) {
        this.expandedProperty.reset();
      }
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet?.chipper?.queryParameters?.binder && InstanceRegistry.registerDataURL( 'sun', 'AccordionBox', this );
  }

  /**
   * Returns the ideal height of the collapsed box (ignoring things like stroke width)
   */
  public getCollapsedBoxHeight(): number {
    const result = this.constraint.lastCollapsedBoxHeight!;

    assert && assert( result !== null );

    return result;
  }

  /**
   * Returns the ideal height of the expanded box (ignoring things like stroke width)
   */
  public getExpandedBoxHeight(): number {
    const result = this.constraint.lastExpandedBoxHeight!;

    assert && assert( result !== null );

    return result;
  }

  public reset(): void {
    this.resetAccordionBox();
  }

  // The definition for how AccordionBox sets its accessibleName in the PDOM. Forward it onto its expandCollapseButton.
  // See AccordionBox.md for further style guide and documentation on the pattern.
  public static readonly ACCORDION_BOX_ACCESSIBLE_NAME_BEHAVIOR: PDOMBehaviorFunction =
    ( node, options, accessibleName: string | TReadOnlyProperty<string>, callbacksForOtherNodes ) => {
      callbacksForOtherNodes.push( () => {
        ( node as AccordionBox ).expandCollapseButton.accessibleName = accessibleName;
      } );
      return options;
    };
}

class InteractiveHighlightPath extends InteractiveHighlighting( Path ) {}

class InteractiveHighlightRectangle extends InteractiveHighlighting( Rectangle ) {}

class AccordionBoxConstraint extends LayoutConstraint {

  // Support public accessors
  public lastCollapsedBoxHeight: number | null = null;
  public lastExpandedBoxHeight: number | null = null;

  public constructor( private readonly accordionBox: AccordionBox,
                      private readonly contentNode: Node,
                      private readonly containerNode: Node,
                      private readonly expandedBox: Rectangle,
                      private readonly collapsedBox: Rectangle,
                      private readonly expandedTitleBar: Path,
                      private readonly collapsedTitleBar: Rectangle,
                      private readonly expandedBoxOutline: Rectangle | null,
                      private readonly collapsedBoxOutline: Rectangle | null,
                      private readonly titleNode: Node,
                      private readonly expandCollapseButton: Node,
                      private readonly options: StrictOmit<Required<SelfOptions>, 'expandCollapseButtonOptions'> ) {
    super( accordionBox );

    this.accordionBox.localPreferredWidthProperty.lazyLink( this._updateLayoutListener );
    this.accordionBox.localPreferredHeightProperty.lazyLink( this._updateLayoutListener );
    this.accordionBox.expandedProperty.lazyLink( this._updateLayoutListener );

    this.addNode( contentNode );
    this.addNode( titleNode );
  }

  protected override layout(): void {
    super.layout();

    const options = this.options;

    if ( this.accordionBox.isChildIncludedInLayout( this.contentNode ) ) {
      this.containerNode.children = [
        this.expandedBox,
        this.collapsedBox,
        this.titleNode,
        this.expandCollapseButton
      ];
    }
    else {
      this.containerNode.children = [];
      return;
    }

    const expanded = this.accordionBox.expandedProperty.value;
    const useExpandedBounds = expanded || options.useExpandedBoundsWhenCollapsed;

    // We only have to account for the lineWidth in our layout if we have a stroke
    const lineWidth = options.stroke === null ? 0 : options.lineWidth;

    // LayoutProxy helps with some layout operations, and will support a non-child content.
    const contentProxy = this.createLayoutProxy( this.contentNode )!;
    const titleProxy = this.createLayoutProxy( this.titleNode )!;

    const minimumContentWidth = contentProxy.minimumWidth;
    const minimumContentHeight = contentProxy.minimumHeight;
    const minumumTitleWidth = titleProxy.minimumWidth;

    // The ideal height of the collapsed box (ignoring things like stroke width). Does not depend on title width
    // OR content size, both of which could be changed depending on preferred sizes.
    const collapsedBoxHeight = Math.max(
      this.expandCollapseButton.height + ( 2 * options.buttonYMargin ),
      this.titleNode.height + ( 2 * options.titleYMargin )
    );

    const minimumExpandedBoxHeight =
      options.showTitleWhenExpanded ?
        // content is below button+title
      Math.max(
        // content (with optional overlap)
        ( options.allowContentToOverlapTitle ? options.contentYMargin : collapsedBoxHeight + options.contentYSpacing ) + minimumContentHeight + options.contentYMargin,
        // the collapsed box height itself (if we overlap content, this could be larger)
        collapsedBoxHeight
      ) :
        // content is next to button
      Math.max(
        this.expandCollapseButton.height + ( 2 * options.buttonYMargin ),
        minimumContentHeight + ( 2 * options.contentYMargin )
      );


    // The computed width of the box (ignoring things like stroke width)
    // Initial width is dependent on width of title section of the accordion box
    let minimumBoxWidth = Math.max(
      options.minWidth,
      options.buttonXMargin + this.expandCollapseButton.width + options.titleXSpacing + minumumTitleWidth + options.titleXMargin
    );

    // Limit width by the necessary space for the title node
    if ( options.titleAlignX === 'center' ) {
      // Handles case where the spacing on the left side of the title is larger than the spacing on the right side.
      minimumBoxWidth = Math.max( minimumBoxWidth, ( options.buttonXMargin + this.expandCollapseButton.width + options.titleXSpacing ) * 2 + minumumTitleWidth );

      // Handles case where the spacing on the right side of the title is larger than the spacing on the left side.
      minimumBoxWidth = Math.max( minimumBoxWidth, ( options.titleXMargin ) * 2 + minumumTitleWidth );
    }

    // Compare width of title section to content section of the accordion box
    // content is below button+title
    if ( options.showTitleWhenExpanded ) {
      minimumBoxWidth = Math.max( minimumBoxWidth, minimumContentWidth + ( 2 * options.contentXMargin ) );
    }
    // content is next to button
    else {
      minimumBoxWidth = Math.max( minimumBoxWidth, this.expandCollapseButton.width + minimumContentWidth + options.buttonXMargin + options.contentXMargin + options.contentXSpacing );
    }

    // Both of these use "half" the lineWidth on either side
    const minimumWidth = minimumBoxWidth + lineWidth;
    const minimumHeight = ( useExpandedBounds ? minimumExpandedBoxHeight : collapsedBoxHeight ) + lineWidth;

    // Our resulting sizes (allow setting preferred width/height on the box)
    const preferredWidth: number = Math.max( minimumWidth, this.accordionBox.localPreferredWidth || 0 );
    const preferredHeight: number = Math.max( minimumHeight, this.accordionBox.localPreferredHeight || 0 );

    const boxWidth = preferredWidth - lineWidth;
    const boxHeight = preferredHeight - lineWidth;

    this.lastCollapsedBoxHeight = collapsedBoxHeight;
    if ( useExpandedBounds ) {
      this.lastExpandedBoxHeight = boxHeight;
    }

    this.collapsedBox.rectWidth = boxWidth;
    this.collapsedBox.rectHeight = collapsedBoxHeight;

    const collapsedBounds = this.collapsedBox.selfBounds;

    this.collapsedTitleBar.rectWidth = boxWidth;
    this.collapsedTitleBar.rectHeight = collapsedBoxHeight;

    // collapsedBoxOutline exists only if options.stroke is truthy
    if ( this.collapsedBoxOutline ) {
      this.collapsedBoxOutline.rectWidth = boxWidth;
      this.collapsedBoxOutline.rectHeight = collapsedBoxHeight;
    }

    if ( useExpandedBounds ) {
      this.expandedBox.rectWidth = boxWidth;
      this.expandedBox.rectHeight = boxHeight;

      const expandedBounds = this.expandedBox.selfBounds;

      // expandedBoxOutline exists only if options.stroke is truthy
      if ( this.expandedBoxOutline ) {
        this.expandedBoxOutline.rectWidth = boxWidth;
        this.expandedBoxOutline.rectHeight = boxHeight;
      }

      // Expanded title bar has (optional) rounded top corners, square bottom corners. Clicking it operates like
      // expand/collapse button.
      this.expandedTitleBar.shape = Shape.roundedRectangleWithRadii( 0, 0, boxWidth, collapsedBoxHeight, {
        topLeft: options.cornerRadius,
        topRight: options.cornerRadius
      } );

      let contentSpanLeft = expandedBounds.left + options.contentXMargin;
      let contentSpanRight = expandedBounds.right - options.contentXMargin;
      if ( !options.showTitleWhenExpanded ) {
        // content will be placed next to button
        if ( options.buttonAlign === 'left' ) {
          contentSpanLeft += this.expandCollapseButton.width + options.contentXSpacing;
        }
        else { // right on right
          contentSpanRight -= this.expandCollapseButton.width + options.contentXSpacing;
        }
      }

      const availableContentWidth = contentSpanRight - contentSpanLeft;
      const availableContentHeight = boxHeight - (
        options.showTitleWhenExpanded && !options.allowContentToOverlapTitle ? collapsedBoxHeight + options.contentYMargin + options.contentYSpacing : 2 * options.contentYMargin
      );

      // Determine the size available to our content
      // NOTE: We do NOT set preferred sizes of our content if we don't have a preferred size ourself!
      if ( isWidthSizable( this.contentNode ) && this.accordionBox.localPreferredWidth !== null ) {
        this.contentNode.preferredWidth = availableContentWidth;
      }
      if ( isHeightSizable( this.contentNode ) && this.accordionBox.localPreferredHeight !== null ) {
        this.contentNode.preferredHeight = availableContentHeight;
      }

      // content layout
      if ( options.contentVerticalAlign === 'top' ) {
        this.contentNode.top = expandedBounds.bottom - options.contentYMargin - availableContentHeight;
      }
      else if ( options.contentVerticalAlign === 'bottom' ) {
        this.contentNode.bottom = expandedBounds.bottom - options.contentYMargin;
      }
      else { // center
        this.contentNode.centerY = expandedBounds.bottom - options.contentYMargin - availableContentHeight / 2;
      }

      if ( options.contentAlign === 'left' ) {
        this.contentNode.left = contentSpanLeft;
      }
      else if ( options.contentAlign === 'right' ) {
        this.contentNode.right = contentSpanRight;
      }
      else { // center
        this.contentNode.centerX = ( contentSpanLeft + contentSpanRight ) / 2;
      }
    }

    // button horizontal layout
    let titleLeftSpan = collapsedBounds.left + options.titleXMargin;
    let titleRightSpan = collapsedBounds.right - options.titleXMargin;
    if ( options.buttonAlign === 'left' ) {
      this.expandCollapseButton.left = collapsedBounds.left + options.buttonXMargin;
      titleLeftSpan = this.expandCollapseButton.right + options.titleXSpacing;
    }
    else {
      this.expandCollapseButton.right = collapsedBounds.right - options.buttonXMargin;
      titleRightSpan = this.expandCollapseButton.left - options.titleXSpacing;
    }

    // title horizontal layout
    if ( isWidthSizable( this.titleNode ) ) {
      this.titleNode.preferredWidth = titleRightSpan - titleLeftSpan;
    }
    if ( options.titleAlignX === 'left' ) {
      this.titleNode.left = titleLeftSpan;
    }
    else if ( options.titleAlignX === 'right' ) {
      this.titleNode.right = titleRightSpan;
    }
    else { // center
      this.titleNode.centerX = collapsedBounds.centerX;
    }

    // button & title vertical layout
    if ( options.titleAlignY === 'top' ) {
      this.expandCollapseButton.top = this.collapsedBox.top + Math.max( options.buttonYMargin, options.titleYMargin );
      this.titleNode.top = this.expandCollapseButton.top;
    }
    else { // center
      this.expandCollapseButton.centerY = this.collapsedBox.centerY;
      this.titleNode.centerY = this.expandCollapseButton.centerY;
    }

    contentProxy.dispose();
    titleProxy.dispose();

    // Set minimums at the end, since this may trigger a relayout
    this.accordionBox.localMinimumWidth = minimumWidth;
    this.accordionBox.localMinimumHeight = minimumHeight;
  }

  public override dispose(): void {
    this.accordionBox.localPreferredWidthProperty.unlink( this._updateLayoutListener );
    this.accordionBox.localPreferredHeightProperty.unlink( this._updateLayoutListener );
    this.accordionBox.expandedProperty.unlink( this._updateLayoutListener );

    super.dispose();
  }
}

sun.register( 'AccordionBox', AccordionBox );