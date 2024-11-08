// Copyright 2020-2024, University of Colorado Boulder

/**
 * ButtonNode is the base class for the sun button hierarchy.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Multilink, { UnknownMultilink } from '../../../axon/js/Multilink.js';
import TinyProperty from '../../../axon/js/TinyProperty.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import { AlignBox, AlignBoxXAlign, AlignBoxYAlign, assertNoAdditionalChildren, Brightness, Color, Contrast, Grayscale, Node, NodeOptions, PaintableNode, PaintColorProperty, Path, PressListener, PressListenerOptions, SceneryConstants, Sizable, SizableOptions, TColor, TPaint, Voicing, VoicingOptions } from '../../../scenery/js/imports.js';
import ColorConstants from '../ColorConstants.js';
import sun from '../sun.js';
import ButtonInteractionState from './ButtonInteractionState.js';
import ButtonModel from './ButtonModel.js';
import TButtonAppearanceStrategy, { TButtonAppearanceStrategyOptions } from './TButtonAppearanceStrategy.js';
import TContentAppearanceStrategy, { TContentAppearanceStrategyOptions } from './TContentAppearanceStrategy.js';

// constants
const CONTRAST_FILTER = new Contrast( 0.7 );
const BRIGHTNESS_FILTER = new Brightness( 1.2 );

// if there is content, style can be applied to a containing Node around it.
type EnabledAppearanceStrategy = ( enabled: boolean, button: Node, background: Node, content: Node | null ) => void;

type SelfOptions = {

  // what appears on the button (icon, label, etc.)
  content?: Node | null;

  // margin in x direction, i.e. on left and right
  xMargin?: number;

  // margin in y direction, i.e. on top and bottom
  yMargin?: number;

  // Alignment, relevant only when options minWidth or minHeight are greater than the size of options.content
  xAlign?: AlignBoxXAlign;
  yAlign?: AlignBoxYAlign;

  // By default, icons are centered in the button, but icons with odd
  // shapes that are not wrapped in a normalizing parent node may need to
  // specify offsets to line things up properly
  xContentOffset?: number;
  yContentOffset?: number;

  // Options that will be passed through to the main input listener (PressListener)
  listenerOptions?: PressListenerOptions;

  // initial color of the button's background
  baseColor?: TPaint;

  // Color when disabled
  disabledColor?: TPaint;

  // Class and associated options that determine the button's appearance and the changes that occur when the button is
  // pressed, hovered over, disabled, and so forth.
  buttonAppearanceStrategy?: TButtonAppearanceStrategy;
  buttonAppearanceStrategyOptions?: TButtonAppearanceStrategyOptions;

  // Class and associated options that determine how the content node looks and the changes that occur when the button
  // is pressed, hovered over, disabled, and so forth.
  contentAppearanceStrategy?: TContentAppearanceStrategy | null;
  contentAppearanceStrategyOptions?: TContentAppearanceStrategyOptions;

  // Alter the appearance when changing the enabled of the button.
  enabledAppearanceStrategy?: EnabledAppearanceStrategy;
};
type ParentOptions = SizableOptions & VoicingOptions & NodeOptions;

// Normal options, for use in optionize
export type ButtonNodeOptions = SelfOptions & ParentOptions;

export default class ButtonNode extends Sizable( Voicing( Node ) ) {

  protected buttonModel: ButtonModel;
  private readonly _settableBaseColorProperty: PaintColorProperty;
  private readonly _disabledColorProperty: PaintColorProperty;
  private readonly baseColorProperty: TReadOnlyProperty<Color>;
  private readonly _pressListener: PressListener;
  private readonly disposeButtonNode: () => void;
  protected readonly content: Node | null;
  public readonly contentContainer: Node | null = null; // (sun-only)
  protected readonly layoutSizeProperty: TinyProperty<Dimension2> = new TinyProperty<Dimension2>( new Dimension2( 0, 0 ) );

  // The maximum lineWidth our buttonBackground can have. We'll lay things out so that if we adjust our lineWidth below
  // this, the layout won't change
  protected readonly maxLineWidth: number;

  public static FlatAppearanceStrategy: TButtonAppearanceStrategy;

  /**
   * @param buttonModel
   * @param buttonBackground - the background of the button (like a circle or rectangle).
   * @param interactionStateProperty - a Property that is used to drive the visual appearance of the button
   * @param providedOptions - this type does not mutate its options, but relies on the subtype to
   */
  protected constructor( buttonModel: ButtonModel,
                         buttonBackground: Path,
                         interactionStateProperty: TReadOnlyProperty<ButtonInteractionState>,
                         providedOptions?: ButtonNodeOptions ) {

    const options = optionize<ButtonNodeOptions, StrictOmit<SelfOptions, 'listenerOptions'>, ParentOptions>()( {

      content: null,
      xMargin: 10,
      yMargin: 5,
      xAlign: 'center',
      yAlign: 'center',
      xContentOffset: 0,
      yContentOffset: 0,
      baseColor: ColorConstants.LIGHT_BLUE,
      cursor: 'pointer',
      buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy,
      buttonAppearanceStrategyOptions: {},
      contentAppearanceStrategy: null,
      contentAppearanceStrategyOptions: {},
      enabledAppearanceStrategy: ( enabled, button, background, content ) => {
        background.filters = enabled ? [] : [ CONTRAST_FILTER, BRIGHTNESS_FILTER ];

        if ( content ) {
          content.filters = enabled ? [] : [ Grayscale.FULL ];
          content.opacity = enabled ? 1 : SceneryConstants.DISABLED_OPACITY;
        }
      },
      disabledColor: ColorConstants.LIGHT_GRAY,

      // pdom
      tagName: 'button',

      // phet-io
      tandemNameSuffix: 'Button',
      visiblePropertyOptions: { phetioFeatured: true },
      phetioEnabledPropertyInstrumented: true // opt into default PhET-iO instrumented enabledProperty
    }, providedOptions );

    options.listenerOptions = combineOptions<PressListenerOptions>( {
      tandem: options.tandem?.createTandem( 'pressListener' )
    }, options.listenerOptions );

    assert && options.enabledProperty && assert( options.enabledProperty === buttonModel.enabledProperty,
      'if options.enabledProperty is provided, it must === buttonModel.enabledProperty' );
    options.enabledProperty = buttonModel.enabledProperty;

    super();

    this.content = options.content;
    this.buttonModel = buttonModel;

    this._settableBaseColorProperty = new PaintColorProperty( options.baseColor );
    this._disabledColorProperty = new PaintColorProperty( options.disabledColor );

    this.baseColorProperty = new DerivedProperty( [
      this._settableBaseColorProperty,
      this.enabledProperty,
      this._disabledColorProperty
    ], ( color, enabled, disabledColor ) => {
      return enabled ? color : disabledColor;
    } );

    this._pressListener = buttonModel.createPressListener( options.listenerOptions );
    this.addInputListener( this._pressListener );

    assert && assert( buttonBackground.fill === null, 'ButtonNode controls the fill for the buttonBackground' );
    buttonBackground.fill = this.baseColorProperty;
    this.addChild( buttonBackground );

    // Hook up the strategy that will control the button's appearance.
    const buttonAppearanceStrategy = new options.buttonAppearanceStrategy(
      buttonBackground,
      interactionStateProperty,
      this.baseColorProperty,
      options.buttonAppearanceStrategyOptions
    );

    // Optionally hook up the strategy that will control the content's appearance.
    let contentAppearanceStrategy: InstanceType<TContentAppearanceStrategy>;
    if ( options.contentAppearanceStrategy && options.content ) {
      contentAppearanceStrategy = new options.contentAppearanceStrategy(
        options.content,
        interactionStateProperty, options.contentAppearanceStrategyOptions
      );
    }

    // Get our maxLineWidth from the appearance strategy, as it's needed for layout (and in subtypes)
    this.maxLineWidth = buttonAppearanceStrategy.maxLineWidth;

    let alignBox: AlignBox | null = null;
    let updateAlignBounds: UnknownMultilink | null = null;

    if ( options.content ) {
      // Container here that can get scaled/positioned/pickable-modified, without affecting the provided content.
      this.contentContainer = new Node( {
        children: [
          options.content
        ],

        // For performance, in case content is a complicated icon or shape.
        // See https://github.com/phetsims/sun/issues/654#issuecomment-718944669
        pickable: false
      } );

      // Align content in the button rectangle. Must be disposed since it adds listener to content bounds.
      alignBox = new AlignBox( this.contentContainer, {
        xAlign: options.xAlign,
        yAlign: options.yAlign,

        // Apply offsets via margins, so that bounds of the AlignBox doesn't unnecessarily extend past the
        // buttonBackground. See https://github.com/phetsims/sun/issues/649
        leftMargin: options.xMargin + options.xContentOffset,
        rightMargin: options.xMargin - options.xContentOffset,
        topMargin: options.yMargin + options.yContentOffset,
        bottomMargin: options.yMargin - options.yContentOffset
      } );

      // Dynamically adjust alignBounds.
      updateAlignBounds = Multilink.multilink(
        [ buttonBackground.boundsProperty, this.layoutSizeProperty ],
        ( backgroundBounds, size ) => {
          if ( size.width > 0 && size.height > 0 ) {
            alignBox!.alignBounds = Bounds2.point( backgroundBounds.center ).dilatedXY( size.width / 2, size.height / 2 );
          }
        }
      );
      this.addChild( alignBox );
    }

    this.mutate( options );

    // No need to dispose because enabledProperty is disposed in Node
    this.enabledProperty.link( enabled => options.enabledAppearanceStrategy( enabled, this, buttonBackground, alignBox ) );

    // Decorating with additional content is an anti-pattern, see https://github.com/phetsims/sun/issues/860
    assert && assertNoAdditionalChildren( this );

    this.disposeButtonNode = () => {
      alignBox && alignBox.dispose();
      updateAlignBounds && updateAlignBounds.dispose();
      buttonAppearanceStrategy.dispose && buttonAppearanceStrategy.dispose();
      contentAppearanceStrategy && contentAppearanceStrategy.dispose && contentAppearanceStrategy.dispose();
      this._pressListener.dispose();
      this.baseColorProperty.dispose();
      this._settableBaseColorProperty.dispose();
      this._disabledColorProperty.dispose();
    };
  }

  public override dispose(): void {
    this.disposeButtonNode();
    super.dispose();
  }

  /**
   * Sets the base color, which is the main background fill color used for the button.
   */
  public setBaseColor( baseColor: TColor ): void { this._settableBaseColorProperty.paint = baseColor; }

  public set baseColor( baseColor: TColor ) { this.setBaseColor( baseColor ); }

  public get baseColor(): TColor { return this.getBaseColor(); }

  /**
   * Gets the base color for this button.
   */
  public getBaseColor(): TColor { return this._settableBaseColorProperty.paint as TColor; }

  /**
   * Manually click the button, as it would be clicked in response to alternative input. Recommended only for
   * accessibility usages. For the most part, PDOM button functionality should be managed by PressListener, this should
   * rarely be used.
   */
  public pdomClick(): void {
    this._pressListener.click( null );
  }
}

/**
 * FlatAppearanceStrategy is a value for ButtonNode options.buttonAppearanceStrategy. It makes a
 * button look flat, i.e. no shading or highlighting, with color changes on mouseover, press, etc.
 */
export class FlatAppearanceStrategy {

  public readonly maxLineWidth: number;

  private readonly disposeFlatAppearanceStrategy: () => void;

  /**
   * @param buttonBackground - the Node for the button's background, sans content
   * @param interactionStateProperty - interaction state, used to trigger updates
   * @param baseColorProperty - base color from which other colors are derived
   * @param [providedOptions]
   */
  public constructor( buttonBackground: PaintableNode,
                      interactionStateProperty: TReadOnlyProperty<ButtonInteractionState>,
                      baseColorProperty: TReadOnlyProperty<Color>,
                      providedOptions?: TButtonAppearanceStrategyOptions ) {

    // dynamic colors
    const baseBrighter4Property = new PaintColorProperty( baseColorProperty, { luminanceFactor: 0.4 } );
    const baseDarker4Property = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.4 } );

    // various fills that are used to alter the button's appearance
    const upFillProperty = baseColorProperty;
    const overFillProperty = baseBrighter4Property;
    const downFillProperty = baseDarker4Property;

    const options = combineOptions<TButtonAppearanceStrategyOptions>( {
      stroke: baseDarker4Property
    }, providedOptions );

    const lineWidth = typeof options.lineWidth === 'number' ? options.lineWidth : 1;

    // If the stroke wasn't provided, set a default.
    buttonBackground.stroke = options.stroke || baseDarker4Property;
    buttonBackground.lineWidth = lineWidth;

    this.maxLineWidth = buttonBackground.hasStroke() ? lineWidth : 0;

    // Cache colors
    buttonBackground.cachedPaints = [ upFillProperty, overFillProperty, downFillProperty ];

    // Change colors to match interactionState
    function interactionStateListener( interactionState: ButtonInteractionState ): void {
      switch( interactionState ) {

        case ButtonInteractionState.IDLE:
          buttonBackground.fill = upFillProperty;
          break;

        case ButtonInteractionState.OVER:
          buttonBackground.fill = overFillProperty;
          break;

        case ButtonInteractionState.PRESSED:
          buttonBackground.fill = downFillProperty;
          break;

        default:
          throw new Error( `unsupported interactionState: ${interactionState}` );
      }
    }

    // Do the initial update explicitly, then lazy link to the properties.  This keeps the number of initial updates to
    // a minimum and allows us to update some optimization flags the first time the base color is actually changed.
    interactionStateProperty.link( interactionStateListener );

    this.disposeFlatAppearanceStrategy = () => {
      if ( interactionStateProperty.hasListener( interactionStateListener ) ) {
        interactionStateProperty.unlink( interactionStateListener );
      }
      baseBrighter4Property.dispose();
      baseDarker4Property.dispose();
    };
  }

  public dispose(): void {
    this.disposeFlatAppearanceStrategy();
  }
}

ButtonNode.FlatAppearanceStrategy = FlatAppearanceStrategy;

sun.register( 'ButtonNode', ButtonNode );