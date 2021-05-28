// Copyright 2014-2021, University of Colorado Boulder

/**
 * RoundButton is the base class for round buttons.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Shape from '../../../kite/js/Shape.js';
import merge from '../../../phet-core/js/merge.js';
import Circle from '../../../scenery/js/nodes/Circle.js';
import Node from '../../../scenery/js/nodes/Node.js';
import PaintColorProperty from '../../../scenery/js/util/PaintColorProperty.js';
import RadialGradient from '../../../scenery/js/util/RadialGradient.js';
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

      radius: ( options && options.content ) ? null : 30,
      cursor: 'pointer',

      // If these are not the same, the larger one will be used to calculate the size of the button
      xMargin: 5, // Minimum margin in x direction, i.e. on left and right
      yMargin: 5, // Minimum margin in y direction, i.e. on top and bottom

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

      // Class that determines the button's appearance for the values of interactionStateProperty.
      // See RoundButton.ThreeDAppearanceStrategy for an example of the interface required.
      buttonAppearanceStrategy: RoundButton.ThreeDAppearanceStrategy
    }, options );

    if ( !options.content ) {
      assert && assert( typeof options.radius === 'number', `invalid radius: ${options.radius}` );
    }

    if ( options.radius ) {
      assert && assert( options.xMargin < options.radius, 'xMargin cannot be larger than radius' );
      assert && assert( options.yMargin < options.radius, 'yMargin cannot be larger than radius' );
    }

    // Compute the radius of the button. radius will not be falsey if content is also falsey
    const buttonRadius = options.radius ||
                         Math.max( options.content.width + options.xMargin * 2, options.content.height + options.yMargin * 2 ) / 2;

    if ( options.content && options.radius ) {
      const previousContent = options.content;
      const minScale = Math.min(
        ( options.radius - options.xMargin ) * 2 / previousContent.width,
        ( options.radius - options.yMargin ) * 2 / previousContent.height );

      options.content = new Node( {
        children: [ previousContent ],
        scale: minScale
      } );
    }

    // Create the circular part of the button.
    const buttonBackground = new Circle( buttonRadius, {
      lineWidth: options.lineWidth
    } );

    super( buttonModel, buttonBackground, interactionStateProperty, options );

    // Get the actual button radius after calling super, so that buttonAppearanceStrategy has applied the stroke.
    // This accounts for stroke + lineWidth, which is important when setting pointer areas and focus highlight.
    // See https://github.com/phetsims/sun/issues/660
    const buttonBackgroundRadius = buttonBackground.localBounds.width / 2;

    // Set pointer areas.
    this.touchArea = Shape.circle( options.touchAreaXShift, options.touchAreaYShift,
      buttonBackgroundRadius + options.touchAreaDilation );
    this.mouseArea = Shape.circle( options.mouseAreaXShift, options.mouseAreaYShift,
      buttonBackgroundRadius + options.mouseAreaDilation );

    // pdom - focus highlight is circular for round buttons, with a little bit of padding
    // between button shape and inner edge of highlight
    this.focusHighlight = Shape.circle( 0, 0, buttonBackgroundRadius + 5 );
  }
}

/**
 * ThreeDAppearanceStrategy is a value for RoundButton options.buttonAppearanceStrategy. It makes a round button
 * look 3D-ish by using gradients that create the appearance of highlighted and shaded edges. The gradients are
 * set up to make the light source appear to be in the upper left.
 */
class ThreeDAppearanceStrategy {

  /**
   * @param {Node,Paintable} buttonBackground - the Node for the button's background, sans content
   * @param {Property.<ButtonInteractionState>} interactionStateProperty
   * @param {Property.<ColorDef>} baseColorProperty
   * @param {Object} [options]
   */
  constructor( buttonBackground, interactionStateProperty, baseColorProperty, options ) {

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
    const buttonRadius = buttonBackground.width / 2;
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
    buttonBackground.addChild( shadowNode );

    // Cache gradients
    buttonBackground.cachedPaints = [ upFillHighlight, overFillHighlight, pressedFill ];
    shadowNode.cachedPaints = [ upFillShadow, overFillShadow ];

    // Change colors to match interactionState
    function interactionStateListener( interactionState ) {

      switch( interactionState ) {

        case ButtonInteractionState.IDLE:
          buttonBackground.fill = upFillHighlight;
          shadowNode.fill = upFillShadow;
          break;

        case ButtonInteractionState.OVER:
          buttonBackground.fill = overFillHighlight;
          shadowNode.fill = overFillShadow;
          break;

        case ButtonInteractionState.PRESSED:
          buttonBackground.fill = pressedFill;
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