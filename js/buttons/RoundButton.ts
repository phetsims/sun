// Copyright 2014-2024, University of Colorado Boulder

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
import { Circle, Color, isHeightSizable, isWidthSizable, LayoutConstraint, Node, PaintableNode, PaintColorProperty, RadialGradient, TPaint } from '../../../scenery/js/imports.js';
import sun from '../sun.js';
import ButtonInteractionState from './ButtonInteractionState.js';
import ButtonModel from './ButtonModel.js';
import ButtonNode, { ButtonNodeOptions, ExternalButtonNodeOptions } from './ButtonNode.js';
import RadioButtonInteractionState from './RadioButtonInteractionState.js';
import TButtonAppearanceStrategy, { TButtonAppearanceStrategyOptions } from './TButtonAppearanceStrategy.js';
import TinyProperty from '../../../axon/js/TinyProperty.js';
import Dimension2 from '../../../dot/js/Dimension2.js';

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

  private readonly buttonNodeConstraint: RoundButtonNodeConstraint;

  protected constructor( buttonModel: ButtonModel,
                         interactionStateProperty: TReadOnlyProperty<ButtonInteractionState>,
                         providedOptions?: RoundButtonOptions ) {

    let options = optionize<RoundButtonOptions, SelfOptions, ButtonNodeOptions>()( {

      // Round buttons default to not being sizable. You can set them to sizable in up to ONE dimension, where they will
      // take their size (radius) from that dimension.
      sizable: false,

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

      aspectRatio: 1, // This will keep the minimum width and height the same, so our bounding box will be square

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
    }

    // If no options were explicitly passed in for the button appearance strategy, pass through the general appearance
    // options.
    if ( !options.buttonAppearanceStrategyOptions ) {
      options.buttonAppearanceStrategyOptions = {
        stroke: options.stroke,
        lineWidth: options.lineWidth
      };
    }

    // TODO: get this to work dynamically? Or do we always want things scaled down?
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
    const buttonBackground = new Circle( 1 );

    const boundsRequiredOptionKeys = _.pick( options, Node.REQUIRES_BOUNDS_OPTION_KEYS );
    options = _.omit( options, Node.REQUIRES_BOUNDS_OPTION_KEYS ) as typeof options;

    super( buttonModel, buttonBackground, interactionStateProperty, options );


    this.buttonNodeConstraint = new RoundButtonNodeConstraint( this, this.layoutSizeProperty, {
      content: options.content ?? null,
      radius: options.radius,
      buttonBackground: buttonBackground,
      xMargin: options.xMargin,
      yMargin: options.yMargin,
      maxLineWidth: this.maxLineWidth,
      aspectRatio: options.aspectRatio,
      touchAreaDilation: options.touchAreaDilation,
      touchAreaXShift: options.touchAreaXShift,
      touchAreaYShift: options.touchAreaYShift,
      mouseAreaDilation: options.mouseAreaDilation,
      mouseAreaXShift: options.mouseAreaXShift,
      mouseAreaYShift: options.mouseAreaYShift
    } );
    this.disposeEmitter.addListener( () => this.buttonNodeConstraint.dispose() );

    this.mutate( boundsRequiredOptionKeys );
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

    // Create and add the overlay that is used to add shading.
    const shadowNode = new Circle( 1, {
      stroke: !options.stroke ? baseDarker4Property : options.stroke,
      lineWidth: options.lineWidth,
      pickable: false
    } );
    buttonBackground.addChild( shadowNode );

    this.maxLineWidth = shadowNode.hasStroke() && options && typeof options.lineWidth === 'number' ? options.lineWidth : 0;

    let interactionStateListener: ( interactionState: ButtonInteractionState ) => void;

    // We'll need to listen to the shape changes in order to update our appearance.
    const listener = () => {
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

      shadowNode.radius = buttonRadius;

      // Cache gradients
      buttonBackground.cachedPaints = [ upFillHighlight, overFillHighlight, pressedFill ];
      shadowNode.cachedPaints = [ upFillShadow, overFillShadow ];

      interactionStateListener && interactionStateProperty.unlink( interactionStateListener );

      // Change colors to match interactionState
      interactionStateListener = ( interactionState: ButtonInteractionState ) => {
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
      };
      interactionStateProperty.link( interactionStateListener );
    };
    buttonBackground.selfBoundsProperty.link( listener );

    this.disposeThreeDAppearanceStrategy = () => {
      buttonBackground.selfBoundsProperty.unlink( listener );
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

type RoundButtonNodeConstraintOptions = {
  content: Node | null;
  radius: number | null;
  buttonBackground: Circle;
  xMargin: number;
  yMargin: number;
  maxLineWidth: number;
  aspectRatio: number | null;
  touchAreaDilation: number;
  touchAreaXShift: number;
  touchAreaYShift: number;
  mouseAreaDilation: number;
  mouseAreaXShift: number;
  mouseAreaYShift: number;
};

class RoundButtonNodeConstraint extends LayoutConstraint {

  private readonly content: Node | null;
  private readonly radius: number | null;
  private readonly buttonBackground: Circle;
  private readonly xMargin: number;
  private readonly yMargin: number;
  private readonly maxLineWidth: number;
  private readonly aspectRatio: number | null;
  private readonly touchAreaDilation: number;
  private readonly touchAreaXShift: number;
  private readonly touchAreaYShift: number;
  private readonly mouseAreaDilation: number;
  private readonly mouseAreaXShift: number;
  private readonly mouseAreaYShift: number;
  private isFirstLayout = true;

  // Stored so that we can prevent updates if we're not marked sizable in a certain direction
  private lastLocalWidth = 0;
  private lastLocalHeight = 0;

  public constructor(
    public readonly buttonNode: ButtonNode,
    public readonly layoutSizeProperty: TinyProperty<Dimension2>,
    options: RoundButtonNodeConstraintOptions
  ) {

    super( buttonNode );

    // Save everything, so we can run things in the layout method
    // TODO: clean up this and use options
    this.buttonNode = buttonNode;
    this.content = options.content;
    this.radius = options.radius;
    this.buttonBackground = options.buttonBackground;
    this.xMargin = options.xMargin;
    this.yMargin = options.yMargin;
    this.maxLineWidth = options.maxLineWidth;
    this.aspectRatio = options.aspectRatio;
    this.touchAreaDilation = options.touchAreaDilation;
    this.touchAreaXShift = options.touchAreaXShift;
    this.touchAreaYShift = options.touchAreaYShift;
    this.mouseAreaDilation = options.mouseAreaDilation;
    this.mouseAreaXShift = options.mouseAreaXShift;
    this.mouseAreaYShift = options.mouseAreaYShift;

    this.buttonNode.localPreferredWidthProperty.lazyLink( this._updateLayoutListener );
    this.buttonNode.localPreferredHeightProperty.lazyLink( this._updateLayoutListener );

    if ( this.content ) {
      this.addNode( this.content, false );
    }

    this.layout();
  }

  protected override layout(): void {
    super.layout();

    const buttonNode = this.buttonNode;
    const content = this.content;

    // TODO: add infinite loop protection with equalsEpsilon

    const widthSizable = buttonNode.widthSizable;
    const heightSizable = buttonNode.heightSizable;
    const contentWidthSizable = !!content && isWidthSizable( content );
    const contentHeightSizable = !!content && isHeightSizable( content );

    const contentMinimumWidthWithMargins = content ? ( contentWidthSizable ? content.minimumWidth ?? 0 : content.width ) + this.xMargin * 2 : 0;
    const contentMinimumHeightWithMargins = content ? ( contentHeightSizable ? content.minimumHeight ?? 0 : content.height ) + this.yMargin * 2 : 0;

    let contentMinimumRadius = Math.max( contentMinimumWidthWithMargins, contentMinimumHeightWithMargins ) / 2;

    if ( this.radius !== null ) {
      contentMinimumRadius = Math.max( this.radius, contentMinimumRadius );
    }

    // Only allow an initial update if we are not sizable in that dimension
    let minimumWidth =
      ( this.isFirstLayout || widthSizable )
      ? 2 * contentMinimumRadius + this.maxLineWidth
      : buttonNode.localMinimumWidth!;
    let minimumHeight = ( this.isFirstLayout || heightSizable )
      ? 2 * contentMinimumRadius + this.maxLineWidth
      : buttonNode.localMinimumHeight!;

    assert && assert( this.aspectRatio === 1 );

    // Our resulting sizes (allow setting preferred width/height on the buttonNode)
    this.lastLocalWidth = this.isFirstLayout || widthSizable
      ? Math.max( minimumWidth, widthSizable ? buttonNode.localPreferredWidth ?? 0 : 0 )
      : this.lastLocalWidth;
    this.lastLocalHeight = this.isFirstLayout || heightSizable
      ? Math.max( minimumHeight, heightSizable ? buttonNode.localPreferredHeight ?? 0 : 0 )
      : this.lastLocalHeight;

    const actualSize = Math.max( this.lastLocalWidth, this.lastLocalHeight );

    assert && assert( !widthSizable || !heightSizable, 'RoundButton should not be sizable in both dimensions' );

    // If we have a single sizable direction, we will adjust the minimum width of the OTHER direction to match.
    // This does not work if both dimensions are sizable, because it will run into conflicts.
    if ( !widthSizable && heightSizable ) {
      minimumWidth = actualSize;
    }
    if ( !heightSizable && widthSizable ) {
      minimumHeight = actualSize;
    }

    if ( this.isFirstLayout || widthSizable || heightSizable ) {
      const preferredRadius = ( actualSize - this.maxLineWidth ) / 2;

      this.buttonBackground.radius = preferredRadius;
    }

    if ( this.isFirstLayout || widthSizable || heightSizable ) {
        // Get the actual button radius after calling super, so that buttonAppearanceStrategy has applied the stroke.
        // This accounts for stroke + lineWidth, which is important when setting pointer areas and focus highlight.
        // See https://github.com/phetsims/sun/issues/660
        const buttonBackgroundRadius = this.buttonBackground.localBounds.width / 2;

        // Set pointer areas.
        this.buttonNode.touchArea = Shape.circle( this.touchAreaXShift, this.touchAreaYShift,
          buttonBackgroundRadius + this.touchAreaDilation );
        this.buttonNode.mouseArea = Shape.circle( this.mouseAreaXShift, this.mouseAreaYShift,
          buttonBackgroundRadius + this.mouseAreaDilation );

        // pdom - focus highlight is circular for round buttons, with a little bit of padding
        // between button shape and inner edge of highlight
        this.buttonNode.focusHighlight = Shape.circle( 0, 0, buttonBackgroundRadius + 5 );
    }

    this.isFirstLayout = false;

    this.layoutSizeProperty.value = new Dimension2( this.lastLocalWidth, this.lastLocalHeight );

    // Set minimums at the end
    buttonNode.localMinimumWidth = minimumWidth;
    buttonNode.localMinimumHeight = minimumHeight;
  }

  public override dispose(): void {
    this.buttonNode.localPreferredWidthProperty.unlink( this._updateLayoutListener );
    this.buttonNode.localPreferredHeightProperty.unlink( this._updateLayoutListener );

    super.dispose();
  }
}

sun.register( 'RoundButton', RoundButton );