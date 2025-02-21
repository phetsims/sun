// Copyright 2014-2025, University of Colorado Boulder

/**
 * RectangularButton is the base class for rectangular buttons.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import type TinyProperty from '../../../axon/js/TinyProperty.js';
import type TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import Shape from '../../../kite/js/Shape.js';
import optionize from '../../../phet-core/js/optionize.js';
import type PickRequired from '../../../phet-core/js/types/PickRequired.js';
import LayoutConstraint from '../../../scenery/js/layout/constraints/LayoutConstraint.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Path from '../../../scenery/js/nodes/Path.js';
import Color from '../../../scenery/js/util/Color.js';
import LinearGradient from '../../../scenery/js/util/LinearGradient.js';
import PaintColorProperty from '../../../scenery/js/util/PaintColorProperty.js';
import type TPaint from '../../../scenery/js/util/TPaint.js';
import sun from '../sun.js';
import ButtonInteractionState from './ButtonInteractionState.js';
import type ButtonModel from './ButtonModel.js';
import ButtonNode, { type ButtonNodeOptions } from './ButtonNode.js';
import type RadioButtonInteractionState from './RadioButtonInteractionState.js';
import { type TButtonAppearanceStrategyOptions } from './TButtonAppearanceStrategy.js';
import type TButtonAppearanceStrategy from './TButtonAppearanceStrategy.js';

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

export type RectangularButtonOptions = SelfOptions & ButtonNodeOptions;

type ButtonShapeOptions = PickRequired<RectangularButtonOptions, 'cornerRadius' | 'leftTopCornerRadius' | 'rightTopCornerRadius' | 'leftBottomCornerRadius' | 'rightBottomCornerRadius'>;

export default class RectangularButton extends ButtonNode {

  public static ThreeDAppearanceStrategy: TButtonAppearanceStrategy;

  private readonly buttonNodeConstraint: RectangularButtonNodeConstraint;

  /**
   * @param buttonModel - Model that defines the button's behavior.
   * @param interactionStateProperty - a Property that is used to drive the visual appearance of the button
   * @param providedOptions
   */
  protected constructor( buttonModel: ButtonModel, interactionStateProperty: TReadOnlyProperty<ButtonInteractionState>,
                         providedOptions?: RectangularButtonOptions ) {

    let options = optionize<RectangularButtonOptions, SelfOptions, ButtonNodeOptions>()( {
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
    }

    // If no options were explicitly passed in for the button appearance strategy, pass through the general appearance
    // options.
    if ( !options.buttonAppearanceStrategyOptions ) {
      options.buttonAppearanceStrategyOptions = {
        stroke: options.stroke,
        lineWidth: options.lineWidth
      };
    }

    // Create the rectangular part of the button.
    const buttonBackground = new Path( null );

    const boundsRequiredOptionKeys = _.pick( options, Node.REQUIRES_BOUNDS_OPTION_KEYS );
    options = _.omit( options, Node.REQUIRES_BOUNDS_OPTION_KEYS ) as typeof options;

    super( buttonModel, buttonBackground, interactionStateProperty, options );

    this.buttonNodeConstraint = new RectangularButtonNodeConstraint( this, this.layoutSizeProperty, {
      content: options.content ?? null,
      size: options.size,
      buttonBackground: buttonBackground,
      buttonBackgroundOptions: options,
      minWidth: options.minWidth,
      minHeight: options.minHeight,
      xMargin: options.xMargin,
      yMargin: options.yMargin,
      maxLineWidth: this.maxLineWidth,
      touchAreaXDilation: options.touchAreaXDilation,
      touchAreaYDilation: options.touchAreaYDilation,
      touchAreaXShift: options.touchAreaXShift,
      touchAreaYShift: options.touchAreaYShift,
      mouseAreaXDilation: options.mouseAreaXDilation,
      mouseAreaYDilation: options.mouseAreaYDilation,
      mouseAreaXShift: options.mouseAreaXShift,
      mouseAreaYShift: options.mouseAreaYShift
    } );
    this.addDisposable( this.buttonNodeConstraint );

    this.mutate( boundsRequiredOptionKeys );
  }
}

/**
 * Convenience function for creating the shape of the button, done to avoid code duplication
 * @param width
 * @param height
 * @param config - RectangularButton config, containing values related to radii of button corners
 */
function createButtonShape( width: number, height: number,
                            config: ButtonShapeOptions ): Shape {

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
      deselectedFill: null,
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

      // We will be called properly later once we have a shape
      if ( !buttonBackground.shape ) {
        return;
      }

      // Handle our gradients based on the path's actual shape, NOT including the stroked part
      const buttonWidth = buttonBackground.shape.bounds.width;
      const buttonHeight = buttonBackground.shape.bounds.height;

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
            buttonBackground.fill = options.deselectedFill || upFillVertical;
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

type RectangularButtonNodeConstraintOptions = {
  buttonBackground: Path;
  buttonBackgroundOptions: ButtonShapeOptions;
  maxLineWidth: number;
} & Required<Pick<RectangularButtonOptions,
  'content' | 'size' | 'xMargin' | 'yMargin' | 'minWidth' | 'minHeight' |
  'touchAreaXDilation' | 'touchAreaYDilation' | 'touchAreaXShift' | 'touchAreaYShift' |
  'mouseAreaXDilation' | 'mouseAreaYDilation' | 'mouseAreaXShift' | 'mouseAreaYShift'
>>;

class RectangularButtonNodeConstraint extends LayoutConstraint {

  private readonly options: RectangularButtonNodeConstraintOptions;

  private isFirstLayout = true;

  // Stored so that we can prevent updates if we're not marked sizable in a certain direction
  private lastLocalWidth = 0;
  private lastLocalHeight = 0;

  public constructor(
    public readonly buttonNode: ButtonNode,
    public readonly layoutSizeProperty: TinyProperty<Dimension2>,
    options: RectangularButtonNodeConstraintOptions
  ) {

    super( buttonNode );

    this.options = options;

    this.buttonNode.localPreferredWidthProperty.lazyLink( this._updateLayoutListener );
    this.buttonNode.localPreferredHeightProperty.lazyLink( this._updateLayoutListener );

    if ( this.options.content ) {
      this.addNode( this.options.content );
    }

    this.layout();
  }

  protected override layout(): void {
    super.layout();

    const buttonNode = this.buttonNode;
    const content = this.options.content;
    const contentProxy = content ? this.createLayoutProxy( content )! : null;

    // Should only happen when we are disconnected during disposal
    if ( !!content !== !!contentProxy ) {
      return;
    }

    const widthSizable = buttonNode.widthSizable;
    const heightSizable = buttonNode.heightSizable;

    let contentMinimumWidthWithMargins = contentProxy ? contentProxy.minimumWidth + this.options.xMargin * 2 : 0;
    let contentMinimumHeightWithMargins = contentProxy ? contentProxy.minimumHeight + this.options.yMargin * 2 : 0;

    // If a initial (minimum) size is specified, use this as an override (and we will scale the content down to fit)
    if ( this.options.size ) {
      contentMinimumWidthWithMargins = this.options.size.width;
      contentMinimumHeightWithMargins = this.options.size.height;
    }

    // Apply minWidth/minHeight
    if ( this.options.minWidth ) {
      contentMinimumWidthWithMargins = Math.max( this.options.minWidth + this.options.maxLineWidth, contentMinimumWidthWithMargins );
    }
    if ( this.options.minHeight ) {
      contentMinimumHeightWithMargins = Math.max( this.options.minHeight + this.options.maxLineWidth, contentMinimumHeightWithMargins );
    }

    // Only allow an initial update if we are not sizable in that dimension
    const minimumWidth =
      ( this.isFirstLayout || widthSizable )
      ? contentMinimumWidthWithMargins
      : buttonNode.localMinimumWidth!;
    const minimumHeight = ( this.isFirstLayout || heightSizable )
                          ? contentMinimumHeightWithMargins
                          : buttonNode.localMinimumHeight!;

    // Our resulting sizes (allow setting preferred width/height on the buttonNode)
    this.lastLocalWidth = this.isFirstLayout || widthSizable
                          ? Math.max( minimumWidth, widthSizable ? buttonNode.localPreferredWidth ?? 0 : 0 )
                          : this.lastLocalWidth;
    this.lastLocalHeight = this.isFirstLayout || heightSizable
                           ? Math.max( minimumHeight, heightSizable ? buttonNode.localPreferredHeight ?? 0 : 0 )
                           : this.lastLocalHeight;

    if ( this.isFirstLayout || widthSizable || heightSizable ) {
      this.options.buttonBackground.shape = createButtonShape(
        ( widthSizable ? this.lastLocalWidth : minimumWidth ) - this.options.maxLineWidth,
        ( heightSizable ? this.lastLocalHeight : minimumHeight ) - this.options.maxLineWidth,
        this.options.buttonBackgroundOptions );

      // Set pointer areas.
      this.buttonNode.touchArea = this.options.buttonBackground.localBounds
        .dilatedXY( this.options.touchAreaXDilation, this.options.touchAreaYDilation )
        .shiftedXY( this.options.touchAreaXShift, this.options.touchAreaYShift );
      this.buttonNode.mouseArea = this.options.buttonBackground.localBounds
        .dilatedXY( this.options.mouseAreaXDilation, this.options.mouseAreaYDilation )
        .shiftedXY( this.options.mouseAreaXShift, this.options.mouseAreaYShift );
    }

    if ( contentProxy ) {
      const preferredContentWidth = this.lastLocalWidth - this.options.xMargin * 2;
      const preferredContentHeight = this.lastLocalHeight - this.options.yMargin * 2;

      contentProxy.preferredWidth = preferredContentWidth;
      contentProxy.preferredHeight = preferredContentHeight;

      // Only apply max sizes if a size is specified in the button, see https://github.com/phetsims/sun/issues/889
      if ( this.options.size ) {
        const contentContainer = this.buttonNode.contentContainer!;
        assert && assert( contentContainer );

        contentContainer.maxWidth = preferredContentWidth;
        contentContainer.maxHeight = preferredContentHeight;
      }
    }

    this.isFirstLayout = false;

    this.layoutSizeProperty.value = new Dimension2( this.lastLocalWidth, this.lastLocalHeight );

    // Set minimums at the end
    buttonNode.localMinimumWidth = minimumWidth;
    buttonNode.localMinimumHeight = minimumHeight;

    contentProxy && contentProxy.dispose();
  }

  public override dispose(): void {
    this.buttonNode.localPreferredWidthProperty.unlink( this._updateLayoutListener );
    this.buttonNode.localPreferredHeightProperty.unlink( this._updateLayoutListener );

    super.dispose();
  }
}

sun.register( 'RectangularButton', RectangularButton );