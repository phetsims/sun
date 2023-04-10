// Copyright 2022-2023, University of Colorado Boulder

/**
 * Demo for PageControl
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import { Node, Rectangle } from '../../../../scenery/js/imports.js';
import Carousel, { CarouselItem } from '../../Carousel.js';
import PageControl from '../../PageControl.js';

export default function demoPageControl( layoutBounds: Bounds2 ): Node {

  // create items
  const colors = [ 'red', 'blue', 'green', 'yellow', 'pink', 'white', 'orange', 'magenta', 'purple', 'pink' ];
  const items: CarouselItem[] = [];
  colors.forEach( color => {
    items.push( {
      createNode: () => new Rectangle( 0, 0, 100, 100, { fill: color, stroke: 'black' } )
    } );
  } );

  // carousel
  const carousel = new Carousel( items, {
    orientation: 'horizontal',
    itemsPerPage: 3
  } );

  // page control
  const pageControl = new PageControl( carousel.pageNumberProperty, carousel.numberOfPagesProperty, {
    orientation: 'horizontal',
    interactive: true,
    dotRadius: 10,
    dotSpacing: 18,
    dotTouchAreaDilation: 8,
    dotMouseAreaDilation: 4,
    currentPageFill: 'white',
    currentPageStroke: 'black',
    centerX: carousel.centerX,
    top: carousel.bottom + 10
  } );

  return new Node( {
    children: [ carousel, pageControl ],
    center: layoutBounds.center
  } );
}