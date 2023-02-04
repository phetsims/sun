// Copyright 2015-2023, University of Colorado Boulder

/**
 * Next/previous button in a Carousel.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Dimension2 from '../../../dot/js/Dimension2.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import { Shape } from '../../../kite/js/imports.js';
import optionize from '../../../phet-core/js/optionize.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import { PaintColorProperty, Path, PathOptions } from '../../../scenery/js/imports.js';
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

type SelfOptions = {
  arrowPathOptions?: PathOptions;
  arrowDirection?: ArrowDirection; // direction that the arrow points
  arrowSize?: Dimension2; // size of the arrow (width/height when it is pointing up)
};

export type CarouselButtonOptions = SelfOptions & StrictOmit<RectangularPushButtonOptions, 'content' | 'leftTopCornerRadius' | 'rightTopCornerRadius' | 'leftBottomCornerRadius' | 'rightBottomCornerRadius' | 'touchAreaXShift' | 'touchAreaYShift' | 'mouseAreaXShift' | 'mouseAreaYShift'>;

export default class CarouselButton extends RectangularPushButton {

  private readonly customStrokeProperty: PaintColorProperty | null;

  public constructor( providedOptions?: CarouselButtonOptions ) {

    // see supertype for additional options
    const options = optionize<CarouselButtonOptions, SelfOptions, RectangularPushButtonOptions>()( {

      // CarouselButtonOptions
      arrowDirection: 'up',
      arrowSize: new Dimension2( 20, 7 ),

      arrowPathOptions: {
        stroke: 'black',
        lineWidth: 3,
        lineCap: 'round'
      },

      // RectangularPushButtonOptions
      baseColor: 'rgba( 200, 200, 200, 0.5 )',
      buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy,
      cornerRadius: 4

    }, providedOptions );

    let customStrokeProperty: PaintColorProperty | null = null;

    if ( options.stroke === undefined ) {
      customStrokeProperty = new PaintColorProperty( options.baseColor, {
        luminanceFactor: -0.8
      } );
      options.stroke = customStrokeProperty;
    }

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
    options.content = new Path( arrowShape, options.arrowPathOptions );

    // set up the options such that the inner corners are square and outer ones are rounded
    const arrowDirection = options.arrowDirection;
    const cornerRadius = options.cornerRadius;
    options.leftTopCornerRadius = arrowDirection === 'up' || arrowDirection === 'left' ? cornerRadius : 0;
    options.rightTopCornerRadius = arrowDirection === 'up' || arrowDirection === 'right' ? cornerRadius : 0;
    options.leftBottomCornerRadius = arrowDirection === 'down' || arrowDirection === 'left' ? cornerRadius : 0;
    options.rightBottomCornerRadius = arrowDirection === 'down' || arrowDirection === 'right' ? cornerRadius : 0;

    // Computes touch area dilations/shifts so that the pointer area will not overlap with the contents of a Carousel.
    // We do this here so that it's set up to work with any dynamic layout
    if ( arrowDirection === 'up' || arrowDirection === 'down' ) {
      const mouseAreaYDilation = options.mouseAreaYDilation / 2 || 0;
      const touchAreaYDilation = options.touchAreaYDilation / 2 || 0;

      options.mouseAreaYDilation = mouseAreaYDilation;
      options.touchAreaYDilation = touchAreaYDilation;
      options.mouseAreaYShift = arrowDirection === 'up' ? -mouseAreaYDilation : mouseAreaYDilation;
      options.touchAreaYShift = arrowDirection === 'up' ? -touchAreaYDilation : touchAreaYDilation;
    }
    else {
      const mouseAreaXDilation = options.mouseAreaXDilation / 2 || 0;
      const touchAreaXDilation = options.touchAreaXDilation / 2 || 0;

      options.mouseAreaXDilation = mouseAreaXDilation;
      options.touchAreaXDilation = touchAreaXDilation;
      options.mouseAreaXShift = arrowDirection === 'left' ? -mouseAreaXDilation : mouseAreaXDilation;
      options.touchAreaXShift = arrowDirection === 'left' ? -touchAreaXDilation : touchAreaXDilation;
    }

    super( options );

    this.customStrokeProperty = customStrokeProperty;
  }

  public override dispose(): void {
    this.customStrokeProperty && this.customStrokeProperty.dispose();

    super.dispose();
  }
}

sun.register( 'CarouselButton', CarouselButton );