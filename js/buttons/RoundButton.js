// Copyright 2014-2020, University of Colorado Boulder

/**
 * RoundButton is the base class for round buttons.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Shape from '../../../kite/js/Shape.js';
import merge from '../../../phet-core/js/merge.js';
import Circle from '../../../scenery/js/nodes/Circle.js';
import PaintColorProperty from '../../../scenery/js/util/PaintColorProperty.js';
import RadialGradient from '../../../scenery/js/util/RadialGradient.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import ButtonInteractionState from './ButtonInteractionState.js';
import ButtonNode from './ButtonNode.js';

// constants
const HIGHLIGHT_GRADIENT_LENGTH = 5; // In screen coords, which are roughly pixels.

class RoundButton extends ButtonNode {

  /**
   * @param {ButtonModel} buttonModel
   * @param {Property} interactionStateProperty - a Property that is used to drive the visual appearance of the button
   * @param {Object} [options]
   */
  constructor( buttonModel, interactionStateProperty, options ) {

    options = merge( {

      // {Node|null} what appears on the button (icon, label, etc.)
      content: null,

      radius: ( options && options.content ) ? undefined : 30,
      cursor: 'pointer',
      minXMargin: 5, // Minimum margin in x direction, i.e. on left and right
      minYMargin: 5, // Minimum margin in y direction, i.e. on top and bottom
      fireOnDown: false,

      // pointer area dilation
      touchAreaDilation: 0, // radius dilation for touch area
      mouseAreaDilation: 0, // radius dilation for mouse area

      // pointer area shift
      touchAreaXShift: 0,
      touchAreaYShift: 0,
      mouseAreaXShift: 0,
      mouseAreaYShift: 0,

      stroke: undefined, // undefined by default, which will cause a stroke to be derived from the base color
      lineWidth: 0.5, // Only meaningful if stroke is non-null

      // By default, icons are centered in the button, but icons with odd
      // shapes that are not wrapped in a normalizing parent node may need to
      // specify offsets to line things up properly
      xContentOffset: 0,
      yContentOffset: 0,

      // Class that determines the button's appearance for the values of interactionStateProperty.
      // See RoundButton.ThreeDAppearanceStrategy for an example of the interface required.
      buttonAppearanceStrategy: RoundButton.ThreeDAppearanceStrategy,

      // phet-io
      tandem: Tandem.OPTIONAL, // This duplicates the parent option and works around https://github.com/phetsims/tandem/issues/50
      visiblePropertyOptions: { phetioFeatured: true },

      // pdom
      tagName: 'button'
    }, options );

    const content = options.content; // convenience variable

    // Compute the radius of the button.
    const buttonRadius = options.radius ||
                         Math.max( content.width + options.minXMargin * 2, content.height + options.minYMargin * 2 ) / 2;

    // Create the circular part of the button.
    const buttonBackground = new Circle( buttonRadius, {
      lineWidth: options.lineWidth
    } );

    super( buttonModel, buttonBackground, interactionStateProperty, options );

    // Add the content to the button.
    if ( content ) {
      content.pickable = false; // for performance
      content.center = new Vector2( options.xContentOffset, options.yContentOffset );
      this.addChild( content );
    }

    // Set pointer areas.
    this.touchArea = Shape.circle( options.touchAreaXShift, options.touchAreaYShift,
      buttonRadius + options.touchAreaDilation );
    this.mouseArea = Shape.circle( options.mouseAreaXShift, options.mouseAreaYShift,
      buttonRadius + options.mouseAreaDilation );

    // PDOM - focus highlight is circular for round buttons, with a little bit of padding
    // between button shape and inner edge of highlight
    this.focusHighlight = Shape.circle( 0, 0, buttonRadius + 5 );
  }
}

/**
 * ThreeDAppearanceStrategy is a value for RoundButton options.buttonAppearanceStrategy. It makes a round button
 * look 3D-ish by using gradients that create the appearance of highlighted and shaded edges. The gradients are
 * set up to make the light source appear to be in the upper left.
 */
class ThreeDAppearanceStrategy {

  /**
   * @param {Node} button - the Node for the button's shape, sans content
   * @param {Property.<boolean>} interactionStateProperty
   * @param {Property.<Color>} baseColorProperty
   * @param {Object} [options]
   */
  constructor( button, interactionStateProperty, baseColorProperty, options ) {

    // Dynamic colors
    // TODO https://github.com/phetsims/sun/issues/553 missing "Property" suffix for all PaintColorProperty names
    const baseBrighter8 = new PaintColorProperty( baseColorProperty, { luminanceFactor: 0.8 } );
    const baseBrighter7 = new PaintColorProperty( baseColorProperty, { luminanceFactor: 0.7 } );
    const baseBrighter3 = new PaintColorProperty( baseColorProperty, { luminanceFactor: 0.3 } );
    const baseDarker1 = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.1 } );
    const baseDarker2 = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.2 } );
    const baseDarker4 = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.4 } );
    const baseDarker5 = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.5 } );
    const baseTransparent = new DerivedProperty( [ baseColorProperty ], color => color.withAlpha( 0 ) );

    // Set up variables needed to create the various gradient fills and otherwise modify the appearance
    const buttonRadius = button.width / 2;
    const innerGradientRadius = buttonRadius - HIGHLIGHT_GRADIENT_LENGTH / 2;
    const outerGradientRadius = buttonRadius + HIGHLIGHT_GRADIENT_LENGTH / 2;
    const gradientOffset = HIGHLIGHT_GRADIENT_LENGTH / 2;

    const upFillHighlight = new RadialGradient( gradientOffset, gradientOffset, innerGradientRadius, gradientOffset, gradientOffset, outerGradientRadius )
      .addColorStop( 0, baseColorProperty )
      .addColorStop( 1, baseBrighter7 );

    const upFillShadow = new RadialGradient( -gradientOffset, -gradientOffset, innerGradientRadius, -gradientOffset, -gradientOffset, outerGradientRadius )
      .addColorStop( 0, baseTransparent )
      .addColorStop( 1, baseDarker5 );

    const overFillHighlight = new RadialGradient( gradientOffset, gradientOffset, innerGradientRadius, gradientOffset, gradientOffset, outerGradientRadius )
      .addColorStop( 0, baseBrighter3 )
      .addColorStop( 1, baseBrighter8 );

    const overFillShadow = new RadialGradient( -gradientOffset, -gradientOffset, innerGradientRadius, -gradientOffset, -gradientOffset, outerGradientRadius )
      .addColorStop( 0, baseTransparent )
      .addColorStop( 1, baseDarker5 );

    const pressedFill = new RadialGradient( -gradientOffset, -gradientOffset, 0, 0, 0, outerGradientRadius )
      .addColorStop( 0, baseDarker1 )
      .addColorStop( 0.6, baseDarker2 )
      .addColorStop( 0.8, baseColorProperty )
      .addColorStop( 1, baseBrighter8 );

    // Create and add the overlay that is used to add shading.
    const shadowNode = new Circle( buttonRadius, {
      stroke: ( typeof ( options.stroke ) === 'undefined' ) ? baseDarker4 : options.stroke,
      lineWidth: options.lineWidth,
      pickable: false
    } );
    button.addChild( shadowNode );

    // Cache gradients
    button.cachedPaints = [ upFillHighlight, overFillHighlight, pressedFill ];
    shadowNode.cachedPaints = [ upFillShadow, overFillShadow ];

    // Change colors to match interactionState
    function interactionStateListener( interactionState ) {

      switch( interactionState ) {

        case ButtonInteractionState.IDLE:
        case ButtonInteractionState.DISABLED:
          button.fill = upFillHighlight;
          shadowNode.fill = upFillShadow;
          break;

        case ButtonInteractionState.OVER:
          button.fill = overFillHighlight;
          shadowNode.fill = overFillShadow;
          break;

        case ButtonInteractionState.PRESSED:
        case ButtonInteractionState.DISABLED_PRESSED:
          button.fill = pressedFill;
          shadowNode.fill = overFillShadow;
          break;

        default:
          throw new Error( `unsupported interactionState: ${interactionState}` );
      }
    }

    interactionStateProperty.link( interactionStateListener );

    // @public
    this.dispose = () => {
      if ( interactionStateProperty.hasListener( interactionStateListener ) ) {
        interactionStateProperty.unlink( interactionStateListener );
      }

      baseBrighter8.dispose();
      baseBrighter7.dispose();
      baseBrighter3.dispose();
      baseDarker1.dispose();
      baseDarker2.dispose();
      baseDarker4.dispose();
      baseDarker5.dispose();
      baseTransparent.dispose();
    };
  }
}

// @public
RoundButton.ThreeDAppearanceStrategy = ThreeDAppearanceStrategy;

sun.register( 'RoundButton', RoundButton );
export default RoundButton;