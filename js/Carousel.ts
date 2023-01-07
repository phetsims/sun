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
import { AlignGroup, HBox, HSeparator, HSeparatorOptions, Node, NodeOptions, Rectangle, TColor, VBox, VSeparator, VSeparatorOptions } from '../../scenery/js/imports.js';
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

const DEFAULT_ARROW_SIZE = new Dimension2( 20, 7 );

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
  hideDisabledButtons?: boolean; // whether to hide buttons when they are disabled
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

  private readonly items: Node[];

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

  /**
   * @param items - Nodes shown in the carousel
   * @param providedOptions
   */
  public constructor( items: Node[], providedOptions?: CarouselOptions ) {

    // Don't animate layout during initialization
    let isInitialized = false;

    const alignGroup = new AlignGroup();
    const alignBoxes = items.map( item => {
      const alignBox = alignGroup.createBox( item, {

        // The alignBoxes are in the HBox/VBox, so we must link their visibleProperties to relayout when item visibility changes
        visibleProperty: item.visibleProperty
      } );
      return alignBox;
    } );

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
      spacing: 10,
      margin: 10,

      // next/previous buttons
      buttonColor: 'rgba( 200, 200, 200, 0.5 )',
      buttonStroke: 'derived',
      buttonDisabledColor: ColorConstants.LIGHT_GRAY,
      buttonLineWidth: 1,
      arrowSize: DEFAULT_ARROW_SIZE,
      arrowStroke: 'black',
      arrowLineWidth: 3,
      hideDisabledButtons: false,
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

    // Options common to all separators
    const separatorOptions = {
      stroke: options.separatorColor,
      lineWidth: options.separatorLineWidth
    };

    super();

    // enables animation when scrolling between pages
    this.animationEnabled = options.animationEnabled;

    const children: Node[] = [];

    alignBoxes.forEach( item => {
      children.push( item );

      if ( options.separatorsVisible ) {
        children.push( isHorizontal ? new VSeparator( combineOptions<VSeparatorOptions>( separatorOptions, {
          localMinimumHeight: maxItemHeight + 2 * options.margin
        } ) ) : new HSeparator( combineOptions<HSeparatorOptions>( separatorOptions, {
          localMinimumWidth: maxItemWidth + 2 * options.margin
        } ) ) );
      }
    } );

    // All items, arranged in the proper orientation, with margins and spacing.
    // Horizontal carousel arrange items left-to-right, vertical is top-to-bottom.
    // Translation of this node will be animated to give the effect of scrolling through the items.
    const scrollingNode = isHorizontal ? new HBox( {
      children: children,
      spacing: options.spacing,
      yMargin: options.separatorsVisible ? 0 : options.margin
    } ) : new VBox( {
      children: children,
      spacing: options.spacing,
      xMargin: options.separatorsVisible ? 0 : options.margin
    } );

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
    const windowLength = isHorizontal ?
                         alignBoxes[ options.itemsPerPage - 1 ].right - alignBoxes[ 0 ].left + options.margin * 2 :
                         alignBoxes[ options.itemsPerPage - 1 ].bottom - alignBoxes[ 0 ].top + options.margin * 2;
    const windowWidth = isHorizontal ? windowLength : scrollingNode.width;
    const windowHeight = isHorizontal ? scrollingNode.height : windowLength;
    const clipArea = Shape.rectangle( 0, 0, windowWidth, windowHeight );
    const windowNode = new Node( {
      children: [ scrollingNode ],
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
      if ( options.hideDisabledButtons || this.numberOfPagesProperty.value === 1 ) {
        nextButton.visible = nextButton.enabled;
        previousButton.visible = previousButton.enabled;
      }

      // stop any animation that's in progress
      scrollAnimation && scrollAnimation.stop();

      // Only animate if animation is enabled and PhET-iO state is not being set.  When PhET-iO state is being set (as
      // in loading a customized state), the carousel should immediately reflect the desired page
      const itemsInLayout = alignBoxes.filter( item => item.visible );

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
            getValue: () => scrollingNode.left,
            setValue: ( value: number ) => { scrollingNode.left = value; },
            to: targetValue
          }, animationOptions );
        }
        else {
          animationOptions = merge( {
            getValue: () => scrollingNode.top,
            setValue: ( value: number ) => { scrollingNode.top = value; },
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
          scrollingNode.left = targetValue;
        }
        else {
          scrollingNode.top = targetValue;
        }
      }
    };

    pageNumberProperty.link( pageNumberListener );

    const updatePageCount = () => {

      if ( pageNumberProperty.value >= this.numberOfPagesProperty.value ) {
        pageNumberProperty.value = this.numberOfPagesProperty.value - 1;
      }

      pageNumberListener( pageNumberProperty.value );
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

      // There are 2 problems to be aware of for the alignBox disposal.
      // 1. Each alignBox has a visibleProperty of the wrapped item Node, so that must be disconnected
      // 2. We link to the updatePageCount method above, so we must unlink here anyways
      alignBoxes.forEach( alignBox => {
        alignBox.visibleProperty.unlink( updatePageCount );
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
   * Given an item, scrolls the carousel to the page that contains that item.
   */
  public scrollToItem( item: Node ): void {

    // If the layout is dynamic, then only account for the visible items
    const itemsInLayout = this.items.filter( item => item.visible );

    this.scrollToItemIndex( itemsInLayout.indexOf( item ) );
  }

  /**
   * Is the specified item currently visible in the carousel?
   */
  public isItemVisible( item: Node ): boolean {
    const itemIndex = this.items.filter( item => item.visible ).indexOf( item );
    assert && assert( itemIndex !== -1, 'item not found' );
    return ( this.pageNumberProperty.get() === this.itemIndexToPageNumber( itemIndex ) );
  }

  /**
   * Converts an item index to a page number.
   */
  public itemIndexToPageNumber( itemIndex: number ): number {
    assert && assert( itemIndex >= 0 && itemIndex < this.items.length, `itemIndex out of range: ${itemIndex}` );
    return Math.floor( itemIndex / this.itemsPerPage );
  }
}

sun.register( 'Carousel', Carousel );