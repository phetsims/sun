// Copyright 2015-2020, University of Colorado Boulder

/**
 * A carousel UI component.
 * A set of N items is divided into M 'pages', based on how many items are visible in the carousel.
 * Pressing the next and previous buttons moves through the pages.
 * Movement through the pages is animated, so that items appear to scroll by.
 *
 * Note that Carousel performs layout directly on the items (Nodes) that it is provided.
 * If those Nodes appear in multiple places in the scenegraph, then it's the client's
 * responsibility to provide the Carousel with wrapped Nodes.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../axon/js/Property.js';
import timer from '../../axon/js/timer.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import Utils from '../../dot/js/Utils.js';
import Shape from '../../kite/js/Shape.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import inherit from '../../phet-core/js/inherit.js';
import merge from '../../phet-core/js/merge.js';
import Node from '../../scenery/js/nodes/Node.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import Tandem from '../../tandem/js/Tandem.js';
import Animation from '../../twixt/js/Animation.js';
import Easing from '../../twixt/js/Easing.js';
import CarouselButton from './buttons/CarouselButton.js';
import HSeparator from './HSeparator.js';
import sun from './sun.js';
import VSeparator from './VSeparator.js';

// constants
const DEFAULT_OPTIONS = {

  // container
  orientation: 'horizontal', // {string} 'horizontal'|'vertical'
  fill: 'white', // {Color|string} background color of the carousel
  stroke: 'black', // {Color|string|null} color used to stroke the border of the carousel
  lineWidth: 1, // {number} width of the border around the carousel
  cornerRadius: 4, // {number} radius applied to the carousel and next/previous buttons
  defaultPageNumber: 0, // {number} page that is initially visible

  // items
  itemsPerPage: 4, // {number} number of items per page, or how many items are visible at a time in the carousel
  spacing: 10, // {number} spacing between items, between items and optional separators, and between items and buttons
  margin: 10, // {number} margin between items and the edges of the carousel

  // next/previous buttons
  buttonColor: 'rgba( 200, 200, 200, 0.5 )', // {Color|string} base color for the buttons
  buttonStroke: undefined, // {Color|string|null|undefined} stroke around the buttons (null is no stroke, undefined derives color from buttonColor)
  buttonLineWidth: 1, // {number} lineWidth of borders on buttons
  arrowSize: new Dimension2( 20, 7 ), // {Dimension2} size of the arrow, in 'up' directions
  arrowStroke: 'black', // {Color|string} color used for the arrow icons
  arrowLineWidth: 3, // {number} line width used to stroke the arrow icons
  hideDisabledButtons: false, // {boolean} whether to hide buttons when they are disabled
  buttonSoundPlayer: null,

  // for dilating pointer areas of next/previous buttons such that they do not overlap with Carousel content
  buttonTouchAreaXDilation: 0, // {number} horizontal touchArea dilation
  buttonTouchAreaYDilation: 0, // {number} vertical touchArea dilation
  buttonMouseAreaXDilation: 0, // {number} horizontal mouseArea dilation
  buttonMouseAreaYDilation: 0, // {number} vertical mouseArea dilation

  // item separators
  separatorsVisible: false, // {boolean} whether to put separators between items
  separatorColor: 'rgb( 180, 180, 180 )', // {Color|string} color for separators
  separatorLineWidth: 0.5, // {number} lineWidth for separators

  // animation, scrolling between pages
  animationEnabled: true, // {boolean} is animation enabled when scrolling between pages?,
  animationDuration: 0.4, // {number} seconds
  stepEmitter: timer, // {string} see Animation options.stepEmitter

  // phet-io
  tandem: Tandem.OPTIONAL
};
assert && Object.freeze( DEFAULT_OPTIONS );

/**
 * @param {Node[]} items - items in the carousel
 * @param {Object} [options]
 * @constructor
 */
function Carousel( items, options ) {

  const self = this;

  // Override defaults with specified options
  options = merge( {}, DEFAULT_OPTIONS, options );

  // Validate options
  assert && assert( _.includes( [ 'horizontal', 'vertical' ], options.orientation ), 'invalid orientation=' + options.orientation );

  // To improve readability
  const isHorizontal = ( options.orientation === 'horizontal' );

  // Dimensions of largest item
  const maxItemWidth = _.maxBy( items, function( item ) { return item.width; } ).width;
  const maxItemHeight = _.maxBy( items, function( item ) { return item.height; } ).height;

  // This quantity is used make some other computations independent of orientation.
  const maxItemLength = isHorizontal ? maxItemWidth : maxItemHeight;

  // Options common to both buttons
  const buttonOptions = {
    xMargin: 5,
    yMargin: 5,
    cornerRadius: options.cornerRadius,
    baseColor: options.buttonColor,
    disabledBaseColor: options.fill, // same as carousel background
    stroke: options.buttonStroke,
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
    soundPlayer: options.buttonSoundPlayer
  };

  // Next/previous buttons
  const nextButton = new CarouselButton( merge( {
    arrowDirection: isHorizontal ? 'right' : 'down',
    tandem: options.tandem.createTandem( 'nextButton' )
  }, buttonOptions ) );
  const previousButton = new CarouselButton( merge( {
    arrowDirection: isHorizontal ? 'left' : 'up',
    tandem: options.tandem.createTandem( 'previousButton' )
  }, buttonOptions ) );

  // Computations related to layout of items
  const numberOfSeparators = ( options.separatorsVisible ) ? ( items.length - 1 ) : 0;
  const scrollingLength = ( items.length * ( maxItemLength + options.spacing ) + ( numberOfSeparators * options.spacing ) + options.spacing );
  const scrollingWidth = isHorizontal ? scrollingLength : ( maxItemWidth + 2 * options.margin );
  const scrollingHeight = isHorizontal ? ( maxItemHeight + 2 * options.margin ) : scrollingLength;
  let itemCenter = options.spacing + ( maxItemLength / 2 );

  // Options common to all separators
  const separatorOptions = {
    stroke: options.separatorColor,
    lineWidth: options.separatorLineWidth
  };

  // @private enables animation when scrolling between pages
  this._animationEnabled = options.animationEnabled;

  // All items, arranged in the proper orientation, with margins and spacing.
  // Horizontal carousel arrange items left-to-right, vertical is top-to-bottom.
  // Translation of this node will be animated to give the effect of scrolling through the items.
  const scrollingNode = new Rectangle( 0, 0, scrollingWidth, scrollingHeight );
  items.forEach( function( item ) {

    // add the item
    if ( isHorizontal ) {
      item.centerX = itemCenter;
      item.centerY = options.margin + ( maxItemHeight / 2 );
    }
    else {
      item.centerX = options.margin + ( maxItemWidth / 2 );
      item.centerY = itemCenter;
    }
    scrollingNode.addChild( item );

    // center for the next item
    itemCenter += ( options.spacing + maxItemLength );

    // add optional separator
    if ( options.separatorsVisible ) {
      let separator;
      if ( isHorizontal ) {

        // vertical separator, to the left of the item
        separator = new VSeparator( scrollingHeight, merge( {
          centerX: item.centerX + ( maxItemLength / 2 ) + options.spacing,
          centerY: item.centerY
        }, separatorOptions ) );
        scrollingNode.addChild( separator );

        // center for the next item
        itemCenter = separator.centerX + options.spacing + ( maxItemLength / 2 );
      }
      else {

        // horizontal separator, below the item
        separator = new HSeparator( scrollingWidth, merge( {
          centerX: item.centerX,
          centerY: item.centerY + ( maxItemLength / 2 ) + options.spacing
        }, separatorOptions ) );
        scrollingNode.addChild( separator );

        // center for the next item
        itemCenter = separator.centerY + options.spacing + ( maxItemLength / 2 );
      }
    }
  } );

  // How much to translate scrollingNode each time a next/previous button is pressed
  let scrollingDelta = options.itemsPerPage * ( maxItemLength + options.spacing );
  if ( options.separatorsVisible ) {
    scrollingDelta += ( options.itemsPerPage * options.spacing );
  }

  // Clipping window, to show one page at a time.
  // Clips at the midpoint of spacing between items so that you don't see any stray bits of the items that shouldn't be visible.
  let windowLength = ( scrollingDelta + options.spacing );
  if ( options.separatorsVisible ) {
    windowLength -= options.spacing;
  }
  const windowWidth = isHorizontal ? windowLength : scrollingNode.width;
  const windowHeight = isHorizontal ? scrollingNode.height : windowLength;
  const clipArea = isHorizontal ?
                   Shape.rectangle( options.spacing / 2, 0, windowWidth - options.spacing, windowHeight ) :
                   Shape.rectangle( 0, options.spacing / 2, windowWidth, windowHeight - options.spacing );
  const windowNode = new Node( {
    children: [ scrollingNode ],
    clipArea: clipArea
  } );

  // Background - displays the carousel's fill color
  const backgroundWidth = isHorizontal ? ( windowWidth + nextButton.width + previousButton.width ) : windowWidth;
  const backgroundHeight = isHorizontal ? windowHeight : ( windowHeight + nextButton.height + previousButton.height );
  const backgroundNode = new Rectangle( 0, 0, backgroundWidth, backgroundHeight, options.cornerRadius, options.cornerRadius, {
    fill: options.fill
  } );

  // Foreground - displays the carousel's outline, created as a separate node so that it can be placed on top of everything, for a clean look.
  const foregroundNode = new Rectangle( 0, 0, backgroundWidth, backgroundHeight, options.cornerRadius, options.cornerRadius, {
    stroke: options.stroke
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

  // Number of pages
  let numberOfPages = items.length / options.itemsPerPage;
  if ( !Utils.isInteger( numberOfPages ) ) {
    numberOfPages = Math.floor( numberOfPages + 1 );
  }

  // Number of the page that is visible in the carousel.
  assert && assert( options.defaultPageNumber >= 0 && options.defaultPageNumber <= numberOfPages - 1,
    'defaultPageNumber is out of range: ' + options.defaultPageNumber );
  const pageNumberProperty = new Property( options.defaultPageNumber );

  // Change pages
  let scrollAnimation = null;

  function pageNumberListener( pageNumber ) {

    assert && assert( pageNumber >= 0 && pageNumber <= numberOfPages - 1, 'pageNumber out of range: ' + pageNumber );

    // button state
    nextButton.enabled = pageNumber < ( numberOfPages - 1 );
    previousButton.enabled = pageNumber > 0;
    if ( options.hideDisabledButtons ) {
      nextButton.visible = nextButton.enabled;
      previousButton.visible = previousButton.enabled;
    }

    // stop any animation that's in progress
    scrollAnimation && scrollAnimation.stop();

    if ( self._animationEnabled ) {

      // options that are independent of orientation
      let animationOptions = {
        duration: options.animationDuration,
        stepEmitter: options.stepEmitter,
        easing: Easing.CUBIC_IN_OUT
      };

      // options that are specific to orientation
      if ( isHorizontal ) {
        animationOptions = merge( {
          getValue: function() { return scrollingNode.left; },
          setValue: function( value ) { scrollingNode.left = value; },
          to: -pageNumber * scrollingDelta
        }, animationOptions );
      }
      else {
        animationOptions = merge( {
          getValue: function() { return scrollingNode.top; },
          setValue: function( value ) { scrollingNode.top = value; },
          to: -pageNumber * scrollingDelta
        }, animationOptions );
      }

      // create and start the scroll animation
      scrollAnimation = new Animation( animationOptions );
      scrollAnimation.start();
    }
    else {

      // animation disabled, move immediate to new page
      if ( isHorizontal ) {
        scrollingNode.left = -pageNumber * scrollingDelta;
      }
      else {
        scrollingNode.top = -pageNumber * scrollingDelta;
      }
    }
  }

  pageNumberProperty.link( pageNumberListener );

  // Buttons modify the page number
  nextButton.addListener( function() {
    pageNumberProperty.set( pageNumberProperty.get() + 1 );
  } );
  previousButton.addListener( function() {
    pageNumberProperty.set( pageNumberProperty.get() - 1 );
  } );

  // fields
  this.items = items; // @private
  this.itemsPerPage = options.itemsPerPage; // @private
  this.numberOfPages = numberOfPages; // @public (read-only) {number} number of pages in the carousel
  this.pageNumberProperty = pageNumberProperty; // @public {Property<number>} page number that is currently visible

  options.children = [ backgroundNode, windowNode, nextButton, previousButton, foregroundNode ];

  this.disposeCarousel = function() {
    pageNumberProperty.unlink( pageNumberListener );
  };

  Node.call( this, options );

  // support for binder documentation, stripped out in builds and only runs when ?binder is specified
  assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'Carousel', this );
}

sun.register( 'Carousel', Carousel );

export default inherit( Node, Carousel, {

  dispose: function() {
    this.disposeCarousel();
    Node.prototype.dispose.call( this );
  },

  /**
   * Resets the carousel to its initial state.
   *
   * @param {Object} [options]
   * @public
   */
  reset: function( options ) {

    options = merge( {
      animationEnabled: this.animationEnabled // {boolean} whether to enable animation during reset
    }, options );

    const saveAnimationEnabled = this.animationEnabled;
    this.animationEnabled = options.animationEnabled;
    this.pageNumberProperty.reset();
    this.animationEnabled = saveAnimationEnabled;
  },

  /**
   * Determines whether animation is enabled for scrolling between pages.
   * @param {boolean} animationEnabled
   * @public
   */
  setAnimationEnabled: function( animationEnabled ) {
    this._animationEnabled = animationEnabled;
  },
  set animationEnabled( value ) { this.setAnimationEnabled( value ); },

  /**
   * Is animation enabled for scrolling between pages?
   * @returns {boolean}
   * @public
   */
  getAnimationEnabled: function() {
    return this._animationEnabled;
  },
  get animationEnabled() { return this.getAnimationEnabled(); },

  /**
   * Given an item's index, scroll the carousel to the page that contains that item.
   * @param {number} itemIndex
   * @public
   */
  scrollToItemIndex: function( itemIndex ) {
    this.pageNumberProperty.set( this.itemIndexToPageNumber( itemIndex ) );
  },

  /**
   * Given an item, scroll the carousel to the page that contains that item.
   * @param {Node} item
   * @public
   */
  scrollToItem: function( item ) {
    this.scrollToItemIndex( this.items.indexOf( item ) );
  },

  /**
   * Is the specified item currently visible in the carousel?
   * @param {Node} item
   * @returns {boolean}
   * @public
   */
  isItemVisible: function( item ) {
    const itemIndex = this.items.indexOf( item );
    assert && assert( itemIndex !== -1, 'item not found' );
    return ( this.pageNumberProperty.get() === this.itemIndexToPageNumber( itemIndex ) );
  },

  /**
   * Converts an item index to a page number.
   * @param {number} itemIndex
   * @returns {number}
   * @public
   */
  itemIndexToPageNumber: function( itemIndex ) {
    assert && assert( itemIndex >= 0 && itemIndex < this.items.length, 'itemIndex out of range: ' + itemIndex );
    return Math.floor( itemIndex / this.itemsPerPage );
  }
}, {

  // @static @public (read-only)
  DEFAULT_OPTIONS: DEFAULT_OPTIONS
} );