// Copyright 2020-2022, University of Colorado Boulder

/**
 * ButtonNode is the base class for the sun button hierarchy.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import IProperty from '../../../axon/js/IProperty.js';
import IReadOnlyProperty from '../../../axon/js/IReadOnlyProperty.js';
import Property from '../../../axon/js/Property.js';
import merge from '../../../phet-core/js/merge.js';
import optionize from '../../../phet-core/js/optionize.js';
import { AlignBox, Brightness, Color, Contrast, Grayscale, IColor, Node, PaintableNode, PaintColorProperty, PressListener, PressListenerOptions, SceneryConstants, Voicing, VoicingOptions } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import ColorConstants from '../ColorConstants.js';
import sun from '../sun.js';
import ButtonInteractionState from './ButtonInteractionState.js';
import ButtonModel from './ButtonModel.js';
import TButtonAppearanceStrategy from './TButtonAppearanceStrategy.js';
import TContentAppearanceStrategy from './TContentAppearanceStrategy.js';

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
  xAlign?: 'left' | 'center' | 'right';
  yAlign?: 'top' | 'center' | 'bottom';

  // By default, icons are centered in the button, but icons with odd
  // shapes that are not wrapped in a normalizing parent node may need to
  // specify offsets to line things up properly
  xContentOffset?: number;
  yContentOffset?: number;

  // Options that will be passed through to the main input listener (PressListener)
  listenerOptions?: PressListenerOptions | null;

  // initial color of the button's background
  baseColor?: IColor;

  // Color when disabled
  disabledColor?: IColor;

  // default cursor
  cursor?: string;

  // Class that determines the button's appearance for the values of interactionStateProperty.
  // Constructor is {function( backgroundNode:Node, interactionStateProperty:Property, options:*)},
  // and the class has an optional dispose method.
  // See ButtonNode.FlatAppearanceStrategy for an example.
  buttonAppearanceStrategy?: TButtonAppearanceStrategy;

  // Optional class that determines the content's appearance for the values of interactionStateProperty.
  // Constructor is {function( content:Node, interactionStateProperty:Property, options:*)},
  // and the class has an optional dispose method.
  // See RectangularRadioButton.ContentAppearanceStrategy for an example.
  contentAppearanceStrategy?: TContentAppearanceStrategy | null;

  // Alter the appearance when changing the enabled of the button.
  enabledAppearanceStrategy?: EnabledAppearanceStrategy;
};

export type ButtonNodeOptions = SelfOptions & VoicingOptions;

export default class ButtonNode extends Voicing( Node, 0 ) {

  protected buttonModel: ButtonModel;
  private readonly _settableBaseColorProperty: PaintColorProperty;
  private readonly _disabledColorProperty: PaintColorProperty;
  private readonly baseColorProperty: Property<Color>;
  private readonly _pressListener: PressListener;
  private readonly disposeButtonNode: () => void;

  public static FlatAppearanceStrategy: typeof FlatAppearanceStrategy;

  /**
   * @param buttonModel
   * @param buttonBackground - the background of the button (like a circle or rectangle).
   * @param interactionStateProperty - a Property that is used to drive the visual appearance of the button
   * @param providedOptions - this type does not mutate its options, but relies on the subtype to
   */
  constructor( buttonModel: ButtonModel, buttonBackground: PaintableNode,
               interactionStateProperty: IProperty<ButtonInteractionState>, providedOptions?: ButtonNodeOptions ) {

    const options = optionize<ButtonNodeOptions, SelfOptions, VoicingOptions>()( {

      content: null,
      xMargin: 10,
      yMargin: 5,
      xAlign: 'center',
      yAlign: 'center',
      xContentOffset: 0,
      yContentOffset: 0,
      listenerOptions: null,
      baseColor: ColorConstants.LIGHT_BLUE,
      cursor: 'pointer',
      buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy,
      contentAppearanceStrategy: null,
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
      tandem: Tandem.OPTIONAL,
      visiblePropertyOptions: { phetioFeatured: true },
      phetioEnabledPropertyInstrumented: true // opt into default PhET-iO instrumented enabledProperty
    }, providedOptions );

    options.listenerOptions = merge( {
      tandem: options.tandem.createTandem( 'pressListener' )
    }, options.listenerOptions );

    assert && options.enabledProperty && assert( options.enabledProperty === buttonModel.enabledProperty,
      'if options.enabledProperty is provided, it must === buttonModel.enabledProperty' );
    options.enabledProperty = buttonModel.enabledProperty;

    super();

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
    const buttonAppearanceStrategy = new options.buttonAppearanceStrategy( buttonBackground, interactionStateProperty,
      this.baseColorProperty, options );

    // Optionally hook up the strategy that will control the content's appearance.
    let contentAppearanceStrategy: TContentAppearanceStrategy;
    if ( options.contentAppearanceStrategy && options.content ) {
      contentAppearanceStrategy = new options.contentAppearanceStrategy( options.content, interactionStateProperty, options );
    }

    let alignBox: AlignBox | null = null;
    if ( options.content ) {

      // For performance, in case content is a complicated icon or shape.
      // See https://github.com/phetsims/sun/issues/654#issuecomment-718944669
      options.content.pickable = false;

      // Align content in the button rectangle. Must be disposed since it adds listener to content bounds.
      alignBox = new AlignBox( options.content, {

        alignBounds: buttonBackground.bounds,
        xAlign: options.xAlign,
        yAlign: options.yAlign,

        // Apply offsets via margins, so that bounds of the AlignBox doesn't unnecessarily extend past the
        // buttonBackground. See https://github.com/phetsims/sun/issues/649
        leftMargin: options.xMargin + options.xContentOffset,
        rightMargin: options.xMargin - options.xContentOffset,
        topMargin: options.yMargin + options.yContentOffset,
        bottomMargin: options.yMargin - options.yContentOffset
      } );
      this.addChild( alignBox );
    }

    this.mutate( options );

    // No need to dispose because enabledProperty is disposed in Node
    this.enabledProperty.link( enabled => options.enabledAppearanceStrategy( enabled, this, buttonBackground, alignBox ) );

    this.disposeButtonNode = () => {
      alignBox && alignBox.dispose();
      buttonAppearanceStrategy.dispose && buttonAppearanceStrategy.dispose();
      contentAppearanceStrategy && contentAppearanceStrategy.dispose && contentAppearanceStrategy.dispose();
      this._pressListener.dispose();
      this.baseColorProperty.dispose();
    };
  }

  public override dispose(): void {
    this.disposeButtonNode();
    super.dispose();
  }

  /**
   * Sets the base color, which is the main background fill color used for the button.
   */
  public setBaseColor( baseColor: IColor ): void { this._settableBaseColorProperty.paint = baseColor; }

  set baseColor( baseColor: IColor ) { this.setBaseColor( baseColor ); }

  /**
   * Gets the base color for this button.
   */
  public getBaseColor(): IColor { return this._settableBaseColorProperty.paint as IColor; }

  get baseColor(): IColor { return this.getBaseColor(); }

  /**
   * Manually click the button, as it would be clicked in response to alternative input. Recommended only for
   * accessibility usages. For the most part, PDOM button functionality should be managed by PressListener, this should
   * rarely be used.
   */
  public pdomClick(): void {
    this._pressListener.click( null );
  }

  /**
   * Is the button currently firing because of accessibility input coming from the PDOM?
   */
  public isPDOMClicking(): boolean {
    return this._pressListener.pdomClickingProperty.get();
  }
}

/**
 * FlatAppearanceStrategy is a value for ButtonNode options.buttonAppearanceStrategy. It makes a
 * button look flat, i.e. no shading or highlighting, with color changes on mouseover, press, etc.
 */
export class FlatAppearanceStrategy {

  private readonly disposeFlatAppearanceStrategy: () => void;

  /*
   * @param buttonBackground - the Node for the button's background, sans content
   * @param interactionStateProperty
   * @param baseColorProperty
   * @param options
   */
  constructor( buttonBackground: PaintableNode, interactionStateProperty: IProperty<ButtonInteractionState>, baseColorProperty: IReadOnlyProperty<Color>, options?: any ) {

    // Dynamic colors
    const baseBrighter4 = new PaintColorProperty( baseColorProperty, { luminanceFactor: 0.4 } );
    const baseDarker4 = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.4 } );

    // Various fills that are used to alter the button's appearance
    const upFill = baseColorProperty;
    const overFill = baseBrighter4;
    const downFill = baseDarker4;

    // If the stroke wasn't provided, set a default
    buttonBackground.stroke = ( typeof ( options.stroke ) === 'undefined' ) ? baseDarker4 : options.stroke;

    // Cache colors
    buttonBackground.cachedPaints = [ upFill, overFill, downFill ];

    // Change colors to match interactionState
    function interactionStateListener( interactionState: ButtonInteractionState ) {
      switch( interactionState ) {

        case ButtonInteractionState.IDLE:
          buttonBackground.fill = upFill;
          break;

        case ButtonInteractionState.OVER:
          buttonBackground.fill = overFill;
          break;

        case ButtonInteractionState.PRESSED:
          buttonBackground.fill = downFill;
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

      baseBrighter4.dispose();
      baseDarker4.dispose();
    };
  }

  public dispose(): void {
    this.disposeFlatAppearanceStrategy();
  }
}

ButtonNode.FlatAppearanceStrategy = FlatAppearanceStrategy;

sun.register( 'ButtonNode', ButtonNode );
