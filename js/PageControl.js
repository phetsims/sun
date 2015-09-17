// Copyright 2002-2015, University of Colorado Boulder

/**
 * An iOS-style page control. See the 'Navigation' section of the iOS Human Interface Guidelines.
 * A page control indicates the number of pages and which one is currently visible.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var Circle = require( 'SCENERY/nodes/Circle' );
  var DownUpListener = require( 'SCENERY/input/DownUpListener' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );

  /**
   * @param {number} numberOfPages - number of pages
   * @param {Property<number>} pageNumberProperty - which page is currently visible
   * @param {Object} [options]
   * @constructor
   */
  function PageControl( numberOfPages, pageNumberProperty, options ) {

    options = _.extend( {
      orientation: 'horizontal',
      dotRadius: 3, // {number} radius of the dots
      pageVisibleColor: 'black', // {Color|string} dot color for the page that is visible
      pageNotVisibleColor: 'rgb( 200, 200, 200 )', // {Color|string} dot color for pages that are not visible
      dotSpacing: 10, // {number} spacing between dots
      interactive: false // {boolean} whether the control is interactive
    }, options );

    // validate options
    assert && assert( _.contains( [ 'horizontal', 'vertical' ], options.orientation ), 'invalid orientation=' + options.orientation );

    // To improve readability
    var isHorizontal = ( options.orientation === 'horizontal' );

    var dotsParent = new Node();

    var dotListener = new DownUpListener( {
      down: function( event ) {
        pageNumberProperty.set( dotsParent.indexOfChild( event.currentTarget ) );
      }
    } );

    // Create a dot for each page.
    // Add them to an intermediate parent node, so that additional children can't be inadvertently added.
    // For horizontal orientation, pages are ordered left-to-right.
    // For vertical orientation, pages are ordered top-to-bottom.

    for ( var i = 0; i < numberOfPages; i++ ) {

      // dot
      var dotCenter = ( i * ( 2 * options.dotRadius + options.dotSpacing ) );
      var dotNode = new Circle( options.dotRadius, {
        fill: options.pageNotVisibleColor,
        x: isHorizontal ? dotCenter : 0,
        y: isHorizontal ? 0 : dotCenter
      } );
      dotsParent.addChild( dotNode );

      // optional interactivity
      if ( options.interactive ) {
        dotNode.cursor = 'pointer';
        dotNode.addInputListener( dotListener );
      }
    }

    // Indicate which page is selected
    var pageNumberObserver = function( pageNumber, oldPageNumber ) {
      if ( oldPageNumber || oldPageNumber === 0 ) {
        dotsParent.getChildAt( oldPageNumber ).fill = options.pageNotVisibleColor;
      }
      dotsParent.getChildAt( pageNumber ).fill = options.pageVisibleColor;
    };
    pageNumberProperty.link( pageNumberObserver );

    // @private
    this.disposePageControl = function() {
      pageNumberProperty.unlink( pageNumberObserver );
    };

    options.children = [ dotsParent ];
    Node.call( this, options );
  }

  return inherit( Node, PageControl, {

    // @public
    dispose: function() { this.disposePageControl(); }
  } );
} );
