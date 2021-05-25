// Copyright 2015-2021, University of Colorado Boulder

//TODO sun#197 ideally, only 2 corners of the button should be rounded (the corners in the direction of the arrow)
/**
 * Next/previous button in a Carousel.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Dimension2 from '../../../dot/js/Dimension2.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Shape from '../../../kite/js/Shape.js';
import merge from '../../../phet-core/js/merge.js';
import Path from '../../../scenery/js/nodes/Path.js';
import sun from '../sun.js';
import ButtonNode from './ButtonNode.js';
import RectangularPushButton from './RectangularPushButton.js';

// maps options.arrowDirection to rotation angles, in radians
const ANGLES = {
  up: 0, // arrow shape is created in 'up' direction
  down: Math.PI,
  left: -Math.PI / 2,
  right: Math.PI / 2
};

class CarouselButton extends RectangularPushButton {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    // see supertype for additional options
    options = merge( {

      // button
      baseColor: 'rgba( 200, 200, 200, 0.5 )', // {Color|string} button fill color
      stroke: 'black', // {Color|string|null} button stroke
      buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy,
      cornerRadius: 4, // {number} radius for the two potentially rounded corners

      // arrow
      arrowDirection: 'up', // {string} direction that the arrow points, 'up'|'down'|'left'|'right'
      arrowSize: new Dimension2( 20, 7 ), // {Dimension2} size of the arrow, in 'up' directions
      arrowStroke: 'black', // {Color|string} color used for the arrow icons
      arrowLineWidth: 3, // {number} line width used to stroke the arrow icons
      arrowLineCap: 'round', // {string} 'butt'|'round'|'square'

      // Convenience options for dilating pointer areas such that they do not overlap with Carousel content.
      // See computePointerArea.
      touchAreaXDilation: 0,
      touchAreaYDilation: 0,
      mouseAreaXDilation: 0,
      mouseAreaYDilation: 0

    }, options );

    // validate options
    assert && assert( ANGLES.hasOwnProperty( options.arrowDirection ), `invalid direction: ${options.direction}` );

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
 * @param {CarouselButton} button
 * @param {string} arrowDirection - direction that the arrow points, 'up'|'down'|'left'|'right'
 * @param {number} x - horizontal dilation
 * @param {number} y - vertical dilation
 * @returns {Bounds2} - null if no dilation is necessary, i.e. x === 0 && y === 0
 */
function computePointerArea( button, arrowDirection, x, y ) {
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
export default CarouselButton;