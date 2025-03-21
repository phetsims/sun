// Copyright 2022-2025, University of Colorado Boulder

/**
 * NumberPicker is a UI component for picking a number value from a range.
 * This is actually a number spinner, but PhET refers to it as a 'picker', so that's what this class is named.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Multilink from '../../axon/js/Multilink.js';
import NumberProperty from '../../axon/js/NumberProperty.js';
import Property from '../../axon/js/Property.js';
import StringUnionProperty from '../../axon/js/StringUnionProperty.js';
import type TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import Range from '../../dot/js/Range.js';
import Shape from '../../kite/js/Shape.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { combineOptions, type EmptySelfOptions } from '../../phet-core/js/optionize.js';
import type StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import MathSymbols from '../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import HighlightPath from '../../scenery/js/accessibility/HighlightPath.js';
import type SceneryEvent from '../../scenery/js/input/SceneryEvent.js';
import FireListener, { type FireListenerOptions } from '../../scenery/js/listeners/FireListener.js';
import Node, { type NodeOptions } from '../../scenery/js/nodes/Node.js';
import Path from '../../scenery/js/nodes/Path.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import Text from '../../scenery/js/nodes/Text.js';
import SceneryConstants from '../../scenery/js/SceneryConstants.js';
import Color from '../../scenery/js/util/Color.js';
import type Font from '../../scenery/js/util/Font.js';
import LinearGradient from '../../scenery/js/util/LinearGradient.js';
import PaintColorProperty from '../../scenery/js/util/PaintColorProperty.js';
import type TColor from '../../scenery/js/util/TColor.js';
import AccessibleNumberSpinner, { type AccessibleNumberSpinnerOptions } from '../../sun/js/accessibility/AccessibleNumberSpinner.js';
import sharedSoundPlayers from '../../tambo/js/sharedSoundPlayers.js';
import type TSoundPlayer from '../../tambo/js/TSoundPlayer.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import sun from './sun.js';
import { toFixed } from '../../dot/js/util/toFixed.js';

const ButtonStateValues = [ 'up', 'down', 'over', 'out' ] as const;
type ButtonState = ( typeof ButtonStateValues )[number];

type Align = 'center' | 'left' | 'right';

type SelfOptions = {
  color?: TColor; // color of arrows and top/bottom gradient on pointer over
  pressedColor?: TColor; // color of arrows and top/bottom gradient when pressed, derived if not provided
  backgroundColor?: TColor; // color of the background when pointer is not over it
  cornerRadius?: number;
  xMargin?: number;
  yMargin?: number;
  decimalPlaces?: number;
  font?: Font;
  incrementFunction?: ( value: number ) => number;
  decrementFunction?: ( value: number ) => number;
  timerDelay?: number; // start to fire continuously after pressing for this long (milliseconds)
  timerInterval?: number; // fire continuously at this frequency (milliseconds),
  noValueString?: string; // string to display if valueProperty.get is null or undefined
  align?: Align; // horizontal alignment of the value
  touchAreaXDilation?: number;
  touchAreaYDilation?: number;
  mouseAreaXDilation?: number;
  mouseAreaYDilation?: number;
  backgroundStroke?: TColor;
  backgroundLineWidth?: number;
  arrowHeight?: number;
  arrowYSpacing?: number;
  arrowStroke?: TColor;
  arrowLineWidth?: number;
  valueMaxWidth?: number | null; // If non-null, it will cap the value's maxWidth to this value

  // Use disabledOpacity, backgroundStrokeDisabledOpacity, arrowDisabledOpacity to implement 'display mode' when
  // NumberPicker is disabled. See https://github.com/phetsims/sun/issues/932.
  backgroundStrokeDisabledOpacity?: number;
  arrowDisabledOpacity?: number;

  /**
   * Converts a value to a string to be displayed in a Text node. NOTE: If this function can give different strings
   * to the same value depending on external state, it is recommended to rebuild the NumberPicker when that state
   * changes (as it uses formatValue over the initial range to determine the bounds that labels can take).
   */
  formatValue?: ( value: number ) => string;

  // Listener that is called when the NumberPicker has input on it due to user interaction.
  onInput?: ( event: SceneryEvent | null, oldValue: number ) => void;

  // Determines when the increment arrow is enabled.
  incrementEnabledFunction?: ( value: number, range: Range ) => boolean;

  // Determines when the decrement arrow is enabled.
  decrementEnabledFunction?: ( value: number, range: Range ) => boolean;

  // Opacity used to indicate disabled, [0,1] exclusive
  disabledOpacity?: number;

  // Sound generators for when the NumberPicker's value changes, and when it hits range extremities.
  // Use nullSoundPlayer to disable.
  valueChangedSoundPlayer?: TSoundPlayer;
  boundarySoundPlayer?: TSoundPlayer;
};

type ParentOptions = AccessibleNumberSpinnerOptions & NodeOptions;

export type NumberPickerOptions = SelfOptions & StrictOmit<ParentOptions, 'valueProperty' | 'enabledRangeProperty' | 'pdomTimerDelay' | 'pdomTimerInterval'>;

// options to NumberPicker.createIcon
type CreateIconOptions = {
  highlightIncrement?: boolean; // whether to highlight the increment button
  highlightDecrement?: false; // whether to highlight the decrement button
  range?: Range; // range shown on the icon
  numberPickerOptions?: NumberPickerOptions;
};

type ArrowColors = {
  up: TColor;
  over: TColor;
  down: TColor;
  out: TColor;
  disabled: TColor;
};

type BackgroundColors = {
  up: TColor;
  over: LinearGradient;
  down: LinearGradient;
  out: LinearGradient;
  disabled: TColor;
};

export default class NumberPicker extends AccessibleNumberSpinner( Node, 0 ) {

  private readonly incrementArrow: Path;
  private readonly decrementArrow: Path;
  private readonly incrementInputListener: NumberPickerInputListener;
  private readonly decrementInputListener: NumberPickerInputListener;
  private readonly disposeNumberPicker: () => void;

  /**
   * @param valueProperty
   * @param rangeProperty - If the range is anticipated to change, it's best to have the range Property contain the
   * (maximum) union of all potential changes, so that NumberPicker can iterate through all possible values and compute
   * the bounds of the labels.
   * @param [providedOptions]
   */
  public constructor( valueProperty: Property<number>, rangeProperty: TReadOnlyProperty<Range>,
                      providedOptions?: NumberPickerOptions ) {

    const options = optionize<NumberPickerOptions, StrictOmit<SelfOptions, 'pressedColor' | 'formatValue'>, ParentOptions>()( {

      // SelfOptions
      color: new Color( 0, 0, 255 ),
      backgroundColor: 'white',
      cornerRadius: 6,
      xMargin: 3,
      yMargin: 3,
      decimalPlaces: 0,
      font: new PhetFont( 24 ),
      incrementFunction: ( value: number ) => value + 1,
      decrementFunction: ( value: number ) => value - 1,
      timerDelay: 400,
      timerInterval: 100,
      noValueString: MathSymbols.NO_VALUE,
      align: 'center',
      touchAreaXDilation: 10,
      touchAreaYDilation: 10,
      mouseAreaXDilation: 0,
      mouseAreaYDilation: 5,
      backgroundStroke: 'gray',
      backgroundLineWidth: 0.5,
      backgroundStrokeDisabledOpacity: 1,
      arrowHeight: 6,
      arrowYSpacing: 3,
      arrowStroke: 'black',
      arrowLineWidth: 0.25,
      arrowDisabledOpacity: 1,
      valueMaxWidth: null,
      onInput: _.noop,
      incrementEnabledFunction: ( value: number, range: Range ) => ( value !== null && value !== undefined && value < range.max ),
      decrementEnabledFunction: ( value: number, range: Range ) => ( value !== null && value !== undefined && value > range.min ),
      disabledOpacity: SceneryConstants.DISABLED_OPACITY,
      valueChangedSoundPlayer: sharedSoundPlayers.get( 'generalSoftClick' ),
      boundarySoundPlayer: sharedSoundPlayers.get( 'generalBoundaryBoop' ),

      // ParentOptions
      cursor: 'pointer',
      valueProperty: valueProperty,
      enabledRangeProperty: rangeProperty,
      pageKeyboardStep: 2,
      voicingObjectResponse: () => valueProperty.value, // by default, just speak the value

      // phet-io
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'Picker',
      phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly,
      visiblePropertyOptions: { phetioFeatured: true },
      phetioEnabledPropertyInstrumented: true,
      phetioFeatured: true
    }, providedOptions );

    if ( !options.formatValue ) {
      options.formatValue = ( value: number ) => toFixed( value, options.decimalPlaces );
    }

    // Color of arrows and top/bottom gradient when pressed
    let colorProperty: PaintColorProperty | null = null;
    if ( options.pressedColor === undefined ) {
      colorProperty = new PaintColorProperty( options.color ); // dispose required!

      // No reference needs to be kept, since we dispose its dependency.
      options.pressedColor = new DerivedProperty( [ colorProperty ], color => color.darkerColor() );
    }

    let previousValue = valueProperty.value;

    // Overwrite the passed-in onInput listener to make sure that sound implementation can't be blown away in the
    // defaults.
    const providedOnInputListener = options.onInput;
    options.onInput = ( event: SceneryEvent | null, oldValue: number ) => {
      providedOnInputListener( event, oldValue );

      // The onInput listener may be called when no change to the value has actually happened, see
      // https://github.com/phetsims/sun/issues/760.  We do some checks here to make sure the sound is only generated
      // when a change occurs.
      if ( valueProperty.value !== previousValue ) {

        // Play the boundary sound If the value is at min or max, otherwise play the default sound.
        if ( valueProperty.value === rangeProperty.get().max || valueProperty.value === rangeProperty.get().min ) {
          options.boundarySoundPlayer.play();
        }
        else {
          options.valueChangedSoundPlayer.play();
        }
      }

      previousValue = valueProperty.value;
    };

    assert && assert( !options.keyboardStep, 'NumberPicker sets its own keyboardStep' );
    assert && assert( !options.shiftKeyboardStep, 'NumberPicker sets its own shiftKeyboardStep' );

    // AccessibleNumberSpinner options that depend on other options.
    // Initialize accessibility features. This must reach into incrementFunction to get the delta.
    // Both normal arrow and shift arrow keys use the delta computed with incrementFunction.
    const keyboardStep = options.incrementFunction( valueProperty.get() ) - valueProperty.get();
    options.keyboardStep = keyboardStep;
    options.shiftKeyboardStep = keyboardStep;
    options.pdomTimerDelay = options.timerDelay;
    options.pdomTimerInterval = options.timerInterval;

    const boundsRequiredOptionKeys = _.pick( options, Node.REQUIRES_BOUNDS_OPTION_KEYS );
    super( _.omit( options, Node.REQUIRES_BOUNDS_OPTION_KEYS ) );

    //------------------------------------------------------------
    // Properties

    const incrementButtonStateProperty = new StringUnionProperty( 'up', {
      validValues: ButtonStateValues
    } );
    const decrementButtonStateProperty = new StringUnionProperty( 'down', {
      validValues: ButtonStateValues
    } );

    // must be disposed
    const incrementEnabledProperty: TReadOnlyProperty<boolean> =
      new DerivedProperty( [ valueProperty, rangeProperty ], options.incrementEnabledFunction );

    // must be disposed
    const decrementEnabledProperty: TReadOnlyProperty<boolean> =
      new DerivedProperty( [ valueProperty, rangeProperty ], options.decrementEnabledFunction );

    //------------------------------------------------------------
    // Nodes

    // displays the value
    const valueNode = new Text( '', { font: options.font, pickable: false } );

    // compute max width of text based on the width of all possible values.
    // See https://github.com/phetsims/area-model-common/issues/5
    let currentSampleValue = rangeProperty.get().min;
    const sampleValues = [];
    while ( currentSampleValue <= rangeProperty.get().max ) {
      sampleValues.push( currentSampleValue );
      currentSampleValue = options.incrementFunction( currentSampleValue );
      assert && assert( sampleValues.length < 500000, 'Don\'t infinite loop here' );
    }
    let maxWidth = Math.max.apply( null, sampleValues.map( value => {
      valueNode.string = options.formatValue!( value );
      return valueNode.width;
    } ) );
    // Cap the maxWidth if valueMaxWidth is provided, see https://github.com/phetsims/scenery-phet/issues/297
    if ( options.valueMaxWidth !== null ) {
      maxWidth = Math.min( maxWidth, options.valueMaxWidth );
    }

    // compute shape of the background behind the numeric value
    const backgroundWidth = maxWidth + ( 2 * options.xMargin );
    const backgroundHeight = valueNode.height + ( 2 * options.yMargin );
    const backgroundOverlap = 1;
    const backgroundCornerRadius = options.cornerRadius;

    // Apply the max-width AFTER computing the backgroundHeight, so it doesn't shrink vertically
    valueNode.maxWidth = maxWidth;

    // Top half of the background. Pressing here will increment the value.
    // Shape computed starting at upper-left, going clockwise.
    const incrementBackgroundNode = new Path( new Shape()
        .arc( backgroundCornerRadius, backgroundCornerRadius, backgroundCornerRadius, Math.PI, Math.PI * 3 / 2, false )
        .arc( backgroundWidth - backgroundCornerRadius, backgroundCornerRadius, backgroundCornerRadius, -Math.PI / 2, 0, false )
        .lineTo( backgroundWidth, ( backgroundHeight / 2 ) + backgroundOverlap )
        .lineTo( 0, ( backgroundHeight / 2 ) + backgroundOverlap )
        .close(),
      { pickable: false } );

    // Bottom half of the background. Pressing here will decrement the value.
    // Shape computed starting at bottom-right, going clockwise.
    const decrementBackgroundNode = new Path( new Shape()
        .arc( backgroundWidth - backgroundCornerRadius, backgroundHeight - backgroundCornerRadius, backgroundCornerRadius, 0, Math.PI / 2, false )
        .arc( backgroundCornerRadius, backgroundHeight - backgroundCornerRadius, backgroundCornerRadius, Math.PI / 2, Math.PI, false )
        .lineTo( 0, backgroundHeight / 2 )
        .lineTo( backgroundWidth, backgroundHeight / 2 )
        .close(),
      { pickable: false } );

    // separate rectangle for stroke around value background
    const strokedBackground = new Rectangle( 0, 0, backgroundWidth, backgroundHeight, backgroundCornerRadius, backgroundCornerRadius, {
      pickable: false,
      stroke: options.backgroundStroke,
      lineWidth: options.backgroundLineWidth,
      disabledOpacity: options.backgroundStrokeDisabledOpacity,
      enabledProperty: this.enabledProperty
    } );

    // compute size of arrows
    const arrowButtonSize = new Dimension2( 0.5 * backgroundWidth, options.arrowHeight );

    const arrowOptions = {
      stroke: options.arrowStroke,
      lineWidth: options.arrowLineWidth,
      disabledOpacity: options.arrowDisabledOpacity,
      enabledProperty: this.enabledProperty,
      pickable: false
    };

    // increment arrow, pointing up, described clockwise from tip
    this.incrementArrow = new Path( new Shape()
        .moveTo( arrowButtonSize.width / 2, 0 )
        .lineTo( arrowButtonSize.width, arrowButtonSize.height )
        .lineTo( 0, arrowButtonSize.height )
        .close(),
      arrowOptions );
    this.incrementArrow.centerX = incrementBackgroundNode.centerX;
    this.incrementArrow.bottom = incrementBackgroundNode.top - options.arrowYSpacing;

    // decrement arrow, pointing down, described clockwise from the tip
    this.decrementArrow = new Path( new Shape()
        .moveTo( arrowButtonSize.width / 2, arrowButtonSize.height )
        .lineTo( 0, 0 )
        .lineTo( arrowButtonSize.width, 0 )
        .close(),
      arrowOptions );
    this.decrementArrow.centerX = decrementBackgroundNode.centerX;
    this.decrementArrow.top = decrementBackgroundNode.bottom + options.arrowYSpacing;

    // parents for increment and decrement components
    const incrementParent = new Node( { children: [ incrementBackgroundNode, this.incrementArrow ] } );
    incrementParent.addChild( new Rectangle( incrementParent.localBounds ) ); // invisible overlay
    const decrementParent = new Node( { children: [ decrementBackgroundNode, this.decrementArrow ] } );
    decrementParent.addChild( new Rectangle( decrementParent.localBounds ) ); // invisible overlay

    // rendering order
    this.addChild( incrementParent );
    this.addChild( decrementParent );
    this.addChild( strokedBackground );
    this.addChild( valueNode );

    //------------------------------------------------------------
    // Pointer areas

    // touch areas
    incrementParent.touchArea = Shape.rectangle(
      incrementParent.left - ( options.touchAreaXDilation / 2 ), incrementParent.top - options.touchAreaYDilation,
      incrementParent.width + options.touchAreaXDilation, incrementParent.height + options.touchAreaYDilation );
    decrementParent.touchArea = Shape.rectangle(
      decrementParent.left - ( options.touchAreaXDilation / 2 ), decrementParent.top,
      decrementParent.width + options.touchAreaXDilation, decrementParent.height + options.touchAreaYDilation );

    // mouse areas
    incrementParent.mouseArea = Shape.rectangle(
      incrementParent.left - ( options.mouseAreaXDilation / 2 ), incrementParent.top - options.mouseAreaYDilation,
      incrementParent.width + options.mouseAreaXDilation, incrementParent.height + options.mouseAreaYDilation );
    decrementParent.mouseArea = Shape.rectangle(
      decrementParent.left - ( options.mouseAreaXDilation / 2 ), decrementParent.top,
      decrementParent.width + options.mouseAreaXDilation, decrementParent.height + options.mouseAreaYDilation );

    //------------------------------------------------------------
    // Colors

    // arrow colors, corresponding to ButtonState and incrementEnabledProperty/decrementEnabledProperty
    const arrowColors: ArrowColors = {
      up: options.color,
      over: options.color,
      down: options.pressedColor,
      out: options.color,
      disabled: 'rgb(176,176,176)'
    };

    // background colors, corresponding to ButtonState and enabledProperty.value
    const highlightGradient = createVerticalGradient( options.color, options.backgroundColor, options.color, backgroundHeight );
    const pressedGradient = createVerticalGradient( options.pressedColor, options.backgroundColor, options.pressedColor, backgroundHeight );
    const backgroundColors: BackgroundColors = {
      up: options.backgroundColor,
      over: highlightGradient,
      down: pressedGradient,
      out: pressedGradient,
      disabled: options.backgroundColor
    };

    //------------------------------------------------------------
    // Observers and InputListeners

    const inputListenerOptions = {
      fireOnHold: true,
      fireOnHoldDelay: options.timerDelay,
      fireOnHoldInterval: options.timerInterval
    };

    this.incrementInputListener = new NumberPickerInputListener( incrementButtonStateProperty,
      combineOptions<NumberPickerInputListenerOptions>( {
        tandem: options.tandem.createTandem( 'incrementInputListener' ),
        fire: event => {
          const oldValue = valueProperty.value;
          valueProperty.set( Math.min( options.incrementFunction( valueProperty.get() ), rangeProperty.get().max ) );
          options.onInput( event, oldValue );

          // voicing - speak the object/context responses on value change from user input
          this.voicingSpeakFullResponse( { nameResponse: null, hintResponse: null } );
        }
      }, inputListenerOptions ) );
    incrementParent.addInputListener( this.incrementInputListener );

    this.decrementInputListener = new NumberPickerInputListener( decrementButtonStateProperty,
      combineOptions<NumberPickerInputListenerOptions>( {
        tandem: options.tandem.createTandem( 'decrementInputListener' ),
        fire: event => {
          const oldValue = valueProperty.value;
          valueProperty.set( Math.max( options.decrementFunction( valueProperty.get() ), rangeProperty.get().min ) );
          options.onInput( event, oldValue );

          // voicing - speak the object/context responses on value change from user input
          this.voicingSpeakFullResponse( { nameResponse: null, hintResponse: null } );
        }
      }, inputListenerOptions ) );
    decrementParent.addInputListener( this.decrementInputListener );

    // enable/disable listeners and interaction: unlink unnecessary, Properties are owned by this instance
    incrementEnabledProperty.link( enabled => {
      !enabled && this.incrementInputListener.interrupt();
      incrementParent.pickable = enabled;
    } );
    decrementEnabledProperty.link( enabled => {
      !enabled && this.decrementInputListener.interrupt();
      decrementParent.pickable = enabled;
    } );

    // Update text to match the value
    const valueObserver = ( value: number | null | undefined ) => {
      if ( value === null || value === undefined ) {
        valueNode.string = options.noValueString;
        valueNode.x = ( backgroundWidth - valueNode.width ) / 2; // horizontally centered
      }
      else {
        valueNode.string = options.formatValue!( value );
        if ( options.align === 'center' ) {
          valueNode.centerX = incrementBackgroundNode.centerX;
        }
        else if ( options.align === 'right' ) {
          valueNode.right = incrementBackgroundNode.right - options.xMargin;
        }
        else if ( options.align === 'left' ) {
          valueNode.left = incrementBackgroundNode.left + options.xMargin;
        }
        else {
          throw new Error( `unsupported value for options.align: ${options.align}` );
        }
      }
      valueNode.centerY = backgroundHeight / 2;
    };
    valueProperty.link( valueObserver ); // must be unlinked in dispose

    // Update colors for increment components.  No dispose is needed since dependencies are locally owned.
    Multilink.multilink( [ incrementButtonStateProperty, incrementEnabledProperty ], ( state, enabled ) => {
      updateColors( state, enabled, incrementBackgroundNode, this.incrementArrow, backgroundColors, arrowColors );
    } );

    // Update colors for decrement components.  No dispose is needed since dependencies are locally owned.
    Multilink.multilink( [ decrementButtonStateProperty, decrementEnabledProperty ], ( state, enabled ) => {
      updateColors( state, enabled, decrementBackgroundNode, this.decrementArrow, backgroundColors, arrowColors );
    } );

    // pdom - custom focus highlight that matches rounded background behind the numeric value
    const focusBounds = this.localBounds.dilated( HighlightPath.getDefaultDilationCoefficient() );
    this.focusHighlight = new HighlightPath( Shape.roundedRectangleWithRadii(
      focusBounds.minX,
      focusBounds.minY,
      focusBounds.width,
      focusBounds.height, {
        topLeft: options.cornerRadius,
        topRight: options.cornerRadius,
        bottomLeft: options.cornerRadius,
        bottomRight: options.cornerRadius
      } )
    );

    // update style with keyboard input, Emitters owned by this instance and disposed in AccessibleNumberSpinner
    this.pdomIncrementDownEmitter.addListener( isDown => {
      incrementButtonStateProperty.value = ( isDown ? 'down' : 'up' );
    } );
    this.pdomDecrementDownEmitter.addListener( isDown => {
      decrementButtonStateProperty.value = ( isDown ? 'down' : 'up' );
    } );

    this.addLinkedElement( valueProperty, {
      tandemName: 'valueProperty'
    } );

    // Mutate options that require bounds after we have children
    this.mutate( boundsRequiredOptionKeys );

    this.disposeNumberPicker = () => {

      colorProperty && colorProperty.dispose();
      incrementEnabledProperty.dispose();
      decrementEnabledProperty.dispose();
      this.incrementArrow.dispose();
      this.decrementArrow.dispose();
      strokedBackground.dispose();
      this.incrementInputListener.dispose();
      this.decrementInputListener.dispose();

      if ( valueProperty.hasListener( valueObserver ) ) {
        valueProperty.unlink( valueObserver );
      }
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && window.phet?.chipper?.queryParameters?.binder && InstanceRegistry.registerDataURL( 'scenery-phet', 'NumberPicker', this );
  }

  public static createIcon( value: number, providedOptions?: CreateIconOptions ): Node {

    const options = optionize<CreateIconOptions, EmptySelfOptions, CreateIconOptions>()( {

      // Highlight the increment button
      highlightIncrement: false,

      // Highlight the decrement button
      highlightDecrement: false,

      range: new Range( value - 1, value + 1 ),
      numberPickerOptions: {
        pickable: false,

        // phet-io
        tandem: Tandem.OPT_OUT // by default, icons don't need instrumentation
      }
    }, providedOptions );

    const numberPicker = new NumberPicker( new NumberProperty( value ), new Property( options.range ), options.numberPickerOptions );

    // we don't want this icon to have keyboard navigation, or description in the PDOM.
    numberPicker.removeFromPDOM();

    if ( options.highlightDecrement ) {
      numberPicker.decrementInputListener.isOverProperty.value = true;
    }
    if ( options.highlightIncrement ) {
      numberPicker.incrementInputListener.isOverProperty.value = true;
    }
    return numberPicker;
  }

  public override dispose(): void {
    this.disposeNumberPicker();
    super.dispose();
  }

  /**
   * Sets visibility of the arrows.
   */
  public setArrowsVisible( visible: boolean ): void {
    if ( !visible ) {
      this.incrementInputListener.interrupt();
      this.decrementInputListener.interrupt();
    }
    this.incrementArrow.visible = visible;
    this.decrementArrow.visible = visible;
  }
}

type NumberPickerInputListenerSelfOptions = EmptySelfOptions;
type NumberPickerInputListenerOptions = NumberPickerInputListenerSelfOptions & FireListenerOptions<FireListener>;

/**
 * Converts FireListener events to state changes.
 */
class NumberPickerInputListener extends FireListener {

  public constructor( buttonStateProperty: StringUnionProperty<ButtonState>, options: NumberPickerInputListenerOptions ) {
    super( options );

    // Update the button state.  No dispose is needed because the parent class disposes the dependencies.
    Multilink.multilink(
      [ this.isOverProperty, this.isPressedProperty ],
      ( isOver, isPressed ) => {
        buttonStateProperty.set(
          isOver && !isPressed ? 'over' :
          isOver && isPressed ? 'down' :
          !isOver && !isPressed ? 'up' :
          'out'
        );
      }
    );
  }
}

/**
 * Creates a vertical gradient.
 */
function createVerticalGradient( topColor: TColor, centerColor: TColor, bottomColor: TColor, height: number ): LinearGradient {
  return new LinearGradient( 0, 0, 0, height )
    .addColorStop( 0, topColor )
    .addColorStop( 0.5, centerColor )
    .addColorStop( 1, bottomColor );
}

/**
 * Updates arrow and background colors
 */
function updateColors( buttonState: ButtonState, enabled: boolean, backgroundNode: Path, arrowNode: Path,
                       backgroundColors: BackgroundColors, arrowColors: ArrowColors ): void {
  if ( enabled ) {
    arrowNode.stroke = 'black';
    if ( buttonState === 'up' ) {
      backgroundNode.fill = backgroundColors.up;
      arrowNode.fill = arrowColors.up;
    }
    else if ( buttonState === 'over' ) {
      backgroundNode.fill = backgroundColors.over;
      arrowNode.fill = arrowColors.over;
    }
    else if ( buttonState === 'down' ) {
      backgroundNode.fill = backgroundColors.down;
      arrowNode.fill = arrowColors.down;
    }
    else if ( buttonState === 'out' ) {
      backgroundNode.fill = backgroundColors.out;
      arrowNode.fill = arrowColors.out;
    }
    else {
      throw new Error( `unsupported buttonState: ${buttonState}` );
    }
  }
  else {
    backgroundNode.fill = backgroundColors.disabled;
    arrowNode.fill = arrowColors.disabled;
    arrowNode.stroke = arrowColors.disabled; // stroke so that arrow size will look the same when it's enabled/disabled
  }
}

sun.register( 'NumberPicker', NumberPicker );