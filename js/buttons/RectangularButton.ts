// Copyright 2014-2022, University of Colorado Boulder

/**
 * RectangularButton is the base class for rectangular buttons.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import Multilink from '../../../axon/js/Multilink.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import { Shape } from '../../../kite/js/imports.js';
import optionize from '../../../phet-core/js/optionize.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import { Color, TPaint, LinearGradient, Node, PaintColorProperty, Path } from '../../../scenery/js/imports.js';
import sun from '../sun.js';
import ButtonInteractionState from './ButtonInteractionState.js';
import ButtonModel from './ButtonModel.js';
import ButtonNode, { ButtonNodeOptions, ExternalButtonNodeOptions } from './ButtonNode.js';
import RadioButtonInteractionState from './RadioButtonInteractionState.js';
import TButtonAppearanceStrategy, { TButtonAppearanceStrategyOptions } from './TButtonAppearanceStrategy.js';

// constants
const VERTICAL_HIGHLIGHT_GRADIENT_LENGTH = 7; // In screen coords, which are roughly pixels.
const HORIZONTAL_HIGHLIGHT_GRADIENT_LENGTH = 7; // In screen coords, which are roughly pixels.
const SHADE_GRADIENT_LENGTH = 3; // In screen coords, which are roughly pixels.

type SelfOptions = {

  // If specified, this will be the size of the button. minWidth and minHeight will be ignored, and
  // content will be scaled down to fit inside, accounting for margins.
  // NOTE: This will NOT be the size of the button. It does NOT account for the stroke/lineWidth, so the button will
  // ALWAYS be larger than this.
  // ADDITIONALLY: The button can be larger, if the content doesn't fit.
  size?: Dimension2 | null;

  // If you want complete control of a button's dimensions, use options.size. If you want to specify
  // one dimensions while having the other dimension determined by content and margin, then use one of these
  // options.
  // NOTE: This minWidth/minHeight does NOT include the stroke
  minWidth?: number;
  minHeight?: number;

  // pointer area dilation
  touchAreaXDilation?: number;
  touchAreaYDilation?: number;
  mouseAreaXDilation?: number;
  mouseAreaYDilation?: number;

  // pointer area shift, see https://github.com/phetsims/sun/issues/500
  touchAreaXShift?: number;
  touchAreaYShift?: number;
  mouseAreaXShift?: number;
  mouseAreaYShift?: number;

  stroke?: TPaint | null; // when null, a stroke will be derived from the base color
  lineWidth?: number; // Only meaningful if stroke is non-null

  // radius applied to all corners unless a corner-specific value is provided
  cornerRadius?: number;

  // {number|null} corner-specific radii
  // If null, the option is ignored.
  // If non-null, it overrides cornerRadius for the associated corner of the button.
  leftTopCornerRadius?: number | null;
  rightTopCornerRadius?: number | null;
  leftBottomCornerRadius?: number | null;
  rightBottomCornerRadius?: number | null;
};

export type RectangularButtonOptions = SelfOptions & ExternalButtonNodeOptions;

export default class RectangularButton extends ButtonNode {

  public static ThreeDAppearanceStrategy: TButtonAppearanceStrategy;

  /**
   * @param buttonModel - Model that defines the button's behavior.
   * @param interactionStateProperty - a Property that is used to drive the visual appearance of the button
   * @param providedOptions
   */
  protected constructor( buttonModel: ButtonModel, interactionStateProperty: TReadOnlyProperty<ButtonInteractionState>,
                         providedOptions?: RectangularButtonOptions ) {

    const options = optionize<RectangularButtonOptions, SelfOptions, ButtonNodeOptions>()( {
      size: null,

      minWidth: HORIZONTAL_HIGHLIGHT_GRADIENT_LENGTH + SHADE_GRADIENT_LENGTH,
      minHeight: VERTICAL_HIGHLIGHT_GRADIENT_LENGTH + SHADE_GRADIENT_LENGTH,

      xMargin: 8, // should be visibly greater than yMargin, see issue #109
      yMargin: 5,

      touchAreaXDilation: 0,
      touchAreaYDilation: 0,
      mouseAreaXDilation: 0,
      mouseAreaYDilation: 0,

      touchAreaXShift: 0,
      touchAreaYShift: 0,
      mouseAreaXShift: 0,
      mouseAreaYShift: 0,

      stroke: null, // null by default, which will cause a stroke to be derived from the base color
      lineWidth: 0.5,
      cornerRadius: 4,

      leftTopCornerRadius: null,
      rightTopCornerRadius: null,
      leftBottomCornerRadius: null,
      rightBottomCornerRadius: null,

      // Class that determines the button's appearance for the values of interactionStateProperty.
      // See RectangularButton.ThreeDAppearanceStrategy for an example of the interface required.
      buttonAppearanceStrategy: RectangularButton.ThreeDAppearanceStrategy
    }, providedOptions );

    if ( !options.content ) {
      assert && assert( options.size !== undefined, 'button dimensions needed if no content is supplied.' );
    }

    if ( options.size ) {
      assert && assert( options.xMargin < options.size.width, 'xMargin cannot be larger than width' );
      assert && assert( options.yMargin < options.size.height, 'yMargin cannot be larger than height' );

      options.minUnstrokedWidth = options.size.width;
      options.minUnstrokedHeight = options.size.height;
    }
    else {
      if ( options.minWidth !== undefined ) {
        options.minUnstrokedWidth = options.minWidth;
      }
      if ( options.minHeight !== undefined ) {
        options.minUnstrokedHeight = options.minHeight;
      }
    }

    // If no options were explicitly passed in for the button appearance strategy, pass through the general appearance
    // options.
    if ( !options.buttonAppearanceStrategyOptions ) {
      options.buttonAppearanceStrategyOptions = {
        stroke: options.stroke,
        lineWidth: options.lineWidth
      };
    }

    // Compute the size of the button.
    let buttonWidth: number;
    let buttonHeight: number;

    if ( options.size ) {
      buttonWidth = options.size.width;
      buttonHeight = options.size.height;
    }
    else {
      buttonWidth = Math.max( options.content ? options.content.width + options.xMargin * 2 : 0, options.minWidth );
      buttonHeight = Math.max( options.content ? options.content.height + options.yMargin * 2 : 0, options.minHeight );
    }

    // Create the rectangular part of the button.
    const buttonBackground = new Path( createButtonShape( buttonWidth, buttonHeight, options ) );

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

    let isFirstlayout = true;
    Multilink.multilink( [
      this.isWidthResizableProperty,
      this.isHeightResizableProperty,
      this.layoutSizeProperty
    ], ( isWidthSizable, isHeightSizable, layoutSize ) => {
      if ( isWidthSizable || isHeightSizable ) {
        buttonBackground.shape = createButtonShape(
          isWidthSizable ? layoutSize.width - this.maxLineWidth : buttonWidth,
          isHeightSizable ? layoutSize.height - this.maxLineWidth : buttonHeight,
          options );
        assert && assert( !isWidthSizable || buttonBackground.width <= layoutSize.width + 1e-7, 'button width cannot exceed layout width' );
        assert && assert( !isHeightSizable || buttonBackground.height <= layoutSize.height + 1e-7, 'button width cannot exceed layout height' );
      }

      if ( isFirstlayout || isWidthSizable || isHeightSizable ) {
        // Set pointer areas.
        this.touchArea = buttonBackground.localBounds
          .dilatedXY( options.touchAreaXDilation, options.touchAreaYDilation )
          .shiftedXY( options.touchAreaXShift, options.touchAreaYShift );
        this.mouseArea = buttonBackground.localBounds
          .dilatedXY( options.mouseAreaXDilation, options.mouseAreaYDilation )
          .shiftedXY( options.mouseAreaXShift, options.mouseAreaYShift );
      }

      isFirstlayout = false;
    } );
  }
}

/**
 * Convenience function for creating the shape of the button, done to avoid code duplication
 * @param width
 * @param height
 * @param config - RectangularButton config, containing values related to radii of button corners
 */
function createButtonShape( width: number, height: number,
                            config: PickRequired<RectangularButtonOptions, 'cornerRadius' | 'leftTopCornerRadius' | 'rightTopCornerRadius' | 'leftBottomCornerRadius' | 'rightBottomCornerRadius'> ): Shape {

  // Don't allow a corner radius that is larger than half the width or height, see
  // https://github.com/phetsims/under-pressure/issues/151
  const maxCorner = Math.min( width / 2, height / 2 );

  return Shape.roundedRectangleWithRadii( 0, 0, width, height, {
    topLeft: Math.min( maxCorner, config.leftTopCornerRadius !== null ? config.leftTopCornerRadius : config.cornerRadius ),
    topRight: Math.min( maxCorner, config.rightTopCornerRadius !== null ? config.rightTopCornerRadius : config.cornerRadius ),
    bottomLeft: Math.min( maxCorner, config.leftBottomCornerRadius !== null ? config.leftBottomCornerRadius : config.cornerRadius ),
    bottomRight: Math.min( maxCorner, config.rightBottomCornerRadius !== null ? config.rightBottomCornerRadius : config.cornerRadius )
  } );
}

/**
 * ThreeDAppearanceStrategy is a value for RectangularButton options.buttonAppearanceStrategy. It makes a rectangular
 * button look 3D-ish by using gradients that create the appearance of highlighted and shaded edges. The gradients are
 * set up to make the light source appear to be in the upper left.
 */
class ThreeDAppearanceStrategy {

  public readonly maxLineWidth: number;

  private readonly disposeThreeDAppearanceStrategy: () => void;

  /**
   * @param buttonBackground - the Node for the button's background, sans content
   * @param interactionStateProperty
   * @param baseColorProperty
   * @param [providedOptions]
   */
  public constructor( buttonBackground: Path,
                      interactionStateProperty: TReadOnlyProperty<ButtonInteractionState | RadioButtonInteractionState>,
                      baseColorProperty: TReadOnlyProperty<Color>,
                      providedOptions?: TButtonAppearanceStrategyOptions ) {

    // If stroke and lineWidth exist in the provided options, they become the default for all strokes and line widths.
    // If not, defaults are created.
    const defaultStroke = ( providedOptions && providedOptions.stroke ) ?
                          providedOptions.stroke :
                          new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.4 } );
    const defaultLineWidth = ( providedOptions && providedOptions.lineWidth !== undefined ) ?
                             providedOptions.lineWidth :
                             0.5;

    const options = optionize<TButtonAppearanceStrategyOptions>()( {
      stroke: defaultStroke,
      lineWidth: defaultLineWidth,
      overStroke: defaultStroke,
      overLineWidth: defaultLineWidth,
      overFill: baseColorProperty,
      overButtonOpacity: 1,
      selectedStroke: defaultStroke,
      selectedLineWidth: defaultLineWidth,
      selectedButtonOpacity: 1,
      deselectedStroke: defaultStroke,
      deselectedLineWidth: defaultLineWidth,
      deselectedButtonOpacity: 1
    }, providedOptions );

    // Create the colors that will be used to produce the gradients and shading needed for the 3D appearance.
    const baseBrighter7Property = new PaintColorProperty( baseColorProperty, { luminanceFactor: 0.7 } );
    const baseBrighter5Property = new PaintColorProperty( baseColorProperty, { luminanceFactor: 0.5 } );
    const baseBrighter2Property = new PaintColorProperty( baseColorProperty, { luminanceFactor: 0.2 } );
    const baseDarker3Property = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.3 } );
    const baseDarker4Property = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.4 } );
    const baseDarker5Property = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.5 } );
    const baseTransparentProperty = new DerivedProperty( [ baseColorProperty ], color => color.withAlpha( 0 ) );
    const transparentWhite = new Color( 255, 255, 255, 0.7 );

    // Adds shading to left and right edges of the button.
    const horizontalShadingPath = new Path( null, {
      stroke: options.stroke,
      lineWidth: options.lineWidth,
      pickable: false
    } );
    buttonBackground.addChild( horizontalShadingPath );

    this.maxLineWidth = typeof options.lineWidth === 'number' ? options.lineWidth : 0;

    let interactionStateListener: ( interactionState: ButtonInteractionState ) => void;

    // We'll need to listen to the shape changes in order to update our appearance.
    const listener = () => {

      // Handle our gradients based on the path's actual shape, NOT including the stroked part
      const buttonWidth = buttonBackground.shape!.bounds.width;
      const buttonHeight = buttonBackground.shape!.bounds.height;

      horizontalShadingPath.shape = buttonBackground.shape;

      // compute color stops for gradient, see issue #148
      assert && assert( buttonWidth >= HORIZONTAL_HIGHLIGHT_GRADIENT_LENGTH + SHADE_GRADIENT_LENGTH );
      assert && assert( buttonHeight >= VERTICAL_HIGHLIGHT_GRADIENT_LENGTH + SHADE_GRADIENT_LENGTH );
      const verticalHighlightStop = Math.min( VERTICAL_HIGHLIGHT_GRADIENT_LENGTH / buttonHeight, 1 );
      const verticalShadowStop = Math.max( 1 - SHADE_GRADIENT_LENGTH / buttonHeight, 0 );
      const horizontalHighlightStop = Math.min( HORIZONTAL_HIGHLIGHT_GRADIENT_LENGTH / buttonWidth, 1 );
      const horizontalShadowStop = Math.max( 1 - SHADE_GRADIENT_LENGTH / buttonWidth, 0 );

      // Gradient fills for button states
      const upFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
        .addColorStop( 0, baseBrighter7Property )
        .addColorStop( verticalHighlightStop, baseColorProperty )
        .addColorStop( verticalShadowStop, baseColorProperty )
        .addColorStop( 1, baseDarker5Property );

      const upFillHorizontal = new LinearGradient( 0, 0, buttonWidth, 0 )
        .addColorStop( 0, transparentWhite )
        .addColorStop( horizontalHighlightStop, baseTransparentProperty )
        .addColorStop( horizontalShadowStop, baseTransparentProperty )
        .addColorStop( 1, baseDarker5Property );

      const overFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
        .addColorStop( 0, baseBrighter7Property )
        .addColorStop( verticalHighlightStop, baseBrighter5Property )
        .addColorStop( verticalShadowStop, baseBrighter5Property )
        .addColorStop( 1, baseDarker5Property );

      const overFillHorizontal = new LinearGradient( 0, 0, buttonWidth, 0 )
        .addColorStop( 0, transparentWhite )
        .addColorStop( horizontalHighlightStop / 2, new Color( 255, 255, 255, 0 ) )
        .addColorStop( horizontalShadowStop, baseTransparentProperty )
        .addColorStop( 1, baseDarker3Property );

      const downFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
        .addColorStop( 0, baseBrighter7Property )
        .addColorStop( verticalHighlightStop * 0.67, baseDarker3Property )
        .addColorStop( verticalShadowStop, baseBrighter2Property )
        .addColorStop( 1, baseDarker5Property );

      // Cache gradients
      buttonBackground.cachedPaints = [ upFillVertical, overFillVertical, downFillVertical ];
      horizontalShadingPath.cachedPaints = [ upFillHorizontal, overFillHorizontal ];

      interactionStateListener && interactionStateProperty.unlink( interactionStateListener );

      // Change colors to match interactionState
      interactionStateListener = ( interactionState: ButtonInteractionState ) => {

        switch( interactionState ) {

          case ButtonInteractionState.IDLE:
            buttonBackground.fill = upFillVertical;
            buttonBackground.stroke = options.deselectedStroke;
            buttonBackground.lineWidth = options.deselectedLineWidth;
            buttonBackground.opacity = options.deselectedButtonOpacity;
            horizontalShadingPath.fill = upFillHorizontal;
            horizontalShadingPath.opacity = options.deselectedButtonOpacity;
            break;

          case ButtonInteractionState.OVER:
            buttonBackground.fill = overFillVertical;
            buttonBackground.stroke = options.overStroke;
            buttonBackground.lineWidth = options.overLineWidth;
            buttonBackground.opacity = options.overButtonOpacity;
            horizontalShadingPath.fill = overFillHorizontal;
            horizontalShadingPath.opacity = options.overButtonOpacity;
            break;

          case ButtonInteractionState.PRESSED:
            buttonBackground.fill = downFillVertical;
            buttonBackground.stroke = options.selectedStroke;
            buttonBackground.lineWidth = options.selectedLineWidth;
            buttonBackground.opacity = options.selectedButtonOpacity;
            horizontalShadingPath.fill = overFillHorizontal;
            horizontalShadingPath.opacity = options.selectedButtonOpacity;
            break;

          default:
            throw new Error( `unsupported interactionState: ${interactionState}` );
        }
      };
      interactionStateProperty.link( interactionStateListener );

    };
    buttonBackground.selfBoundsProperty.link( listener );

    this.disposeThreeDAppearanceStrategy = () => {
      buttonBackground.selfBoundsProperty.unlink( listener );
      if ( interactionStateProperty.hasListener( interactionStateListener ) ) {
        interactionStateProperty.unlink( interactionStateListener );
      }

      baseBrighter7Property.dispose();
      baseBrighter5Property.dispose();
      baseBrighter2Property.dispose();
      baseDarker3Property.dispose();
      baseDarker4Property.dispose();
      baseDarker5Property.dispose();
      baseTransparentProperty.dispose();
    };
  }

  public dispose(): void {
    this.disposeThreeDAppearanceStrategy();
  }
}

RectangularButton.ThreeDAppearanceStrategy = ThreeDAppearanceStrategy;

sun.register( 'RectangularButton', RectangularButton );
