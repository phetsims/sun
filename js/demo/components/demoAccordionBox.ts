// Copyright 2022-2025, University of Colorado Boulder

/**
 * Demo for AccordionBox
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import type Bounds2 from '../../../../dot/js/Bounds2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Font from '../../../../scenery/js/util/Font.js';
import AccordionBox from '../../AccordionBox.js';
import RectangularPushButton from '../../buttons/RectangularPushButton.js';

export default function demoAccordionBox( layoutBounds: Bounds2 ): Node {
  const randomRect = new Rectangle( 0, 0, 100, 50, { fill: 'red' } );

  const resizeButton = new RectangularPushButton( {
    content: new Text( 'Resize', { font: new Font( { size: 20 } ) } ),
    listener: () => {
      randomRect.rectWidth = 50 + dotRandom.nextDouble() * 150;
      randomRect.rectHeight = 50 + dotRandom.nextDouble() * 150;
      box.center = layoutBounds.center;
      box2.centerTop = box.centerBottom.plusXY( 0, 25 );
    }
  } );

  const box = new AccordionBox( new VBox( {
    spacing: 10,
    children: [
      resizeButton,
      randomRect
    ]
  } ), {
    resize: true,
    center: layoutBounds.center
  } );

  // A demo of an AccordionBox with a title where the box reduces in size when collapsed.
  const box2 = new AccordionBox( new VBox( {
    spacing: 10,
    children: [
      new Rectangle( 0, 0, 500, 50, { fill: 'blue' } )
    ]
  } ), {
    titleNode: new Text( 'Box 2', { font: new Font( { size: 20 } ) } ),
    useContentWidthWhenCollapsed: false,
    centerTop: box.centerBottom.plusXY( 0, 25 )
  } );

  const parent = new Node( {
    children: [ box, box2 ]
  } );

  return parent;
}