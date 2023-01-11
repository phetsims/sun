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
import Timer from '../../axon/js/Timer.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import { Shape } from '../../kite/js/imports.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import merge from '../../phet-core/js/merge.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import { AlignBox, AlignGroup, HBox, IndexedNodeIO, Line, Node, NodeOptions, Rectangle, Separator, TColor, VBox } from '../../scenery/js/imports.js';
import TSoundPlayer from '../../tambo/js/TSoundPlayer.js';
import pushButtonSoundPlayer from '../../tambo/js/shared-sound-players/pushButtonSoundPlayer.js';
import Tandem from '../../tandem/js/Tandem.js';
import Animation from '../../twixt/js/Animation.js';
import Easing from '../../twixt/js/Easing.js';
import CarouselButton, { CarouselButtonOptions } from './buttons/CarouselButton.js';
import ColorConstants from './ColorConstants.js';
import sun from './sun.js';
import ReadOnlyProperty from '../../axon/js/ReadOnlyProperty.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';
import GroupItemOptions from './GroupItemOptions.js';

const DEFAULT_ARROW_SIZE = new Dimension2( 20, 7 );

export type CarouselItem = GroupItemOptions;

type SelfOptions = {

  // container
  orientation?: 'horizontal' | 'vertical';
  fill?: TColor; // background color of the carousel
  stroke?: TColor; // color used to stroke the border of the carousel
  lineWidth?: number; // width of the border around the carousel
  cornerRadius?: number; // radius applied to the carousel and next/previous buttons
  defaultPageNumber?: number; // page that is initially visible

  // items
  itemsPerPage?: number; // number of items per page, or how many items are visible at a time in the carousel
  spacing?: number; // spacing between items, between items and optional separators, and between items and buttons
  margin?: number; // margin between items and the edges of the carousel

  // next/previous buttons
  buttonColor?: TColor; // base color for the buttons
  buttonStroke?: TColor | 'derived'; // stroke around the buttons, 'derived' derives a stroke from buttonColor
  buttonDisabledColor?: TColor; // same default as from ButtonNode.js
  buttonLineWidth?: number; // lineWidth of borders on buttons
  arrowSize?: Dimension2; // size of the arrow, in 'up' directions
  arrowStroke?: TColor; // color used for the arrow icons
  arrowLineWidth?: number; // line width used to stroke the arrow icons
  buttonSoundPlayer?: TSoundPlayer; // sound played when carousel button is pressed

  // for dilating pointer areas of next/previous buttons such that they do not overlap with Carousel content
  buttonTouchAreaXDilation?: number; // horizontal touchArea dilation
  buttonTouchAreaYDilation?: number; // vertical touchArea dilation
  buttonMouseAreaXDilation?: number; // horizontal mouseArea dilation
  buttonMouseAreaYDilation?: number; // vertical mouseArea dilation

  // item separators
  separatorsVisible?: boolean; // whether to put separators between items
  separatorColor?: TColor; // color for separators
  separatorLineWidth?: number; // lineWidth for separators

  // animation, scrolling between pages
  animationEnabled?: boolean; // is animation enabled when scrolling between pages?
  animationDuration?: number; // seconds
  stepEmitter?: Timer; // see Animation options.stepEmitter
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
  private readonly scrollingNode: HBox | VBox;

  /**
   * @param items - Nodes shown in the carousel
   * @param providedOptions
   */
  public constructor( items: CarouselItem[], providedOptions?: CarouselOptions ) {

    // Don't animate layout during initialization
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
      buttonColor: 'rgba( 200, 200, 200, 0.5 )',
      buttonStroke: 'derived',
      buttonDisabledColor: ColorConstants.LIGHT_GRAY,
      buttonLineWidth: 1,
      arrowSize: DEFAULT_ARROW_SIZE,
      arrowStroke: 'black',
      arrowLineWidth: 3,
      buttonSoundPlayer: pushButtonSoundPlayer,

      // for dilating pointer areas of next/previous buttons such that they do not overlap with Carousel content
      buttonTouchAreaXDilation: 0,
      buttonTouchAreaYDilation: 0,
      buttonMouseAreaXDilation: 0,
      buttonMouseAreaYDilation: 0,

      // item separators
      separatorsVisible: false,
      separatorColor: 'rgb( 180, 180, 180 )',
      separatorLineWidth: 0.5,

      // animation, scrolling between pages
      animationEnabled: true,
      animationDuration: 0.4,
      stepEmitter: stepTimer,

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

    // To improve readability
    const isHorizontal = ( options.orientation === 'horizontal' );

    // Dimensions of largest item
    const maxItemWidth = _.maxBy( alignBoxes, ( item: Node ) => item.width )!.width;
    const maxItemHeight = _.maxBy( alignBoxes, ( item: Node ) => item.height )!.height;

    // Options common to both buttons
    const buttonOptions = {
      xMargin: 5,
      yMargin: 5,
      cornerRadius: options.cornerRadius,
      baseColor: options.buttonColor,
      disabledColor: options.buttonDisabledColor,
      stroke: ( options.buttonStroke === 'derived' ) ? undefined : options.buttonStroke,
      lineWidth: options.buttonLineWidth,
      minWidth: isHorizontal ? 0 : maxItemWidth + ( 2 * options.margin ), // fill the width of a vertical carousel
      minHeight: isHorizontal ? maxItemHeight + ( 2 * options.margin ) : 0, // fill the height of a horizontal carousel
      arrowSize: options.arrowSize,
      arrowStroke: options.arrowStroke,
      arrowLineWidth: options.arrowLineWidth,
      touchAreaXDilation: options.buttonTouchAreaXDilation,
      touchAreaYDilation: options.buttonTouchAreaYDilation,
      mouseAreaXDilation: options.buttonMouseAreaXDilation,
      mouseAreaYDilation: options.buttonMouseAreaYDilation,
      soundPlayer: options.buttonSoundPlayer,
      enabledPropertyOptions: {
        phetioReadOnly: true,
        phetioFeatured: false
      }
    } as const;

    assert && assert( options.spacing >= options.margin, 'The spacing must be >= the margin, or you will see ' +
                                                         'page 2 items at the end of page 1' );

    // Next/previous buttons
    const nextButton = new CarouselButton( combineOptions<CarouselButtonOptions>( {
      arrowDirection: isHorizontal ? 'right' : 'down',
      tandem: options.tandem.createTandem( 'nextButton' )
    }, buttonOptions ) );
    const previousButton = new CarouselButton( combineOptions<CarouselButtonOptions>( {
      arrowDirection: isHorizontal ? 'left' : 'up',
      tandem: options.tandem.createTandem( 'previousButton' )
    }, buttonOptions ) );

    super();

    this.alignBoxes = alignBoxes;
    this.carouselItemNodes = alignBoxes.map( alignBox => {
      assert && assert( alignBox.children.length === 1, 'only the created node should be the child' );
      return alignBox.children[ 0 ];
    } );

    // enables animation when scrolling between pages
    this.animationEnabled = options.animationEnabled;

    // All items, arranged in the proper orientation, with margins and spacing.
    // Horizontal carousel arrange items left-to-right, vertical is top-to-bottom.
    // Translation of this node will be animated to give the effect of scrolling through the items.
    const scrollingNode = isHorizontal ? new HBox( {
      children: alignBoxes,
      spacing: options.spacing,
      yMargin: options.margin
    } ) : new VBox( {
      children: alignBoxes,
      spacing: options.spacing,
      xMargin: options.margin
    } );

    this.scrollingNode = scrollingNode;

    // In order to make it easy for phet-io to re-order items, the separators should not participate
    // in the layout and have indices that get moved around.  Therefore, we add a separate layer to
    // show the separators.
    const separatorLayer = new Node( {
      pickable: false
    } );

    // Cannot use VSeparator and HSeparator since they cannot participate in the index ordering.
    const updateSeparators = () => {
      const separators: Line[] = [];
      const visibleChildren = scrollingNode.children.filter( child => child.visible );
      for ( let i = 0; i < visibleChildren.length - 1; i++ ) {
        const a = visibleChildren[ i ];
        const b = visibleChildren[ i + 1 ];

        const x1 = isHorizontal ? ( a.right + b.left ) / 2 : 0;
        const y1 = isHorizontal ? 0 : ( a.bottom + b.top ) / 2;

        const x2 = isHorizontal ? x1 : scrollingNode.width;
        const y2 = isHorizontal ? scrollingNode.height : ( a.bottom + b.top ) / 2;

        separators.push( new Separator( {
          x1: x1, y1: y1, x2: x2, y2: y2,
          stroke: options.separatorColor,
          lineWidth: options.separatorLineWidth,
          pickable: false
        } ) );
      }

      separatorLayer.children = separators;
    };

    updateSeparators();

    const powerNode = new Node( { children: options.separatorsVisible ? [ separatorLayer, scrollingNode ] : [ scrollingNode ] } );

    // Number of pages
    this.numberOfPagesProperty = DerivedProperty.deriveAny( alignBoxes.map( item => item.visibleProperty ), () => {
      let numberOfPages = alignBoxes.filter( item => item.visible ).length / options.itemsPerPage;
      if ( !Number.isInteger( numberOfPages ) ) {
        numberOfPages = Math.floor( numberOfPages + 1 );
      }

      // Have to have at least one page, even if it is blank
      return Math.max( numberOfPages, 1 );
    }, {
      isValidValue: v => v > 0
    } );

    // Number of the page that is visible in the carousel.
    assert && assert( options.defaultPageNumber >= 0 && options.defaultPageNumber <= this.numberOfPagesProperty.value - 1,
      `defaultPageNumber is out of range: ${options.defaultPageNumber}` );
    const pageNumberProperty = new NumberProperty( options.defaultPageNumber, {
      tandem: options.tandem.createTandem( 'pageNumberProperty' ),
      numberType: 'Integer',
      validValues: _.range( this.numberOfPagesProperty.value ),
      phetioFeatured: true
    } );

    // Measure from the beginning of the first item to the end of the last item on the 1st page

    // This doesn't fill one page in number play preferences dialog when you forget locales=*,
    // so take the last item, even if it is not a full page
    const last = alignBoxes[ options.itemsPerPage - 1 ] || alignBoxes[ alignBoxes.length - 1 ];

    const windowLength = isHorizontal ?
                         last.right - alignBoxes[ 0 ].left + options.margin * 2 :
                         last.bottom - alignBoxes[ 0 ].top + options.margin * 2;
    const windowWidth = isHorizontal ? windowLength : powerNode.width;
    const windowHeight = isHorizontal ? powerNode.height : windowLength;
    const clipArea = Shape.rectangle( 0, 0, windowWidth, windowHeight );
    const windowNode = new Node( {
      children: [ powerNode ],
      clipArea: clipArea
    } );

    // Background - displays the carousel's fill color
    this.backgroundWidth = isHorizontal ? ( windowWidth + nextButton.width + previousButton.width ) : windowWidth;
    this.backgroundHeight = isHorizontal ? windowHeight : ( windowHeight + nextButton.height + previousButton.height );
    const backgroundNode = new Rectangle( 0, 0, this.backgroundWidth, this.backgroundHeight, options.cornerRadius, options.cornerRadius, {
      fill: options.fill
    } );

    // Foreground - displays the carousel's outline, created as a separate node so that it can be placed on top of everything, for a clean look.
    const foregroundNode = new Rectangle( 0, 0, this.backgroundWidth, this.backgroundHeight, options.cornerRadius, options.cornerRadius, {
      stroke: options.stroke,
      pickable: false
    } );

    // Layout
    if ( isHorizontal ) {
      nextButton.centerY = previousButton.centerY = windowNode.centerY = backgroundNode.centerY;
      nextButton.right = backgroundNode.right;
      previousButton.left = backgroundNode.left;
      windowNode.centerX = backgroundNode.centerX;
    }
    else {
      nextButton.centerX = previousButton.centerX = windowNode.centerX = backgroundNode.centerX;
      nextButton.bottom = backgroundNode.bottom;
      previousButton.top = backgroundNode.top;
      windowNode.centerY = backgroundNode.centerY;
    }

    // Change pages
    let scrollAnimation: Animation | null = null;

    // This is called when pageNumberProperty changes AND when the total numberOfPagesProperty changes.
    const pageNumberListener = ( pageNumber: number ) => {

      assert && assert( pageNumber >= 0 && pageNumber <= this.numberOfPagesProperty.value - 1, `pageNumber out of range: ${pageNumber}` );

      // button state
      nextButton.enabled = pageNumber < ( this.numberOfPagesProperty.value - 1 );
      previousButton.enabled = pageNumber > 0;
      if ( this.numberOfPagesProperty.value === 1 ) {
        nextButton.visible = nextButton.enabled;
        previousButton.visible = previousButton.enabled;
      }

      // stop any animation that's in progress
      scrollAnimation && scrollAnimation.stop();

      // Only animate if animation is enabled and PhET-iO state is not being set.  When PhET-iO state is being set (as
      // in loading a customized state), the carousel should immediately reflect the desired page
      const itemsInLayout = scrollingNode.children.filter( item => item.visible );

      // Find the item at the top of pageNumber page
      const firstItemOnPage = itemsInLayout[ pageNumber * options.itemsPerPage ];


      // Place we want to scroll to
      const targetValue = firstItemOnPage ? ( ( isHorizontal ? -firstItemOnPage.left : -firstItemOnPage.top ) + options.margin )
                                          : 0;

      // Do not animate during initialization.
      if ( this.animationEnabled && !phet.joist.sim.isSettingPhetioStateProperty.value && isInitialized ) {

        // options that are independent of orientation
        let animationOptions = {
          duration: options.animationDuration,
          stepEmitter: options.stepEmitter,
          easing: Easing.CUBIC_IN_OUT
        };

        // options that are specific to orientation
        if ( isHorizontal ) {
          animationOptions = merge( {
            getValue: () => powerNode.left,
            setValue: ( value: number ) => { powerNode.left = value; },
            to: targetValue
          }, animationOptions );
        }
        else {
          animationOptions = merge( {
            getValue: () => powerNode.top,
            setValue: ( value: number ) => { powerNode.top = value; },
            to: targetValue
          }, animationOptions );
        }

        // create and start the scroll animation
        scrollAnimation = new Animation( animationOptions );
        scrollAnimation.start();
      }
      else {

        // animation disabled, move immediate to new page
        if ( isHorizontal ) {
          powerNode.left = targetValue;
        }
        else {
          powerNode.top = targetValue;
        }
      }
    };

    pageNumberProperty.link( pageNumberListener );

    const updatePageCount = () => {

      if ( pageNumberProperty.value >= this.numberOfPagesProperty.value ) {
        pageNumberProperty.value = this.numberOfPagesProperty.value - 1;
      }

      pageNumberListener( pageNumberProperty.value );

      updateSeparators();
    };

    // NOTE: the alignBox visibleProperty is the same as the item Node visibleProperty
    alignBoxes.forEach( alignBox => alignBox.visibleProperty.link( updatePageCount ) );

    // Buttons modify the page number
    nextButton.addListener( () => pageNumberProperty.set( pageNumberProperty.get() + 1 ) );
    previousButton.addListener( () => pageNumberProperty.set( pageNumberProperty.get() - 1 ) );

    this.items = items;
    this.itemsPerPage = options.itemsPerPage;
    this.pageNumberProperty = pageNumberProperty;

    options.children = [ backgroundNode, windowNode, nextButton, previousButton, foregroundNode ];

    this.disposeCarousel = () => {
      pageNumberProperty.unlink( pageNumberListener );
      alignBoxes.forEach( alignBox => {
        alignBox.visibleProperty.unlink( updatePageCount );
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
    this.pageNumberProperty.reset();
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
    const itemIndex = this.items.indexOf( item );
    const itemAlignBox = this.alignBoxes[ itemIndex ];

    itemAlignBox.visible = visible;
  }

  // Return the created node given a CarouselItem
  public getCreatedNodeForItem( item: CarouselItem ): Node {
    const itemIndex = this.items.indexOf( item );
    const node = this.carouselItemNodes[ itemIndex ];
    assert && assert( node, 'item does not have corresponding node' );
    return node;
  }

  /**
   * Converts an item index to a page number.
   */
  private itemIndexToPageNumber( itemIndex: number ): number {
    assert && assert( itemIndex >= 0 && itemIndex < this.items.length, `itemIndex out of range: ${itemIndex}` );
    return Math.floor( itemIndex / this.itemsPerPage );
  }
}

sun.register( 'Carousel', Carousel );