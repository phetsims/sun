// Copyright 2015-2020, University of Colorado Boulder

/**
 * An iOS-style page control. See the 'Navigation' section of the iOS Human Interface Guidelines.
 * A page control indicates the number of pages and which one is currently visible.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Shape from '../../kite/js/Shape.js';
import inherit from '../../phet-core/js/inherit.js';
import merge from '../../phet-core/js/merge.js';
import DownUpListener from '../../scenery/js/input/DownUpListener.js';
import Circle from '../../scenery/js/nodes/Circle.js';
import Node from '../../scenery/js/nodes/Node.js';
import sun from './sun.js';

/**
 * @param {number} numberOfPages - number of pages
 * @param {Property<number>} pageNumberProperty - which page is currently visible
 * @param {Object} [options]
 * @constructor
 */
function PageControl( numberOfPages, pageNumberProperty, options ) {

  options = merge( {

    //TODO support multiple types of interactivity? see https://github.com/phetsims/sun/issues/199
    interactive: false, // {boolean} whether the control is interactive

    // all dots
    orientation: 'horizontal',
    dotRadius: 3, // {number} radius of the dots
    lineWidth: 1,
    dotSpacing: 10, // {number} spacing between dots
    dotTouchAreaDilation: 0, // {number} how much to dilate the touchArea beyond the radius of a dot
    dotMouseAreaDilation: 0, // {number} how much to dilate the mouseArea beyond the radius of a dot

    // dots representing the current page
    currentPageFill: 'black', // {Color|string} dot color for the page that is visible
    currentPageStroke: null,

    // dots representing all pages except the current page
    pageFill: 'rgb( 200, 200, 200 )', // {Color|string} dot color for pages that are not visible
    pageStroke: null

  }, options );

  // validate options
  assert && assert( _.includes( [ 'horizontal', 'vertical' ], options.orientation ), 'invalid orientation=' + options.orientation );

  // To improve readability
  const isHorizontal = ( options.orientation === 'horizontal' );

  // Clicking on a dot goes to that page
  const dotListener = new DownUpListener( {
    down: function( event ) {
      assert && assert( event.currentTarget.hasOwnProperty( 'pageNumber' ) );
      pageNumberProperty.set( event.currentTarget.pageNumber );
    }
  } );

  // Create a dot for each page.
  // Add them to an intermediate parent node, so that additional children can't be inadvertently added.
  // For horizontal orientation, pages are ordered left-to-right.
  // For vertical orientation, pages are ordered top-to-bottom.
  const dotsParent = new Node();
  for ( let pageNumber = 0; pageNumber < numberOfPages; pageNumber++ ) {

    // dot
    const dotCenter = ( pageNumber * ( 2 * options.dotRadius + options.dotSpacing ) );
    const dotNode = new DotNode( pageNumber, options.dotRadius, {
      fill: options.pageFill,
      stroke: options.pageStroke,
      lineWidth: options.lineWidth,
      x: isHorizontal ? dotCenter : 0,
      y: isHorizontal ? 0 : dotCenter
    } );
    dotsParent.addChild( dotNode );

    // pointer areas
    dotNode.touchArea = ( options.dotTouchAreaDilation === 0 ) ? null : Shape.circle( 0, 0, options.dotRadius + options.dotTouchAreaDilation );
    dotNode.mouseArea = ( options.dotMouseAreaDilation === 0 ) ? null : Shape.circle( 0, 0, options.dotRadius + options.dotMouseAreaDilation );

    // optional interactivity
    if ( options.interactive ) {
      dotNode.cursor = 'pointer';
      dotNode.addInputListener( dotListener );
    }
  }

  // Indicate which page is selected
  const pageNumberObserver = function( pageNumber, oldPageNumber ) {

    // previous dot
    if ( oldPageNumber || oldPageNumber === 0 ) {
      dotsParent.getChildAt( oldPageNumber ).fill = options.pageFill;
      dotsParent.getChildAt( oldPageNumber ).stroke = options.pageStroke;
    }

    // current dot
    dotsParent.getChildAt( pageNumber ).fill = options.currentPageFill;
    dotsParent.getChildAt( pageNumber ).stroke = options.currentPageStroke;
  };
  pageNumberProperty.link( pageNumberObserver );

  // @private
  this.disposePageControl = function() {
    pageNumberProperty.unlink( pageNumberObserver );
  };

  options.children = [ dotsParent ];
  Node.call( this, options );
}

sun.register( 'PageControl', PageControl );

/**
 * @param {number} pageNumber - page number that the dot is associated with
 * @param {number} radius
 * @param {Object} [options]
 * @constructor
 */
function DotNode( pageNumber, radius, options ) {
  this.pageNumber = pageNumber; // @public (read-only)
  Circle.call( this, radius, options );
}

inherit( Circle, DotNode );

export default inherit( Node, PageControl, {

  // @public
  dispose: function() {
    this.disposePageControl();
    Node.prototype.dispose.call( this );
  }
} );