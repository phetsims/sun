// Copyright 2015-2023, University of Colorado Boulder

/**
 * A carousel UI component.
 *
 * A set of N items is divided into M 'pages', based on how many items are visible in the carousel.
 * Pressing the next and previous buttons moves through the pages.
 * Movement through the pages is animated, so that items appear to scroll by.
 *
 * Note that Carousel wraps each item (Node) in an alignBox to ensure all items have an equal "footprint" dimension.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../axon/js/NumberProperty.js';
import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import Property from '../../axon/js/Property.js';
import stepTimer from '../../axon/js/stepTimer.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import Range from '../../dot/js/Range.js';
import { Shape } from '../../kite/js/imports.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import { AlignBox, AlignBoxOptions, AlignGroup, FlowBox, IndexedNodeIO, LayoutOrientation, ManualConstraint, Node, NodeOptions, Rectangle, Separator, SeparatorOptions, TPaint } from '../../scenery/js/imports.js';
import pushButtonSoundPlayer from '../../tambo/js/shared-sound-players/pushButtonSoundPlayer.js';
import Tandem from '../../tandem/js/Tandem.js';
import Animation, { AnimationOptions } from '../../twixt/js/Animation.js';
import Easing from '../../twixt/js/Easing.js';
import CarouselButton, { CarouselButtonOptions } from './buttons/CarouselButton.js';
import ColorConstants from './ColorConstants.js';
import sun from './sun.js';
import ReadOnlyProperty from '../../axon/js/ReadOnlyProperty.js';
import DerivedProperty, { UnknownDerivedProperty } from '../../axon/js/DerivedProperty.js';
import GroupItemOptions, { getGroupItemNodes } from './GroupItemOptions.js';
import Orientation from '../../phet-core/js/Orientation.js';
import Multilink from '../../axon/js/Multilink.js';
import Bounds2 from '../../dot/js/Bounds2.js';

const DEFAULT_ARROW_SIZE = new Dimension2( 20, 7 );

export type CarouselItem = GroupItemOptions;

type SelfOptions = {

  // container
  orientation?: LayoutOrientation;
  fill?: TPaint; // background color of the carousel
  stroke?: TPaint; // color used to stroke the border of the carousel
  lineWidth?: number; // width of the border around the carousel
  cornerRadius?: number; // radius applied to the carousel and next/previous buttons
  defaultPageNumber?: number; // page that is initially visible

  // items
  itemsPerPage?: number; // number of items per page, or how many items are visible at a time in the carousel
  spacing?: number; // spacing between items, between items and optional separators, and between items and buttons
  margin?: number; // margin between items and the edges of the carousel

  // options for the AlignBoxes (particularly if alignment of items should be changed, or if specific margins are desired)
  alignBoxOptions?: AlignBoxOptions;

  // next/previous button options
  buttonOptions?: CarouselButtonOptions;

  // item separator options
  separatorsVisible?: boolean; // whether to put separators between items
  separatorOptions?: SeparatorOptions;

  // animation, scrolling between pages
  animationEnabled?: boolean; // is animation enabled when scrolling between pages?
  animationOptions?: StrictOmit<AnimationOptions<number>, 'to' | 'setValue' | 'getValue'>; // We override to/setValue/getValue
};

export type CarouselOptions = SelfOptions & StrictOmit<NodeOptions, 'children'>;

export default class Carousel extends Node {

  // Items hold the data to create the carouselItemNode
  private readonly items: CarouselItem[];

  // each AlignBox holds a carouselItemNode and ensures proper sizing in the Carousel
  private readonly alignBoxes: AlignBox[];

  // Stores the visible align boxes
  private readonly visibleAlignBoxesProperty: UnknownDerivedProperty<AlignBox[]>;

  // created from createNode() in CarouselItem
  public readonly carouselItemNodes: Node[];

  private readonly itemsPerPage: number;
  private readonly defaultPageNumber: number;

  // number of pages in the carousel
  public readonly numberOfPagesProperty: ReadOnlyProperty<number>;

  // page number that is currently visible
  public readonly pageNumberProperty: Property<number>;

  // enables animation when scrolling between pages
  public animationEnabled: boolean;

  // These are public for layout - NOTE: These are mutated if the size changes after construction
  public backgroundWidth!: number;
  public backgroundHeight!: number;

  private readonly disposeCarousel: () => void;
  private readonly scrollingNode: FlowBox;

  /**
   * NOTE: This will dispose the item Nodes when the carousel is disposed
   */
  public constructor( items: CarouselItem[], providedOptions?: CarouselOptions ) {

    // Don't animate during initialization
    let isInitialized = false;

    // Override defaults with specified options
    const options = optionize<CarouselOptions, SelfOptions, NodeOptions>()( {

      // container
      orientation: 'horizontal',
      fill: 'white',
      stroke: 'black',
      lineWidth: 1,
      cornerRadius: 4,
      defaultPageNumber: 0,

      // items
      itemsPerPage: 4,
      spacing: 12,
      margin: 6,

      alignBoxOptions: {
        phetioType: IndexedNodeIO,
        phetioState: true,
        visiblePropertyOptions: {
          phetioFeatured: true
        }
      },

      // next/previous buttons
      buttonOptions: {
        xMargin: 5,
        yMargin: 5,

        // for dilating pointer areas of next/previous buttons such that they do not overlap with Carousel content
        touchAreaXDilation: 0,
        touchAreaYDilation: 0,
        mouseAreaXDilation: 0,
        mouseAreaYDilation: 0,

        baseColor: 'rgba( 200, 200, 200, 0.5 )',
        disabledColor: ColorConstants.LIGHT_GRAY,
        lineWidth: 1,

        arrowPathOptions: {
          stroke: 'black',
          lineWidth: 3
        },
        arrowSize: DEFAULT_ARROW_SIZE,

        enabledPropertyOptions: {
          phetioReadOnly: true,
          phetioFeatured: false
        },

        soundPlayer: pushButtonSoundPlayer
      },

      // item separators
      separatorsVisible: false,
      separatorOptions: {
        stroke: 'rgb( 180, 180, 180 )',
        lineWidth: 0.5,
        pickable: false
      },

      // animation, scrolling between pages
      animationEnabled: true,
      animationOptions: {
        duration: 0.4,
        stepEmitter: stepTimer,
        easing: Easing.CUBIC_IN_OUT
      },

      // phet-io
      tandem: Tandem.OPTIONAL,
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    }, providedOptions );

    super();

    this.animationEnabled = options.animationEnabled;
    this.items = items;
    this.itemsPerPage = options.itemsPerPage;
    this.defaultPageNumber = options.defaultPageNumber;

    // To improve readability
    const isHorizontal = ( options.orientation === 'horizontal' );
    const orientation = Orientation.fromLayoutOrientation( options.orientation );

    const alignGroup = new AlignGroup();

    const itemsTandem = options.tandem.createTandem( 'items' );
    this.carouselItemNodes = getGroupItemNodes( items, itemsTandem );

    // All items are wrapped in AlignBoxes to ensure consistent sizing
    this.alignBoxes = items.map( ( item, index ) => {
      return alignGroup.createBox( this.carouselItemNodes[ index ], combineOptions<AlignBoxOptions>( {
        tandem: item.tandemName ? itemsTandem.createTandem( item.tandemName ) : Tandem.OPTIONAL
      }, options.alignBoxOptions ) );
    } );

    // scrollingNode will contain all items, arranged in the proper orientation, with margins and spacing.
    // NOTE: We'll need to handle updates to the order (for phet-io IndexedNodeIO).
    // Horizontal carousel arrange items left-to-right, vertical is top-to-bottom.
    // Translation of this node will be animated to give the effect of scrolling through the items.
    this.scrollingNode = new FlowBox( {
      children: this.alignBoxes,
      orientation: options.orientation,
      spacing: options.spacing,
      [ `${orientation.opposite.coordinate}Margin` ]: options.margin
    } );

    // Visible AlignBoxes (these are the ones we lay out and base everything on)
    this.visibleAlignBoxesProperty = DerivedProperty.deriveAny( this.alignBoxes.map( alignBox => alignBox.visibleProperty ), () => {
      // The order of alignBoxes might be tweaked in scrollingNode's children. We need to respect this order
      return _.sortBy( this.alignBoxes.filter( alignBox => alignBox.visible ), alignBox => this.scrollingNode.children.indexOf( alignBox ) );
    } );

    // When the AlignBoxes are reordered, we need to recompute the visibleAlignBoxesProperty
    this.scrollingNode.childrenReorderedEmitter.addListener( () => {
      this.visibleAlignBoxesProperty.recomputeDerivation();
    } );

    // Options common to both buttons
    const buttonOptions = combineOptions<CarouselButtonOptions>( {
      cornerRadius: options.cornerRadius
    }, options.buttonOptions );

    assert && assert( options.spacing >= options.margin, 'The spacing must be >= the margin, or you will see ' +
                                                         'page 2 items at the end of page 1' );

    // In order to make it easy for phet-io to re-order items, the separators should not participate
    // in the layout and have indices that get moved around.  Therefore, we add a separate layer to
    // show the separators.
    const separatorLayer = options.separatorsVisible ? new Node( {
      pickable: false
    } ) : null;

    // Contains the scrolling node and the associated separators, if any
    const scrollingNodeContainer = new Node( {
      children: options.separatorsVisible ? [ separatorLayer!, this.scrollingNode ] : [ this.scrollingNode ]
    } );

    // Number of pages is derived from the total number of items and the number of items per page
    this.numberOfPagesProperty = new DerivedProperty( [ this.visibleAlignBoxesProperty ], visibleAlignBoxes => {
      // Have to have at least one page, even if it is blank
      return Math.max( Math.ceil( visibleAlignBoxes.length / options.itemsPerPage ), 1 );
    }, {
      isValidValue: v => v > 0
    } );

    assert && assert( options.defaultPageNumber >= 0 && options.defaultPageNumber <= this.numberOfPagesProperty.value - 1,
      `defaultPageNumber is out of range: ${options.defaultPageNumber}` );
    assert && assert( _.every( this.alignBoxes, box => box.visible ), 'All alignBoxes should be visible for the logic below' );

    // Number of the page that is visible in the carousel.
    this.pageNumberProperty = new NumberProperty( options.defaultPageNumber, {
      tandem: options.tandem.createTandem( 'pageNumberProperty' ),
      numberType: 'Integer',
      isValidValue: ( value: number ) => value < this.numberOfPagesProperty.value && value >= 0,
      // NOTE: This is the maximum range (since all the alignBoxes are visible currently)
      range: new Range( 0, this.numberOfPagesProperty.value - 1 ),
      phetioFeatured: true
    } );

    const buttonsVisibleProperty = new DerivedProperty( [ this.numberOfPagesProperty ], numberOfPages => {
      // always show the buttons if there is more than one page, and always hide the buttons if there is only one page
      return numberOfPages > 1;
    } );

    // Next button
    const nextButton = new CarouselButton( combineOptions<CarouselButtonOptions>( {
      arrowDirection: isHorizontal ? 'right' : 'down',
      tandem: options.tandem.createTandem( 'nextButton' ),
      listener: () => this.pageNumberProperty.set( this.pageNumberProperty.get() + 1 ),
      enabledProperty: new DerivedProperty( [ this.pageNumberProperty, this.numberOfPagesProperty ], ( pageNumber, numberofPages ) => {
        return pageNumber < numberofPages - 1;
      } ),
      visibleProperty: buttonsVisibleProperty
    }, buttonOptions ) );

    // Previous button
    const previousButton = new CarouselButton( combineOptions<CarouselButtonOptions>( {
      arrowDirection: isHorizontal ? 'left' : 'up',
      tandem: options.tandem.createTandem( 'previousButton' ),
      listener: () => this.pageNumberProperty.set( this.pageNumberProperty.get() - 1 ),
      enabledProperty: new DerivedProperty( [ this.pageNumberProperty ], pageNumber => {
        return pageNumber > 0;
      } ),
      visibleProperty: buttonsVisibleProperty
    }, buttonOptions ) );

    // Resize next/previous buttons dynamically
    alignGroup.getMaxSizeProperty( orientation.opposite ).link( maxOppositeSize => {
      const buttonOppositeSize = maxOppositeSize + ( 2 * options.margin );
      nextButton[ orientation.opposite.preferredSize ] = buttonOppositeSize;
      previousButton[ orientation.opposite.preferredSize ] = buttonOppositeSize;
    } );

    // Window size (content + margins, DOES NOT include the buttons)
    const windowSizeProperty = DerivedProperty.deriveAny( [
      this.visibleAlignBoxesProperty,
      scrollingNodeContainer.boundsProperty,
      ...this.alignBoxes.map( alignBox => alignBox.boundsProperty )
    ], () => {
      const visibleAlignBoxes = this.visibleAlignBoxesProperty.value;

      // This doesn't fill one page in number play preferences dialog when you forget locales=*,
      // so take the last item, even if it is not a full page
      const lastBox = visibleAlignBoxes[ options.itemsPerPage - 1 ] || visibleAlignBoxes[ visibleAlignBoxes.length - 1 ];
      const horizontalSize = new Dimension2(
        // Measure from the beginning of the first item to the end of the last item on the 1st page
        lastBox[ orientation.maxSide ] - visibleAlignBoxes[ 0 ][ orientation.minSide ] + ( 2 * options.margin ),

        scrollingNodeContainer.boundsProperty.value[ orientation.opposite.size ]
      );
      return isHorizontal ? horizontalSize : horizontalSize.swapped();
    }, {
      // So we don't needlessly toggle window sizes
      valueComparisonStrategy: 'equalsFunction'
    } );

    // Window with clipping area, so that the scrollingNodeContainer can be scrolled
    const windowNode = new Node( { children: [ scrollingNodeContainer ] } );
    windowSizeProperty.link( windowSize => {
      const bounds = windowSize.toBounds();
      windowNode.clipArea = Shape.bounds( bounds );

      // Specify the local bounds in order to ensure centering. For full pages, this is not necessary since the scrollingNodeContainer
      // already spans the full area. But for a partial page, this is necessary so the window will be centered.
      windowNode.localBounds = bounds;
    } );

    // Background - displays the carousel's fill color
    const backgroundNode = new Rectangle( {
      cornerRadius: options.cornerRadius,
      fill: options.fill
    } );

    // Foreground - displays the carousel's outline, created as a separate node so that it can be placed on top of
    // everything, for a clean look.
    const foregroundNode = new Rectangle( {
      cornerRadius: options.cornerRadius,
      stroke: options.stroke,
      pickable: false
    } );

    // Background size - includes the buttons, if they are visible.
    const backgroundSizeProperty = new DerivedProperty(
      [ windowSizeProperty, nextButton.visibleProperty, previousButton.visibleProperty ],
      ( windowSize, nextButtonVisible, previousButtonVisible ) => {
        let backgroundWidth;
        let backgroundHeight;
        if ( isHorizontal ) {

          // For horizontal orientation, buttons contribute to width, if they are visible.
          const nextButtonWidth = nextButtonVisible ? nextButton.width : 0;
          const previousButtonWidth = previousButtonVisible ? previousButton.width : 0;
          backgroundWidth = windowSize.width + nextButtonWidth + previousButtonWidth;
          backgroundHeight = windowSize.height;
        }
        else {

          // For vertical orientation, buttons contribute to height, if they are visible.
          const nextButtonHeight = nextButtonVisible ? nextButton.height : 0;
          const previousButtonHeight = previousButtonVisible ? previousButton.height : 0;
          backgroundWidth = windowSize.width;
          backgroundHeight = windowSize.height + nextButtonHeight + previousButtonHeight;
        }
        return new Dimension2( backgroundWidth, backgroundHeight );
      } );


    // Resize the background/foreground dynamically
    backgroundSizeProperty.link( backgroundSize => {
      this.backgroundWidth = backgroundSize.width;
      this.backgroundHeight = backgroundSize.height;

      const bounds = backgroundSize.toBounds();
      backgroundNode.rectBounds = bounds;
      foregroundNode.rectBounds = bounds;
    } );

    // Top-level layout (based on background changes)
    ManualConstraint.create( this, [ backgroundNode, windowNode, previousButton, nextButton ], ( backgroundProxy, windowProxy, previousProxy, nextProxy ) => {
      nextProxy[ orientation.opposite.centerCoordinate ] = backgroundProxy[ orientation.opposite.centerCoordinate ];
      previousProxy[ orientation.opposite.centerCoordinate ] = backgroundProxy[ orientation.opposite.centerCoordinate ];
      windowProxy[ orientation.opposite.centerCoordinate ] = backgroundProxy[ orientation.opposite.centerCoordinate ];
      previousProxy[ orientation.minSide ] = backgroundProxy[ orientation.minSide ];
      nextProxy[ orientation.maxSide ] = backgroundProxy[ orientation.maxSide ];
      windowProxy[ orientation.centerCoordinate ] = backgroundProxy[ orientation.centerCoordinate ];
    } );

    // Handle changing pages (or if the content changes)
    let scrollAnimation: Animation | null = null;
    const lastScrollBounds = new Bounds2( 0, 0, 0, 0 ); // used mutably
    Multilink.multilink( [ this.pageNumberProperty, scrollingNodeContainer.localBoundsProperty ], ( pageNumber, scrollBounds ) => {

      // We might temporarily hit this value. Bail out now instead of an assertion (it will get fired again)
      if ( pageNumber >= this.numberOfPagesProperty.value ) {
        return;
      }

      // stop any animation that's in progress
      scrollAnimation && scrollAnimation.stop();

      // Find the item at the top of pageNumber page
      const firstItemOnPage = this.visibleAlignBoxesProperty.value[ pageNumber * options.itemsPerPage ];

      // Place we want to scroll to
      const targetValue = firstItemOnPage ? ( ( -firstItemOnPage[ orientation.minSide ] ) + options.margin ) : 0;

      const scrollBoundsChanged = lastScrollBounds === null || !lastScrollBounds.equals( scrollBounds );
      lastScrollBounds.set( scrollBounds ); // scrollBounds is mutable, we get the same reference, don't store it

      // Only animate if animation is enabled and PhET-iO state is not being set.  When PhET-iO state is being set (as
      // in loading a customized state), the carousel should immediately reflect the desired page
      // Do not animate during initialization.
      // Do not animate when our scrollBounds have changed (our content probably resized)
      if ( this.animationEnabled && !window?.phet?.joist?.sim?.isSettingPhetioStateProperty?.value && isInitialized && !scrollBoundsChanged ) {

        // create and start the scroll animation
        scrollAnimation = new Animation( combineOptions<AnimationOptions<number>>( {}, options.animationOptions, {
          to: targetValue,

          // options that are specific to orientation
          getValue: () => scrollingNodeContainer[ orientation.coordinate ],
          setValue: ( value: number ) => { scrollingNodeContainer[ orientation.coordinate ] = value; }
        } ) );
        scrollAnimation.start();
      }
      else {

        // animation disabled, move immediate to new page
        scrollingNodeContainer[ orientation.coordinate ] = targetValue;
      }
    } );

    if ( options.separatorsVisible ) {
      // Cannot use VSeparator and HSeparator since they cannot participate in the index ordering.
      const updateSeparators = () => {
        if ( separatorLayer ) {
          const visibleChildren = this.visibleAlignBoxesProperty.value;

          // Add separators between the visible children
          separatorLayer.children = _.range( 1, visibleChildren.length ).map( index => {
            // Find the location between adjacent nodes
            const inbetween = ( visibleChildren[ index - 1 ][ orientation.maxSide ] +
                                visibleChildren[ index ][ orientation.minSide ] ) / 2;

            return new Separator( combineOptions<SeparatorOptions>( {
              [ `${orientation.coordinate}1` ]: inbetween,
              [ `${orientation.coordinate}2` ]: inbetween,
              [ `${orientation.opposite.coordinate}2` ]: this.scrollingNode[ orientation.opposite.size ]
            }, options.separatorOptions ) );
          } );
        }
      };

      // Whenever layout happens in the scrolling node, it's the perfect time to update the separators
      this.scrollingNode.constraint.finishedLayoutEmitter.addListener( () => {
        updateSeparators();
      } );
      // Additionally if we change visible alignBoxes, we need to update the separators
      this.visibleAlignBoxesProperty.link( updateSeparators );
      updateSeparators();
    }

    // Don't stay on a page that doesn't exist
    this.visibleAlignBoxesProperty.link( () => {
      // if the only element in the last page is removed, remove the page and autoscroll to the new final page
      this.pageNumberProperty.value = Math.min( this.pageNumberProperty.value, this.numberOfPagesProperty.value - 1 );
    } );

    options.children = [ backgroundNode, windowNode, nextButton, previousButton, foregroundNode ];

    this.disposeCarousel = () => {
      this.visibleAlignBoxesProperty.dispose();
      this.pageNumberProperty.dispose();
      this.alignBoxes.forEach( alignBox => {
        alignBox.children.forEach( child => child.dispose() );
        alignBox.dispose();
      } );
    };

    this.mutate( options );

    // Will allow potential animation after this
    isInitialized = true;

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'Carousel', this );
  }

  /**
   * NOTE: This will dispose the item Nodes
   */
  public override dispose(): void {
    this.disposeCarousel();
    super.dispose();
  }

  /**
   * Resets the carousel to its initial state.
   * @param animationEnabled - whether to enable animation during reset
   */
  public reset( animationEnabled = false ): void {
    const saveAnimationEnabled = this.animationEnabled;
    this.animationEnabled = animationEnabled;

    // Reset the page number to the default page number if possible (if things are hidden, it might not be possible)
    this.pageNumberProperty.value = Math.min( this.defaultPageNumber, this.numberOfPagesProperty.value - 1 );

    this.animationEnabled = saveAnimationEnabled;
  }

  /**
   * Given an item's visible index, scrolls the carousel to the page that contains that item.
   */
  private scrollToItemVisibleIndex( itemIndex: number ): void {
    this.pageNumberProperty.set( this.itemVisibleIndexToPageNumber( itemIndex ) );
  }

  /**
   * Given an item, scrolls the carousel to the page that contains that item. This will only scroll if item is in the
   * Carousel and visible.
   */
  public scrollToItem( item: CarouselItem ): void {
    // If the layout is dynamic, then only account for the visible items
    const alignBoxIndex = this.visibleAlignBoxesProperty.value.indexOf( this.getAlignBoxForItem( item ) );

    assert && assert( alignBoxIndex >= 0, 'item not present or visible' );
    if ( alignBoxIndex >= 0 ) {
      this.scrollToItemVisibleIndex( alignBoxIndex );
    }
  }

  /**
   * Set the visibility of an item in the Carousel. This toggles visibility and will reflow the layout, such that hidden
   * items do not leave a gap in the layout.
   */
  public setItemVisible( item: CarouselItem, visible: boolean ): void {
    this.getAlignBoxForItem( item ).visible = visible;
  }

  /**
   * Gets the AlignBox that wraps an item's Node.
   */
  private getAlignBoxForItem( item: CarouselItem ): AlignBox {
    const alignBox = this.alignBoxes[ this.items.indexOf( item ) ];

    assert && assert( alignBox, 'item does not have corresponding alignBox' );
    return alignBox;
  }

  /**
   * Returns the Node that was created for a given item.
   */
  public getNodeForItem( item: CarouselItem ): Node {
    const node = this.carouselItemNodes[ this.items.indexOf( item ) ];

    assert && assert( node, 'item does not have corresponding node' );
    return node;
  }

  private itemVisibleIndexToPageNumber( itemIndex: number ): number {
    assert && assert( itemIndex >= 0 && itemIndex < this.items.length, `itemIndex out of range: ${itemIndex}` );
    return Math.floor( itemIndex / this.itemsPerPage );
  }
}

sun.register( 'Carousel', Carousel );