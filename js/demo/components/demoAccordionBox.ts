// Copyright 2022, University of Colorado Boulder

/**
 * Demo for AccordionBox
 */

import RectangularPushButton from '../../buttons/RectangularPushButton.js';
import AccordionBox from '../../AccordionBox.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import { Font, Node, Rectangle, Text, VBox } from '../../../../scenery/js/imports.js';
import dotRandom from '../../../../dot/js/dotRandom.js';

export default function demoAccordionBox( layoutBounds: Bounds2 ): Node {
  const randomRect = new Rectangle( 0, 0, 100, 50, { fill: 'red' } );

  const resizeButton = new RectangularPushButton( {
    content: new Text( 'Resize', { font: new Font( { size: 20 } ) } ),
    listener: () => {
      randomRect.rectWidth = 50 + dotRandom.nextDouble() * 150;
      randomRect.rectHeight = 50 + dotRandom.nextDouble() * 150;
      box.center = layoutBounds.center;
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

  return box;
}