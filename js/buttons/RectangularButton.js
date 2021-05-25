// Copyright 2014-2021, University of Colorado Boulder

/**
 * Visual representation of a rectangular button.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import Shape from '../../../kite/js/Shape.js';
import merge from '../../../phet-core/js/merge.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Path from '../../../scenery/js/nodes/Path.js';
import Color from '../../../scenery/js/util/Color.js';
import LinearGradient from '../../../scenery/js/util/LinearGradient.js';
import PaintColorProperty from '../../../scenery/js/util/PaintColorProperty.js';
import sun from '../sun.js';
import ButtonInteractionState from './ButtonInteractionState.js';
import ButtonNode from './ButtonNode.js';

// constants
const VERTICAL_HIGHLIGHT_GRADIENT_LENGTH = 7; // In screen coords, which are roughly pixels.
const HORIZONTAL_HIGHLIGHT_GRADIENT_LENGTH = 7; // In screen coords, which are roughly pixels.
const SHADE_GRADIENT_LENGTH = 3; // In screen coords, which are roughly pixels.

class RectangularButton extends ButtonNode {

  /**
   * @param {ButtonModel} buttonModel - Model that defines the button's behavior.
   * @param {Property} interactionStateProperty - a Property that is used to drive the visual appearance of the button
   * @param {Object} [options]
   */
  constructor( buttonModel, interactionStateProperty, options ) {

    options = merge( {

      // {Node|null} what appears on the button (icon, label, etc.)
      content: null,

      // {Dimension2} - if specified, this will be the size of the button. minWidth and minHeight will be ignored, and
      // content will be scaled down to fit inside, accounting for margins.
      size: null,

      // {number} If you want complete control of a button's dimensions, use options.size. If you want to specify
      // one dimensions while having the other dimension determined by content and margin, then use one of these
      // options.
      minWidth: HORIZONTAL_HIGHLIGHT_GRADIENT_LENGTH + SHADE_GRADIENT_LENGTH,
      minHeight: VERTICAL_HIGHLIGHT_GRADIENT_LENGTH + SHADE_GRADIENT_LENGTH,

      xMargin: 8, // should be visibly greater than yMargin, see issue #109
      yMargin: 5,

      // pointer area dilation
      touchAreaXDilation: 0,
      touchAreaYDilation: 0,
      mouseAreaXDilation: 0,
      mouseAreaYDilation: 0,

      // pointer area shift, see https://github.com/phetsims/sun/issues/500
      touchAreaXShift: 0,
      touchAreaYShift: 0,
      mouseAreaXShift: 0,
      mouseAreaYShift: 0,

      stroke: undefined, // undefined by default, which will cause a stroke to be derived from the base color
      lineWidth: 0.5, // Only meaningful if stroke is non-null

      // Alignment, relevant only when options minWidth or minHeight are greater than the size of options.content
      xAlign: 'center', // {string} see X_ALIGN_VALUES
      yAlign: 'center', // {string} see Y_ALIGN_VALUES

      // radius applied to all corners unless a corner-specific value is provided
      cornerRadius: 4,

      // {number|null} corner-specific radii
      // If null, the option is ignored.
      // If non-null, it overrides cornerRadius for the associated corner of the button.
      leftTopCornerRadius: null,
      rightTopCornerRadius: null,
      leftBottomCornerRadius: null,
      rightBottomCornerRadius: null,

      // Class that determines the button's appearance for the values of interactionStateProperty.
      // See RectangularButton.ThreeDAppearanceStrategy for an example of the interface required.
      buttonAppearanceStrategy: RectangularButton.ThreeDAppearanceStrategy
    }, options );

    if ( !options.content ) {
      assert && assert( options.size instanceof Dimension2, 'button dimensions needed if no content is supplied.' );
    }

    if ( options.size ) {
      assert && assert( options.xMargin < options.size.width, 'xMargin cannot be larger than width' );
      assert && assert( options.yMargin < options.size.height, 'yMargin cannot be larger than height' );
    }

    // Compute the size of the button.
    let buttonWidth;
    let buttonHeight;

    if ( options.size ) {
      buttonWidth = options.size.width;
      buttonHeight = options.size.height;
    }
    else {
      buttonWidth = Math.max( options.content ? options.content.width + options.xMargin * 2 : 0, options.minWidth );
      buttonHeight = Math.max( options.content ? options.content.height + options.yMargin * 2 : 0, options.minHeight );
    }

    // Create the rectangular part of the button.
    const buttonBackground = new Path( createButtonShape( buttonWidth, buttonHeight, options ), {
      lineWidth: options.lineWidth
    } );

    if ( options.size && options.content ) {
      const previousContent = options.content;
      const minScale = Math.min(
        ( options.size.width - options.xMargin * 2 ) / previousContent.width,
        ( options.size.height - options.yMargin * 2 ) / previousContent.height );

      options.content = new Node( {
        children: [ previousContent ],
        scale: minScale
      } );
    }

    super( buttonModel, buttonBackground, interactionStateProperty, options );

    // Set pointer areas.
    this.touchArea = buttonBackground.localBounds
      .dilatedXY( options.touchAreaXDilation, options.touchAreaYDilation )
      .shiftedXY( options.touchAreaXShift, options.touchAreaYShift );
    this.mouseArea = buttonBackground.localBounds
      .dilatedXY( options.mouseAreaXDilation, options.mouseAreaYDilation )
      .shiftedXY( options.mouseAreaXShift, options.mouseAreaYShift );
  }
}

/**
 * Convenience function for creating the shape of the button, done to avoid code duplication
 * @param {number} width
 * @param {number} height
 * @param {Object} config - RectangularButton config, containing values related to radii of button corners
 * @returns {Shape}
 */
function createButtonShape( width, height, config ) {
  assert && assert( typeof config.cornerRadius === 'number', 'cornerRadius is required' );
  return Shape.roundedRectangleWithRadii( 0, 0, width, height, {
    topLeft: config.leftTopCornerRadius !== null ? config.leftTopCornerRadius : config.cornerRadius,
    topRight: config.rightTopCornerRadius !== null ? config.rightTopCornerRadius : config.cornerRadius,
    bottomLeft: config.leftBottomCornerRadius !== null ? config.leftBottomCornerRadius : config.cornerRadius,
    bottomRight: config.rightBottomCornerRadius !== null ? config.rightBottomCornerRadius : config.cornerRadius
  } );
}

/**
 * ThreeDAppearanceStrategy is a value for RectangularButton options.buttonAppearanceStrategy. It makes a rectangular
 * button look 3D-ish by using gradients that create the appearance of highlighted and shaded edges. The gradients are
 * set up to make the light source appear to be in the upper left.
 */
class ThreeDAppearanceStrategy {

  /**
   * @param {Node,Paintable} buttonBackground - the Node for the button's background, sans content
   * @param {Property.<ButtonInteractionState>} interactionStateProperty
   * @param {Property.<Color>} baseColorProperty
   * @param {Object} [options]
   */
  constructor( buttonBackground, interactionStateProperty, baseColorProperty, options ) {

    const buttonWidth = buttonBackground.width;
    const buttonHeight = buttonBackground.height;

    // compute color stops for gradient, see issue #148
    assert && assert( buttonWidth >= HORIZONTAL_HIGHLIGHT_GRADIENT_LENGTH + SHADE_GRADIENT_LENGTH );
    assert && assert( buttonHeight >= VERTICAL_HIGHLIGHT_GRADIENT_LENGTH + SHADE_GRADIENT_LENGTH );
    const verticalHighlightStop = Math.min( VERTICAL_HIGHLIGHT_GRADIENT_LENGTH / buttonHeight, 1 );
    const verticalShadowStop = Math.max( 1 - SHADE_GRADIENT_LENGTH / buttonHeight, 0 );
    const horizontalHighlightStop = Math.min( HORIZONTAL_HIGHLIGHT_GRADIENT_LENGTH / buttonWidth, 1 );
    const horizontalShadowStop = Math.max( 1 - SHADE_GRADIENT_LENGTH / buttonWidth, 0 );
    const transparentWhite = new Color( 255, 255, 255, 0.7 );

    // Dynamic colors
    // TODO https://github.com/phetsims/sun/issues/553 missing "Property" suffix for all PaintColorProperty names
    const baseBrighter7 = new PaintColorProperty( baseColorProperty, { luminanceFactor: 0.7 } );
    const baseBrighter5 = new PaintColorProperty( baseColorProperty, { luminanceFactor: 0.5 } );
    const baseBrighter2 = new PaintColorProperty( baseColorProperty, { luminanceFactor: 0.2 } );
    const baseDarker3 = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.3 } );
    const baseDarker4 = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.4 } );
    const baseDarker5 = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.5 } );
    const baseTransparent = new DerivedProperty( [ baseColorProperty ], color => color.withAlpha( 0 ) );

    // Gradient fills for button states
    const upFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
      .addColorStop( 0, baseBrighter7 )
      .addColorStop( verticalHighlightStop, baseColorProperty )
      .addColorStop( verticalShadowStop, baseColorProperty )
      .addColorStop( 1, baseDarker5 );

    const upFillHorizontal = new LinearGradient( 0, 0, buttonWidth, 0 )
      .addColorStop( 0, transparentWhite )
      .addColorStop( horizontalHighlightStop, baseTransparent )
      .addColorStop( horizontalShadowStop, baseTransparent )
      .addColorStop( 1, baseDarker5 );

    const overFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
      .addColorStop( 0, baseBrighter7 )
      .addColorStop( verticalHighlightStop, baseBrighter5 )
      .addColorStop( verticalShadowStop, baseBrighter5 )
      .addColorStop( 1, baseDarker5 );

    const overFillHorizontal = new LinearGradient( 0, 0, buttonWidth, 0 )
      .addColorStop( 0, transparentWhite )
      .addColorStop( horizontalHighlightStop / 2, new Color( 255, 255, 255, 0 ) )
      .addColorStop( horizontalShadowStop, baseTransparent )
      .addColorStop( 1, baseDarker3 );

    const downFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
      .addColorStop( 0, baseBrighter7 )
      .addColorStop( verticalHighlightStop * 0.67, baseDarker3 )
      .addColorStop( verticalShadowStop, baseBrighter2 )
      .addColorStop( 1, baseDarker5 );

    // Adds shading to left and right edges of the button.
    const horizontalShadingPath = new Path( createButtonShape( buttonWidth, buttonHeight, options ), {
      stroke: ( typeof ( options.stroke ) === 'undefined' ) ? baseDarker4 : options.stroke,
      lineWidth: options.lineWidth,
      pickable: false
    } );
    buttonBackground.addChild( horizontalShadingPath );

    // Cache gradients
    buttonBackground.cachedPaints = [ upFillVertical, overFillVertical, downFillVertical ];
    horizontalShadingPath.cachedPaints = [ upFillHorizontal, overFillHorizontal ];

    // Change colors to match interactionState
    function interactionStateListener( interactionState ) {

      switch( interactionState ) {

        case ButtonInteractionState.IDLE:
          buttonBackground.fill = upFillVertical;
          horizontalShadingPath.fill = upFillHorizontal;
          break;

        case ButtonInteractionState.OVER:
          buttonBackground.fill = overFillVertical;
          horizontalShadingPath.fill = overFillHorizontal;
          break;

        case ButtonInteractionState.PRESSED:
          buttonBackground.fill = downFillVertical;
          horizontalShadingPath.fill = overFillHorizontal;
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

      baseBrighter7.dispose();
      baseBrighter5.dispose();
      baseBrighter2.dispose();
      baseDarker3.dispose();
      baseDarker4.dispose();
      baseDarker5.dispose();
      baseTransparent.dispose();
    };
  }
}

// @public
RectangularButton.ThreeDAppearanceStrategy = ThreeDAppearanceStrategy;

sun.register( 'RectangularButton', RectangularButton );
export default RectangularButton;