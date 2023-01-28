// Copyright 2015-2022, University of Colorado Boulder

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
import { AlignBox, AlignGroup, FlowBox, IndexedNodeIO, LayoutOrientation, Line, Node, NodeOptions, Rectangle, Separator, SeparatorOptions, TPaint } from '../../scenery/js/imports.js';
import pushButtonSoundPlayer from '../../tambo/js/shared-sound-players/pushButtonSoundPlayer.js';
import Tandem from '../../tandem/js/Tandem.js';
import Animation, { AnimationOptions } from '../../twixt/js/Animation.js';
import Easing from '../../twixt/js/Easing.js';
import CarouselButton, { CarouselButtonOptions } from './buttons/CarouselButton.js';
import ColorConstants from './ColorConstants.js';
import sun from './sun.js';
import ReadOnlyProperty from '../../axon/js/ReadOnlyProperty.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';
import GroupItemOptions from './GroupItemOptions.js';
import Orientation from '../../phet-core/js/Orientation.js';

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

  // These are public for layout
  public readonly backgroundWidth: number;
  private readonly backgroundHeight: number;

  private readonly disposeCarousel: () => void;
  private readonly scrollingNode: FlowBox;

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

    const alignGroup = new AlignGroup();
    const alignBoxes = items.map( item => {
      return alignGroup.createBox( item.createNode( Tandem.OPT_OUT ), {
        tandem: item.tandemName ? options.tandem.createTandem( 'items' ).createTandem( item.tandemName ) : Tandem.OPTIONAL,
        phetioType: IndexedNodeIO,
        phetioState: true
      } );
    } );
    const visibleAlignBoxesProperty = DerivedProperty.deriveAny( alignBoxes.map( alignBox => alignBox.visibleProperty ), () => {
      return alignBoxes.filter( alignBox => alignBox.visible );
    } );

    // To improve readability
    const isHorizontal = ( options.orientation === 'horizontal' );
    const orientation = Orientation.fromLayoutOrientation( options.orientation );

    // Options common to both buttons
    const buttonOptions = combineOptions<CarouselButtonOptions>( {
      cornerRadius: options.cornerRadius,
      enabledPropertyOptions: {
        phetioReadOnly: true,
        phetioFeatured: false
      }
    }, options.buttonOptions );

    assert && assert( options.spacing >= options.margin, 'The spacing must be >= the margin, or you will see ' +
                                                         'page 2 items at the end of page 1' );

    super();

    this.alignBoxes = alignBoxes;
    this.carouselItemNodes = alignBoxes.map( alignBox => alignBox.content );

    // enables animation when scrolling between pages
    this.animationEnabled = options.animationEnabled;

    // All items, arranged in the proper orientation, with margins and spacing.
    // Horizontal carousel arrange items left-to-right, vertical is top-to-bottom.
    // Translation of this node will be animated to give the effect of scrolling through the items.
    const scrollingNode = new FlowBox( {
      orientation: options.orientation,
      children: alignBoxes,
      spacing: options.spacing,
      [ `${orientation.opposite.coordinate}Margin` ]: options.margin
    } );
    this.scrollingNode = scrollingNode;

    // In order to make it easy for phet-io to re-order items, the separators should not participate
    // in the layout and have indices that get moved around.  Therefore, we add a separate layer to
    // show the separators.
    const separatorLayer = options.separatorsVisible ? new Node( {
      pickable: false
    } ) : null;

    // Cannot use VSeparator and HSeparator since they cannot participate in the index ordering.
    const updateSeparators = () => {
      if ( separatorLayer ) {
        if ( options.separatorsVisible ) {
          const visibleChildren = visibleAlignBoxesProperty.value;
          separatorLayer.children = _.range( 1, visibleChildren.length ).map( index => {
            // Find the location between adjacent nodes
            const inbetween = ( visibleChildren[ index - 1 ][ orientation.maxSide ] +
                                visibleChildren[ index ][ orientation.minSide ] ) / 2;

            return new Separator( combineOptions<SeparatorOptions>( {
              [ `${orientation.coordinate}1` ]: inbetween,
              [ `${orientation.coordinate}2` ]: inbetween,
              [ `${orientation.opposite.coordinate}2` ]: scrollingNode[ orientation.opposite.size ]
            }, options.separatorOptions ) );
          } );
        }
        else {
          separatorLayer.removeAllChildren();
        }
      }
    };
    updateSeparators();

    // Contains the scrolling node and the associated separators, if any
    const scrollingNodeContainer = new Node( { children: options.separatorsVisible ? [ separatorLayer!, scrollingNode ] : [ scrollingNode ] } );

    // Number of pages is derived from the total number of items and the number of items per page
    this.numberOfPagesProperty = new DerivedProperty( [ visibleAlignBoxesProperty ], visibleAlignBoxes => {
      // Have to have at least one page, even if it is blank
      return Math.max( Math.ceil( visibleAlignBoxes.length / options.itemsPerPage ), 1 );
    }, {
      isValidValue: v => v > 0
    } );

    // Number of the page that is visible in the carousel.
    assert && assert( options.defaultPageNumber >= 0 && options.defaultPageNumber <= this.numberOfPagesProperty.value - 1,
      `defaultPageNumber is out of range: ${options.defaultPageNumber}` );
    assert && assert( _.every( alignBoxes, box => box.visible ), 'All alignBoxes should be visible for the logic below' );
    const pageNumberProperty = new NumberProperty( options.defaultPageNumber, {
      tandem: options.tandem.createTandem( 'pageNumberProperty' ),
      numberType: 'Integer',
      isValidValue: ( value: number ) => value < this.numberOfPagesProperty.value && value >= 0,
      // NOTE: This is the maximum range (since all of the alignBoxes are visible currently)
      range: new Range( 0, this.numberOfPagesProperty.value - 1 ),
      phetioFeatured: true
    } );

    const buttonsVisibleProperty = new DerivedProperty( [ this.numberOfPagesProperty ], numberOfPages => {
      // always show the buttons if there is more than one page, and always hide the buttons if there is only one page
      return numberOfPages > 1;
    } );

    // Next/previous buttons
    const nextButton = new CarouselButton( combineOptions<CarouselButtonOptions>( {
      arrowDirection: isHorizontal ? 'right' : 'down',
      tandem: options.tandem.createTandem( 'nextButton' ),
      listener: () => pageNumberProperty.set( pageNumberProperty.get() + 1 ),
      enabledProperty: new DerivedProperty( [ pageNumberProperty, this.numberOfPagesProperty ], ( pageNumber, numberofPages ) => {
        return pageNumber < numberofPages - 1;
      } ),
      visibleProperty: buttonsVisibleProperty
    }, buttonOptions ) );

    const previousButton = new CarouselButton( combineOptions<CarouselButtonOptions>( {
      arrowDirection: isHorizontal ? 'left' : 'up',
      tandem: options.tandem.createTandem( 'previousButton' ),
      listener: () => pageNumberProperty.set( pageNumberProperty.get() - 1 ),
      enabledProperty: new DerivedProperty( [ pageNumberProperty ], pageNumber => {
        return pageNumber > 0;
      } ),
      visibleProperty: buttonsVisibleProperty
    }, buttonOptions ) );

    alignGroup.getMaxSizeProperty( orientation.opposite ).link( maxOppositeSize => {
      const buttonOppositeSize = maxOppositeSize + ( 2 * options.margin );
      nextButton[ orientation.opposite.preferredSize ] = buttonOppositeSize;
      previousButton[ orientation.opposite.preferredSize ] = buttonOppositeSize;
    } );

    // This doesn't fill one page in number play preferences dialog when you forget locales=*,
    // so take the last item, even if it is not a full page
    const last = alignBoxes[ options.itemsPerPage - 1 ] || alignBoxes[ alignBoxes.length - 1 ];

    // Measure from the beginning of the first item to the end of the last item on the 1st page
    const windowLength = isHorizontal ?
                         last.right - alignBoxes[ 0 ].left + options.margin * 2 :
                         last.bottom - alignBoxes[ 0 ].top + options.margin * 2;
    const windowWidth = isHorizontal ? windowLength : scrollingNodeContainer.width;
    const windowHeight = isHorizontal ? scrollingNodeContainer.height : windowLength;
    const clipArea = Shape.rectangle( 0, 0, windowWidth, windowHeight );
    const windowNode = new Node( {
      children: [ scrollingNodeContainer ],
      clipArea: clipArea,

      // Specify the local bounds in order to ensure centering. For full pages, this is not necessary since the scrollingNodeContainer
      // already spans the full area. But for a partial page, this is necessary so the window will be centered.
      localBounds: clipArea.getBounds()
    } );

    // Background - displays the carousel's fill color
    this.backgroundWidth = isHorizontal ? ( windowWidth + nextButton.width + previousButton.width ) : windowWidth;
    this.backgroundHeight = isHorizontal ? windowHeight : ( windowHeight + nextButton.height + previousButton.height );
    const backgroundNode = new Rectangle( {
      rectWidth: this.backgroundWidth,
      rectHeight: this.backgroundHeight,
      cornerRadius: options.cornerRadius,
      fill: options.fill
    } );

    // Foreground - displays the carousel's outline, created as a separate node so that it can be placed on top of everything, for a clean look.
    const foregroundNode = new Rectangle( {
      rectWidth: this.backgroundWidth,
      rectHeight: this.backgroundHeight,
      cornerRadius: options.cornerRadius,
      stroke: options.stroke,
      pickable: false
    } );

    // Layout
    nextButton[ orientation.opposite.centerCoordinate ] = backgroundNode[ orientation.opposite.centerCoordinate ];
    previousButton[ orientation.opposite.centerCoordinate ] = backgroundNode[ orientation.opposite.centerCoordinate ];
    windowNode[ orientation.opposite.centerCoordinate ] = backgroundNode[ orientation.opposite.centerCoordinate ];
    previousButton[ orientation.minSide ] = backgroundNode[ orientation.minSide ];
    nextButton[ orientation.maxSide ] = backgroundNode[ orientation.maxSide ];
    windowNode[ orientation.centerCoordinate ] = backgroundNode[ orientation.centerCoordinate ];

    // Change pages
    let scrollAnimation: Animation | null = null;

    pageNumberProperty.link( pageNumber => {

      assert && assert( pageNumber >= 0 && pageNumber <= this.numberOfPagesProperty.value - 1, `pageNumber out of range: ${pageNumber}` );

      // stop any animation that's in progress
      scrollAnimation && scrollAnimation.stop();

      // Find the item at the top of pageNumber page
      const firstItemOnPage = visibleAlignBoxesProperty.value[ pageNumber * options.itemsPerPage ];

      // Place we want to scroll to
      const targetValue = firstItemOnPage ? ( ( firstItemOnPage[ orientation.minSide ] ) + options.margin ) : 0;

      // Only animate if animation is enabled and PhET-iO state is not being set.  When PhET-iO state is being set (as
      // in loading a customized state), the carousel should immediately reflect the desired page
      // Do not animate during initialization.
      if ( this.animationEnabled && !window?.phet?.joist?.sim?.isSettingPhetioStateProperty?.value && isInitialized ) {

        // create and start the scroll animation
        scrollAnimation = new Animation( combineOptions<AnimationOptions<number>>( {}, options.animationOptions, {
          to: targetValue,

          // options that are specific to orientation
          getValue: () => scrollingNodeContainer[ orientation.minSide ],
          setValue: ( value: number ) => { scrollingNodeContainer[ orientation.minSide ] = value; }
        } ) );
        scrollAnimation.start();
      }
      else {

        // animation disabled, move immediate to new page
        scrollingNodeContainer[ orientation.minSide ] = targetValue;
      }
    } );

    visibleAlignBoxesProperty.link( () => {
      // if the only element in the last page is removed, remove the page and autoscroll to the new final page
      pageNumberProperty.value = Math.min( pageNumberProperty.value, this.numberOfPagesProperty.value - 1 );

      updateSeparators();
    } );

    this.items = items;
    this.itemsPerPage = options.itemsPerPage;
    this.defaultPageNumber = options.defaultPageNumber;
    this.pageNumberProperty = pageNumberProperty;

    options.children = [ backgroundNode, windowNode, nextButton, previousButton, foregroundNode ];

    this.disposeCarousel = () => {
      visibleAlignBoxesProperty.dispose();
      pageNumberProperty.dispose();
      alignBoxes.forEach( alignBox => {
        alignBox.children.forEach( child => child.dispose() );
        alignBox.dispose();
      } );
    };

    this.mutate( options );

    isInitialized = true;

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'Carousel', this );
  }

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
    this.pageNumberProperty.value = Math.min( this.defaultPageNumber, this.numberOfPagesProperty.value - 1 );
    this.animationEnabled = saveAnimationEnabled;
  }

  /**
   * Given an item's index, scrolls the carousel to the page that contains that item.
   */
  public scrollToItemIndex( itemIndex: number ): void {
    this.pageNumberProperty.set( this.itemIndexToPageNumber( itemIndex ) );
  }

  /**
   * Given an item, scrolls the carousel to the page that contains that item. This will only scroll if item is in the
   * Carousel and visible.
   */
  public scrollToItem( item: CarouselItem ): void {

    const itemIndex = this.items.indexOf( item );
    const itemAlignBox = this.alignBoxes[ itemIndex ];

    // If the layout is dynamic, then only account for the visible items
    const alignBoxesInLayout = this.scrollingNode.children.filter( alignBox => {
      assert && assert( alignBox instanceof AlignBox ); // eslint-disable-line no-simple-type-checking-assertions
      return alignBox.visible;
    } );
    const alignBoxIndex = alignBoxesInLayout.indexOf( itemAlignBox );

    assert && assert( alignBoxIndex >= 0, 'item not present or visible' );

    this.scrollToItemIndex( alignBoxIndex );
  }

  /**
   * Set the visibility of an item in the Carousel. This toggles visibility and will reflow the layout, such that hidden
   * items do not leave a gap in the layout.
   */
  public setItemVisibility( item: CarouselItem, visible: boolean ): void {
    this.getAlignBoxForItem( item ).visible = visible;
  }

  public getAlignBoxForItem( item: CarouselItem ): AlignBox {
    const itemIndex = this.items.indexOf( item );
    const alignBox = this.alignBoxes[ itemIndex ];

    assert && assert( alignBox, 'item does not have corresponding alignBox' );
    return alignBox;
  }

  public getCreatedNodeForItem( item: CarouselItem ): Node {
    const itemIndex = this.items.indexOf( item );
    const node = this.carouselItemNodes[ itemIndex ];

    assert && assert( node, 'item does not have corresponding node' );
    return node;
  }

  private itemIndexToPageNumber( itemIndex: number ): number {
    assert && assert( itemIndex >= 0 && itemIndex < this.items.length, `itemIndex out of range: ${itemIndex}` );
    return Math.floor( itemIndex / this.itemsPerPage );
  }
}

sun.register( 'Carousel', Carousel );