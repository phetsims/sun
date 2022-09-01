// Copyright 2014-2022, University of Colorado Boulder

/**
 * RoundButton is the base class for round buttons.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import { Shape } from '../../../kite/js/imports.js';
import optionize from '../../../phet-core/js/optionize.js';
import { Circle, Color, Node, PaintableNode, PaintColorProperty, RadialGradient, TPaint } from '../../../scenery/js/imports.js';
import sun from '../sun.js';
import ButtonInteractionState from './ButtonInteractionState.js';
import ButtonModel from './ButtonModel.js';
import ButtonNode, { ButtonNodeOptions, ExternalButtonNodeOptions } from './ButtonNode.js';
import RadioButtonInteractionState from './RadioButtonInteractionState.js';
import TButtonAppearanceStrategy, { TButtonAppearanceStrategyOptions } from './TButtonAppearanceStrategy.js';

// constants
const HIGHLIGHT_GRADIENT_LENGTH = 5; // In screen coords, which are roughly pixels.

type SelfOptions = {

  radius?: number | null;
  lineWidth?: number;
  stroke?: TPaint | null; // when null, a stroke will be derived from the base color

  // pointer area dilation
  touchAreaDilation?: number; // radius dilation for touch area
  mouseAreaDilation?: number; // radius dilation for mouse area

  // pointer area shift
  touchAreaXShift?: number;
  touchAreaYShift?: number;
  mouseAreaXShift?: number;
  mouseAreaYShift?: number;
};

export type RoundButtonOptions = SelfOptions & ExternalButtonNodeOptions;

export default class RoundButton extends ButtonNode {

  public static ThreeDAppearanceStrategy: TButtonAppearanceStrategy;

  protected constructor( buttonModel: ButtonModel,
                         interactionStateProperty: TReadOnlyProperty<ButtonInteractionState>,
                         providedOptions?: RoundButtonOptions ) {

    const options = optionize<RoundButtonOptions, SelfOptions, ButtonNodeOptions>()( {

      // SelfOptions
      radius: ( providedOptions && providedOptions.content ) ? null : 30,
      lineWidth: 0.5, // Only meaningful if stroke is non-null
      stroke: null,
      touchAreaDilation: 0,
      mouseAreaDilation: 0,
      touchAreaXShift: 0,
      touchAreaYShift: 0,
      mouseAreaXShift: 0,
      mouseAreaYShift: 0,

      // ButtonNodeOptions
      cursor: 'pointer',

      // If these are not the same, the larger one will be used to calculate the size of the button
      xMargin: 5, // Minimum margin in x direction, i.e. on left and right
      yMargin: 5, // Minimum margin in y direction, i.e. on top and bottom

      // Class that determines the button's appearance for the values of interactionStateProperty.
      // See RoundButton.ThreeDAppearanceStrategy for an example of the interface required.
      buttonAppearanceStrategy: RoundButton.ThreeDAppearanceStrategy
    }, providedOptions );

    if ( !options.content ) {
      assert && assert( typeof options.radius === 'number', `invalid radius: ${options.radius}` );
    }

    if ( options.radius ) {
      assert && assert( options.xMargin < options.radius, 'xMargin cannot be larger than radius' );
      assert && assert( options.yMargin < options.radius, 'yMargin cannot be larger than radius' );

      options.minUnstrokedWidth = options.radius * 2;
      options.minUnstrokedHeight = options.radius * 2;
    }

    // If no options were explicitly passed in for the button appearance strategy, pass through the general appearance
    // options.
    if ( !options.buttonAppearanceStrategyOptions ) {
      options.buttonAppearanceStrategyOptions = {
        stroke: options.stroke,
        lineWidth: options.lineWidth
      };
    }

    // Compute the radius of the button. radius will not be falsey if content is also falsey
    const buttonRadius = options.radius ||
                         Math.max( options.content!.width + options.xMargin * 2, options.content!.height + options.yMargin * 2 ) / 2;

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
    const buttonBackground = new Circle( buttonRadius );

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
export class ThreeDAppearanceStrategy {

  public readonly maxLineWidth: number;

  private readonly disposeThreeDAppearanceStrategy: () => void;

  /**
   * @param buttonBackground - the Node for the button's background, sans content
   * @param interactionStateProperty
   * @param baseColorProperty
   * @param [providedOptions]
   */
  public constructor( buttonBackground: PaintableNode,
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
                             0.3;

    const options = optionize<TButtonAppearanceStrategyOptions>()( {
      stroke: defaultStroke,
      lineWidth: defaultLineWidth,
      overStroke: defaultStroke,
      overLineWidth: defaultLineWidth,
      overButtonOpacity: 1,
      selectedStroke: defaultStroke,
      selectedLineWidth: defaultLineWidth,
      selectedButtonOpacity: 1,
      deselectedStroke: defaultStroke,
      deselectedLineWidth: defaultLineWidth,
      deselectedButtonOpacity: 1,

      overFill: baseColorProperty
    }, providedOptions );

    // Dynamic colors
    const baseBrighter8Property = new PaintColorProperty( baseColorProperty, { luminanceFactor: 0.8 } );
    const baseBrighter7Property = new PaintColorProperty( baseColorProperty, { luminanceFactor: 0.7 } );
    const baseBrighter3Property = new PaintColorProperty( baseColorProperty, { luminanceFactor: 0.3 } );
    const baseDarker1Property = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.1 } );
    const baseDarker2Property = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.2 } );
    const baseDarker4Property = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.4 } );
    const baseDarker5Property = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.5 } );
    const baseTransparentProperty = new DerivedProperty( [ baseColorProperty ], color => color.withAlpha( 0 ) );

    // Set up variables needed to create the various gradient fills and otherwise modify the appearance
    const buttonRadius = buttonBackground.width / 2;
    const innerGradientRadius = buttonRadius - HIGHLIGHT_GRADIENT_LENGTH / 2;
    const outerGradientRadius = buttonRadius + HIGHLIGHT_GRADIENT_LENGTH / 2;
    const gradientOffset = HIGHLIGHT_GRADIENT_LENGTH / 2;

    const upFillHighlight = new RadialGradient( gradientOffset, gradientOffset, innerGradientRadius, gradientOffset, gradientOffset, outerGradientRadius )
      .addColorStop( 0, baseColorProperty )
      .addColorStop( 1, baseBrighter7Property );

    const upFillShadow = new RadialGradient( -gradientOffset, -gradientOffset, innerGradientRadius, -gradientOffset, -gradientOffset, outerGradientRadius )
      .addColorStop( 0, baseTransparentProperty )
      .addColorStop( 1, baseDarker5Property );

    const overFillHighlight = new RadialGradient( gradientOffset, gradientOffset, innerGradientRadius, gradientOffset, gradientOffset, outerGradientRadius )
      .addColorStop( 0, baseBrighter3Property )
      .addColorStop( 1, baseBrighter8Property );

    const overFillShadow = new RadialGradient( -gradientOffset, -gradientOffset, innerGradientRadius, -gradientOffset, -gradientOffset, outerGradientRadius )
      .addColorStop( 0, baseTransparentProperty )
      .addColorStop( 1, baseDarker5Property );

    const pressedFill = new RadialGradient( -gradientOffset, -gradientOffset, 0, 0, 0, outerGradientRadius )
      .addColorStop( 0, baseDarker1Property )
      .addColorStop( 0.6, baseDarker2Property )
      .addColorStop( 0.8, baseColorProperty )
      .addColorStop( 1, baseBrighter8Property );

    // Create and add the overlay that is used to add shading.
    const shadowNode = new Circle( buttonRadius, {
      stroke: !options.stroke ? baseDarker4Property : options.stroke,
      lineWidth: options.lineWidth,
      pickable: false
    } );
    buttonBackground.addChild( shadowNode );

    this.maxLineWidth = shadowNode.hasStroke() && options && typeof options.lineWidth === 'number' ? options.lineWidth : 0;

    // Cache gradients
    buttonBackground.cachedPaints = [ upFillHighlight, overFillHighlight, pressedFill ];
    shadowNode.cachedPaints = [ upFillShadow, overFillShadow ];

    // Change colors to match interactionState
    function interactionStateListener( interactionState: ButtonInteractionState ): void {

      switch( interactionState ) {

        case ButtonInteractionState.IDLE:
          buttonBackground.fill = upFillHighlight;
          buttonBackground.stroke = options.deselectedStroke;
          buttonBackground.lineWidth = options.deselectedLineWidth;
          buttonBackground.opacity = options.deselectedButtonOpacity;
          shadowNode.fill = upFillShadow;
          shadowNode.opacity = options.deselectedButtonOpacity;
          break;

        case ButtonInteractionState.OVER:
          buttonBackground.fill = overFillHighlight;
          buttonBackground.stroke = options.overStroke;
          buttonBackground.lineWidth = options.overLineWidth;
          buttonBackground.opacity = options.overButtonOpacity;
          shadowNode.fill = overFillShadow;
          shadowNode.opacity = options.overButtonOpacity;
          break;

        case ButtonInteractionState.PRESSED:
          buttonBackground.fill = pressedFill;
          buttonBackground.stroke = options.selectedStroke;
          buttonBackground.lineWidth = options.selectedLineWidth;
          buttonBackground.opacity = options.selectedButtonOpacity;
          shadowNode.fill = overFillShadow;
          shadowNode.opacity = options.selectedButtonOpacity;
          break;

        default:
          throw new Error( `unsupported interactionState: ${interactionState}` );
      }
    }

    interactionStateProperty.link( interactionStateListener );

    this.disposeThreeDAppearanceStrategy = () => {
      if ( interactionStateProperty.hasListener( interactionStateListener ) ) {
        interactionStateProperty.unlink( interactionStateListener );
      }

      baseBrighter8Property.dispose();
      baseBrighter7Property.dispose();
      baseBrighter3Property.dispose();
      baseDarker1Property.dispose();
      baseDarker2Property.dispose();
      baseDarker4Property.dispose();
      baseDarker5Property.dispose();
      baseTransparentProperty.dispose();
    };
  }

  public dispose(): void {
    this.disposeThreeDAppearanceStrategy();
  }
}

RoundButton.ThreeDAppearanceStrategy = ThreeDAppearanceStrategy;

sun.register( 'RoundButton', RoundButton );
