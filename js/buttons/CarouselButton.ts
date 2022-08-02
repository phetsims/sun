// Copyright 2015-2022, University of Colorado Boulder

//TODO sun#197 ideally, only 2 corners of the button should be rounded (the corners in the direction of the arrow)
/**
 * Next/previous button in a Carousel.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import { Shape } from '../../../kite/js/imports.js';
import optionize from '../../../phet-core/js/optionize.js';
import { TColor, Path } from '../../../scenery/js/imports.js';
import sun from '../sun.js';
import ButtonNode from './ButtonNode.js';
import RectangularPushButton, { RectangularPushButtonOptions } from './RectangularPushButton.js';

// maps options.arrowDirection to rotation angles, in radians
const ANGLES = {
  up: 0, // arrow shape is created in 'up' direction
  down: Math.PI,
  left: -Math.PI / 2,
  right: Math.PI / 2
};

type ArrowDirection = 'up' | 'down' | 'left' | 'right';
type LineCap = 'round' | 'square' | 'butt';

type SelfOptions = {

  // arrow
  arrowDirection?: ArrowDirection; // direction that the arrow points
  arrowSize?: Dimension2; // size of the arrow, in 'up' directions
  arrowStroke?: TColor; // {color used for the arrow icons
  arrowLineWidth?: number; // line width used to stroke the arrow icons
  arrowLineCap?: LineCap;

  // Convenience options for dilating pointer areas such that they do not overlap with Carousel content.
  // See computePointerArea.
  touchAreaXDilation?: number;
  touchAreaYDilation?: number;
  mouseAreaXDilation?: number;
  mouseAreaYDilation?: number;
};

export type CarouselButtonOptions = SelfOptions & RectangularPushButtonOptions;

export default class CarouselButton extends RectangularPushButton {

  public constructor( providedOptions?: RectangularPushButtonOptions ) {

    // see supertype for additional options
    const options = optionize<CarouselButtonOptions, SelfOptions, RectangularPushButtonOptions>()( {

      // CarouselButtonOptions
      arrowDirection: 'up',
      arrowSize: new Dimension2( 20, 7 ),
      arrowStroke: 'black',
      arrowLineWidth: 3,
      arrowLineCap: 'round',
      touchAreaXDilation: 0,
      touchAreaYDilation: 0,
      mouseAreaXDilation: 0,
      mouseAreaYDilation: 0,

      // RectangularPushButtonOptions
      baseColor: 'rgba( 200, 200, 200, 0.5 )',
      stroke: 'black',
      buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy,
      cornerRadius: 4

    }, providedOptions );

    // validate options
    assert && assert( ANGLES.hasOwnProperty( options.arrowDirection ), `invalid direction: ${options.arrowDirection}` );

    // Generic arrow shape, points 'up'
    let arrowShape = new Shape()
      .moveTo( 0, 0 )
      .lineTo( options.arrowSize.width / 2, -options.arrowSize.height )
      .lineTo( options.arrowSize.width, 0 );

    // Transform arrow shape to match direction
    arrowShape = arrowShape.transformed( Matrix3.rotation2( ANGLES[ options.arrowDirection ] ) );

    // Arrow node
    options.content = new Path( arrowShape, {
      stroke: options.arrowStroke,
      lineWidth: options.arrowLineWidth,
      lineCap: options.arrowLineCap
    } );

    // set up the options such that the inner corners are square and outer ones are rounded
    const arrowDirection = options.arrowDirection; // convenience var
    const cornerRadius = options.cornerRadius; // convenience var
    options.leftTopCornerRadius = arrowDirection === 'up' || arrowDirection === 'left' ? cornerRadius : 0;
    options.rightTopCornerRadius = arrowDirection === 'up' || arrowDirection === 'right' ? cornerRadius : 0;
    options.leftBottomCornerRadius = arrowDirection === 'down' || arrowDirection === 'left' ? cornerRadius : 0;
    options.rightBottomCornerRadius = arrowDirection === 'down' || arrowDirection === 'right' ? cornerRadius : 0;

    super( options );

    // pointer areas
    this.touchArea = computePointerArea( this, arrowDirection, options.touchAreaXDilation, options.touchAreaYDilation );
    this.mouseArea = computePointerArea( this, arrowDirection, options.mouseAreaXDilation, options.mouseAreaYDilation );
  }
}

/**
 * Computes a pointer area based on dilation of a CarouselButton's local bounds.
 * The button is not dilated in the direction that is opposite to the arrow's direction.
 * This ensures that the pointer area will not overlap with the contents of a Carousel.
 *
 * @param button
 * @param arrowDirection - direction that the arrow points
 * @param x - horizontal dilation
 * @param y - vertical dilation
 * @returns the pointer area, null if no dilation is necessary, i.e. x === 0 && y === 0
 */
function computePointerArea( button: CarouselButton, arrowDirection: ArrowDirection, x: number, y: number ): Bounds2 | null {
  let pointerArea = null;
  if ( x || y ) {
    switch( arrowDirection ) {
      case 'up':
        pointerArea = button.localBounds.dilatedXY( x, y / 2 ).shiftedY( -y / 2 );
        break;
      case 'down':
        pointerArea = button.localBounds.dilatedXY( x, y / 2 ).shiftedY( y / 2 );
        break;
      case 'left':
        pointerArea = button.localBounds.dilatedXY( x / 2, y ).shiftedX( -x / 2 );
        break;
      case 'right':
        pointerArea = button.localBounds.dilatedXY( x / 2, y ).shiftedX( x / 2 );
        break;
      default:
        throw new Error( `unsupported arrowDirection: ${arrowDirection}` );
    }
  }
  return pointerArea;
}

sun.register( 'CarouselButton', CarouselButton );