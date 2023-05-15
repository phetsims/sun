// Copyright 2013-2023, University of Colorado Boulder

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
import RequiredOption from '../../phet-core/js/types/RequiredOption.js';
import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import { FocusHighlightFromNode, InteractiveHighlighting, Node, NodeOptions, PaintableOptions, Path, PathOptions, PDOMBehaviorFunction, PDOMPeer, Rectangle, RectangleOptions, Text } from '../../scenery/js/imports.js';
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
  showTitleWhenExpanded?: boolean;

  // clicking on the title bar expands/collapses the accordion box
  titleBarExpandCollapse?: boolean;

  // options passed to ExpandCollapseButton constructor
  expandCollapseButtonOptions?: ExpandCollapseButtonOptions;

  // expand/collapse button layout
  buttonAlign?: 'left' | 'right'; // button alignment, 'left'|'right'
  buttonXMargin?: number; // horizontal space between button and left|right edge of box
  buttonYMargin?: number; // vertical space between button and top edge of box

  // content
  contentAlign?: 'left' | 'center' | 'right'; // horizontal alignment of the content
  contentXMargin?: number; // horizontal space between content and left/right edges of box
  contentYMargin?: number; // vertical space between content and bottom edge of box
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

export default class AccordionBox extends Node {

  public readonly expandedProperty: Property<boolean>;

  private readonly _contentNode: Node;
  private readonly _contentAlign: RequiredOption<AccordionBoxOptions, 'contentAlign'>;
  private readonly _cornerRadius: RequiredOption<AccordionBoxOptions, 'cornerRadius'>;
  private readonly _buttonXMargin: RequiredOption<AccordionBoxOptions, 'buttonXMargin'>;
  private readonly _buttonYMargin: RequiredOption<AccordionBoxOptions, 'buttonYMargin'>;
  private readonly _contentXMargin: RequiredOption<AccordionBoxOptions, 'contentXMargin'>;
  private readonly _contentYMargin: RequiredOption<AccordionBoxOptions, 'contentYMargin'>;
  private readonly _contentXSpacing: RequiredOption<AccordionBoxOptions, 'contentXSpacing'>;
  private readonly _contentYSpacing: RequiredOption<AccordionBoxOptions, 'contentYSpacing'>;
  private readonly _titleAlignX: RequiredOption<AccordionBoxOptions, 'titleAlignX'>;
  private readonly _titleAlignY: RequiredOption<AccordionBoxOptions, 'titleAlignY'>;
  private readonly _titleXMargin: RequiredOption<AccordionBoxOptions, 'titleXMargin'>;
  private readonly _titleYMargin: RequiredOption<AccordionBoxOptions, 'titleYMargin'>;
  private readonly _titleXSpacing: RequiredOption<AccordionBoxOptions, 'titleXSpacing'>;
  private readonly _minWidth: RequiredOption<AccordionBoxOptions, 'minWidth'>;
  private readonly _showTitleWhenExpanded: RequiredOption<AccordionBoxOptions, 'showTitleWhenExpanded'>;
  private readonly _buttonAlign: RequiredOption<AccordionBoxOptions, 'buttonAlign'>;
  private readonly titleNode: RequiredOption<AccordionBoxOptions, 'titleNode'>;

  private readonly expandCollapseButton: ExpandCollapseButton;
  private readonly expandedBox: Rectangle;
  private readonly collapsedBox: Rectangle;
  private readonly expandedTitleBar: InteractiveHighlightPath;
  private readonly collapsedTitleBar: InteractiveHighlightRectangle;
  private readonly containerNode: Node;
  private readonly resetAccordionBox: () => void;

  // Only defined if there is a stroke
  private readonly expandedBoxOutline?: Rectangle;
  private readonly collapsedBoxOutline?: Rectangle;

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
      titleBarExpandCollapse: true,

      // expand/collapse button layout
      buttonAlign: 'left',
      buttonXMargin: 4,
      buttonYMargin: 2,

      // content
      contentAlign: 'center',
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

    this._contentNode = contentNode;
    this._contentAlign = options.contentAlign;
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
    this.titleNode = options.titleNode;

    // If there is no titleNode specified, we'll provide our own, and handle disposal.
    if ( !this.titleNode ) {
      this.titleNode = new Text( '', {
        tandem: options.tandem.createTandem( 'titleText' )
      } );
      this.disposeEmitter.addListener( () => this.titleNode.dispose() );
    }

    // Allow touches to go through to the collapsedTitleBar which handles the input event
    // Note: This mutates the titleNode, so if it is used in multiple places it will become unpickable
    // in those places as well.
    if ( options.overrideTitleNodePickable ) {
      this.titleNode.pickable = false;
    }

    this.expandedProperty = options.expandedProperty;
    if ( !this.expandedProperty ) {
      this.expandedProperty = new BooleanProperty( true, {
        tandem: options.tandem.createTandem( 'expandedProperty' )
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

      this.expandedBoxOutline = new Rectangle( outlineOptions );
      this.expandedBox.addChild( this.expandedBoxOutline );

      this.collapsedBoxOutline = new Rectangle( outlineOptions );
      this.collapsedBox.addChild( this.collapsedBoxOutline );
    }

    this.expandedBox.addChild( this._contentNode );

    // Holds the main components when the content's bounds are valid
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
      this.disposeEmitter.addListener( () => {
        contentNode.boundsProperty.unlink( layoutListener );
        this.titleNode.boundsProperty.unlink( layoutListener );
      } );
    }

    // expand/collapse the box
    const expandedPropertyObserver = () => {
      const expanded = this.expandedProperty.value;

      this.expandedBox.visible = expanded;
      this.collapsedBox.visible = !expanded;

      this.titleNode.visible = ( expanded && options.showTitleWhenExpanded ) || !expanded;

      pdomContainerNode.setPDOMAttribute( 'aria-hidden', !expanded );

      this.expandCollapseButton.voicingSpeakFullResponse( {
        hintResponse: null
      } );
    };
    this.expandedProperty.link( expandedPropertyObserver );
    this.expandedBox.boundsProperty.link( expandedPropertyObserver );
    this.collapsedBox.boundsProperty.link( expandedPropertyObserver );
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
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'AccordionBox', this );
  }

  public reset(): void {
    this.resetAccordionBox();
  }

  /**
   * Performs layout that positions everything that can change.
   */
  private layout(): void {
    const hasValidBounds = this._contentNode.bounds.isValid();
    this.containerNode.children = hasValidBounds ? [
      this.expandedBox,
      this.collapsedBox,
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
   *
   * Expanded title bar has (optional) rounded top corners, square bottom corners. Clicking it operates like
   * expand/collapse button.
   */
  private getTitleBarShape(): Shape {
    return Shape.roundedRectangleWithRadii( 0, 0, this.getBoxWidth(), this.getCollapsedBoxHeight(), {
      topLeft: this._cornerRadius,
      topRight: this._cornerRadius
    } );
  }

  /**
   * Returns the computed width of the box (ignoring things like stroke width)
   */
  private getBoxWidth(): number {

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
   */
  public getCollapsedBoxHeight(): number {
    return Math.max( this.expandCollapseButton.height + ( 2 * this._buttonYMargin ), this.titleNode.height + ( 2 * this._titleYMargin ) );
  }

  /**
   * Returns the ideal height of the expanded box (ignoring things like stroke width)
   */
  public getExpandedBoxHeight(): number {
    // content is below button+title
    if ( this._showTitleWhenExpanded ) {
      return this.getCollapsedBoxHeight() + this._contentNode.height + this._contentYMargin + this._contentYSpacing;
    }
    // content is next to button
    else {
      return Math.max( this.expandCollapseButton.height + ( 2 * this._buttonYMargin ), this._contentNode.height + ( 2 * this._contentYMargin ) );
    }
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

sun.register( 'AccordionBox', AccordionBox );
