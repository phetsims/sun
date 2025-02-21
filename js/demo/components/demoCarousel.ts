// Copyright 2022-2025, University of Colorado Boulder

/**
 * Demo for Carousel
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import type Bounds2 from '../../../../dot/js/Bounds2.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Font from '../../../../scenery/js/util/Font.js';
import RectangularPushButton from '../../buttons/RectangularPushButton.js';
import Carousel, { type CarouselItem } from '../../Carousel.js';

const FONT = new Font( { size: 20 } );

export default function demoCarousel( layoutBounds: Bounds2 ): Node {

  // create items
  const colors = [ 'red', 'blue', 'green', 'yellow', 'pink', 'white', 'orange', 'magenta', 'purple', 'pink' ];
  const vItems: CarouselItem[] = [];
  const hItems: CarouselItem[] = [];
  colors.forEach( color => {
    vItems.push( { createNode: () => new Rectangle( 0, 0, 60, 60, { fill: color, stroke: 'black' } ) } );
    hItems.push( { createNode: () => new Circle( 30, { fill: color, stroke: 'black' } ) } );
  } );

  // vertical carousel
  const vCarousel = new Carousel( vItems, {
    orientation: 'vertical',
    separatorsVisible: true,
    buttonOptions: {
      touchAreaXDilation: 5,
      touchAreaYDilation: 15,
      mouseAreaXDilation: 2,
      mouseAreaYDilation: 7
    }
  } );

  // horizontal carousel
  const hCarousel = new Carousel( hItems, {
    orientation: 'horizontal',
    separatorsVisible: true,
    buttonOptions: {
      touchAreaXDilation: 15,
      touchAreaYDilation: 5,
      mouseAreaXDilation: 7,
      mouseAreaYDilation: 2
    },
    centerX: vCarousel.centerX,
    top: vCarousel.bottom + 50
  } );

  // button that scrolls the horizontal carousel to a specific item
  const itemIndex = 4;
  const hScrollToItemButton = new RectangularPushButton( {
    content: new Text( `scroll to item ${itemIndex}`, { font: FONT } ),
    listener: () => hCarousel.scrollToItem( hItems[ itemIndex ] )
  } );

  // button that sets the horizontal carousel to a specific page number
  const pageNumber = 0;
  const hScrollToPageButton = new RectangularPushButton( {
    content: new Text( `scroll to page ${pageNumber}`, { font: FONT } ),
    listener: () => hCarousel.pageNumberProperty.set( pageNumber )
  } );

  // group the buttons
  const buttonGroup = new VBox( {
    children: [ hScrollToItemButton, hScrollToPageButton ],
    align: 'left',
    spacing: 7,
    left: hCarousel.right + 30,
    centerY: hCarousel.centerY
  } );

  return new Node( {
    children: [ vCarousel, hCarousel, buttonGroup ],
    center: layoutBounds.center
  } );
}