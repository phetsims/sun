// Copyright 2016-2023, University of Colorado Boulder

/**
 * Spinner for numbers.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Andrea Lin (PhET Interactive Simulations)
 */

import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import Range from '../../dot/js/Range.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import NumberDisplay, { NumberDisplayOptions } from '../../scenery-phet/js/NumberDisplay.js';
import { Node, NodeOptions, SceneryConstants, TColor } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import AccessibleNumberSpinner, { AccessibleNumberSpinnerOptions } from './accessibility/AccessibleNumberSpinner.js';
import ArrowButton, { ArrowButtonOptions } from './buttons/ArrowButton.js';

import sun from './sun.js';
import Property from '../../axon/js/Property.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import pushButtonSoundPlayer from '../../tambo/js/shared-sound-players/pushButtonSoundPlayer.js';
import TSoundPlayer from '../../tambo/js/TSoundPlayer.js';

type NumberSpinnerArrowsPosition =
  'leftRight' | // arrow buttons on left and right of value
  'topBottom' | // arrow buttons on top and bottom of value
  'bothRight' | // both arrow buttons to the right of the value
  'bothBottom'; // both arrow buttons below the value

type SelfOptions = {

  // where to place the arrow buttons
  arrowsPosition?: NumberSpinnerArrowsPosition;

  // By default, arrows are scaled to fit dimensions of value background. This is an additional scale factor.
  arrowsScale?: number | null;
  arrowButtonFill?: TColor;
  arrowButtonStroke?: TColor;
  arrowButtonLineWidth?: number;

  arrowsSoundPlayer?: TSoundPlayer;

  // Function called when the increment button is pressed. Defaults to adding options.deltaValue.
  incrementFunction?: ( ( value: number ) => number );

  // Function called when the decrement button is pressed. Defaults to subtracting options.deltaValue.
  decrementFunction?: ( ( value: number ) => number );

  // may be ignored if incrementFunction and decrementFunction are provided
  deltaValue?: number;

  xSpacing?: number;
  ySpacing?: number;

  // NumberDisplay options
  numberDisplayOptions?: StrictOmit<NumberDisplayOptions, 'tandem'>;

  // arrow button pointer areas
  touchAreaXDilation?: number;
  touchAreaYDilation?: number;
  mouseAreaXDilation?: number;
  mouseAreaYDilation?: number;
};
type ParentOptions = AccessibleNumberSpinnerOptions & NodeOptions;
export type NumberSpinnerOptions = SelfOptions &
  StrictOmit<ParentOptions, 'children' | 'valueProperty' | 'enabledRangeProperty'>;

export default class NumberSpinner extends AccessibleNumberSpinner( Node, 0 ) {

  private readonly numberDisplay: NumberDisplay;
  private readonly disposeNumberSpinner: () => void;

  /**
   * @param numberProperty - value, must be an integer
   * @param rangeProperty - dynamic range of values, min and max must be integers
   * @param [providedOptions]
   */
  public constructor( numberProperty: Property<number>, rangeProperty: TReadOnlyProperty<Range>, providedOptions?: NumberSpinnerOptions ) {

    assert && assert( rangeProperty.value.contains( numberProperty.get() ),
      `value ${numberProperty.get()} is out of range ${rangeProperty.value.toString()}` );

    const options = optionize<NumberSpinnerOptions,
      StrictOmit<SelfOptions, 'incrementFunction' | 'decrementFunction'>,
      ParentOptions>()( {

      // SelfOptions
      arrowsSoundPlayer: pushButtonSoundPlayer,
      arrowsPosition: 'bothRight',
      arrowsScale: null,
      arrowButtonFill: 'white',
      arrowButtonStroke: 'black',
      arrowButtonLineWidth: 1,
      deltaValue: 1,
      xSpacing: 5,
      ySpacing: 3,
      numberDisplayOptions: {
        cornerRadius: 5,
        backgroundStroke: 'black'
      },
      touchAreaXDilation: 0,
      touchAreaYDilation: 0,
      mouseAreaXDilation: 0,
      mouseAreaYDilation: 0,

      // AccessibleNumberSpinnerOptions
      valueProperty: numberProperty,
      enabledRangeProperty: rangeProperty,
      disabledOpacity: SceneryConstants.DISABLED_OPACITY,

      // The focus highlight surrounds the entire component, but the spinner display is not interactive with
      // mouse and touch events so this highlight is hidden. Instead, default highlights surround the arrow buttons.
      interactiveHighlight: 'invisible',

      // PhET-iO
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'Spinner',
      phetioEnabledPropertyInstrumented: true // opt into default PhET-iO instrumented enabledProperty
    }, providedOptions );

    // Defaults for incrementFunction and decrementFunction
    const incrementFunction = options.incrementFunction || ( ( value: number ) => value + options.deltaValue );
    const decrementFunction = options.decrementFunction || ( ( value: number ) => value - options.deltaValue );

    const numberDisplay = new NumberDisplay( numberProperty, rangeProperty.value,
      combineOptions<NumberDisplayOptions>( {
        tandem: options.tandem.createTandem( 'numberDisplay' )
      }, options.numberDisplayOptions ) );

    // buttons
    const arrowButtonOptions: ArrowButtonOptions = {
      baseColor: options.arrowButtonFill,
      stroke: options.arrowButtonStroke,
      lineWidth: options.arrowButtonLineWidth,
      focusable: false,
      soundPlayer: options.arrowsSoundPlayer,

      // as requested in https://github.com/phetsims/sun/issues/575
      enabledPropertyOptions: {
        phetioReadOnly: true,
        phetioFeatured: false
      }
    };

    // increment button
    const incrementButton = new ArrowButton(
      ( options.arrowsPosition === 'topBottom' || options.arrowsPosition === 'bothRight' ) ? 'up' : 'right',
      () => numberProperty.set( incrementFunction( numberProperty.get() ) ),
      combineOptions<ArrowButtonOptions>( {
        tandem: options.tandem.createTandem( 'incrementButton' )
      }, arrowButtonOptions )
    );

    // decrement button
    const decrementButton = new ArrowButton(
      ( options.arrowsPosition === 'topBottom' || options.arrowsPosition === 'bothRight' ) ? 'down' : 'left',
      () => numberProperty.set( decrementFunction( numberProperty.get() ) ),
      combineOptions<ArrowButtonOptions>( {
        tandem: options.tandem.createTandem( 'decrementButton' )
      }, arrowButtonOptions )
    );

    // arrow button scaling
    let arrowsScale;
    if ( !arrowsScale ) {
      if ( options.arrowsPosition === 'leftRight' ) {
        arrowsScale = numberDisplay.height / incrementButton.height;
      }
      else if ( options.arrowsPosition === 'topBottom' ) {
        arrowsScale = numberDisplay.width / incrementButton.width;
      }
      else if ( options.arrowsPosition === 'bothRight' ) {
        arrowsScale = ( ( numberDisplay.height / 2 ) - ( options.ySpacing / 2 ) ) / incrementButton.height;
      }
      else { // 'bothBottom'
        arrowsScale = ( ( numberDisplay.width / 2 ) - ( options.xSpacing / 2 ) ) / incrementButton.width;
      }
    }
    if ( options.arrowsScale ) {
      arrowsScale = arrowsScale * options.arrowsScale;
    }
    incrementButton.setScaleMagnitude( arrowsScale );
    decrementButton.setScaleMagnitude( arrowsScale );

    // Because range may change via rangeProperty, the size of numberDisplay may change, in which case layout will need
    // to be revised. See https://github.com/phetsims/sun/issues/709
    const updateLayout = () => {
      if ( options.arrowsPosition === 'leftRight' ) {
        incrementButton.left = numberDisplay.right + options.xSpacing;
        decrementButton.right = numberDisplay.left - options.xSpacing;
        incrementButton.centerY = decrementButton.centerY = numberDisplay.centerY;
      }
      else if ( options.arrowsPosition === 'topBottom' ) {
        incrementButton.centerX = decrementButton.centerX = numberDisplay.centerX;
        incrementButton.bottom = numberDisplay.top - options.ySpacing;
        decrementButton.top = numberDisplay.bottom + options.ySpacing;
      }
      else if ( options.arrowsPosition === 'bothRight' ) {
        incrementButton.left = decrementButton.left = numberDisplay.right + options.xSpacing;
        incrementButton.bottom = numberDisplay.centerY - ( options.ySpacing / 2 );
        decrementButton.top = numberDisplay.centerY + ( options.ySpacing / 2 );
      }
      else { // 'bothBottom'
        incrementButton.left = numberDisplay.centerX + ( options.xSpacing / 2 );
        decrementButton.right = numberDisplay.centerX - ( options.xSpacing / 2 );
        incrementButton.top = decrementButton.top = numberDisplay.bottom + options.ySpacing;
      }
    };
    numberDisplay.boundsProperty.link( () => updateLayout() );

    // touch areas
    if ( options.touchAreaXDilation || options.touchAreaYDilation ) {

      incrementButton.touchArea = incrementButton.localBounds.dilatedXY( options.touchAreaXDilation, options.touchAreaYDilation );
      decrementButton.touchArea = decrementButton.localBounds.dilatedXY( options.touchAreaXDilation, options.touchAreaYDilation );

      // shift touch areas for these options, to prevent overlap
      if ( options.arrowsPosition === 'bothRight' ) {
        incrementButton.touchArea = incrementButton.touchArea.shiftedY( -options.touchAreaYDilation );
        decrementButton.touchArea = decrementButton.touchArea.shiftedY( options.touchAreaYDilation );
      }
      else if ( options.arrowsPosition === 'bothBottom' ) {
        incrementButton.touchArea = incrementButton.touchArea.shiftedX( options.touchAreaXDilation );
        decrementButton.touchArea = decrementButton.touchArea.shiftedX( -options.touchAreaXDilation );
      }
    }

    // mouse areas
    if ( options.mouseAreaXDilation || options.mouseAreaYDilation ) {

      incrementButton.mouseArea = incrementButton.localBounds.dilatedXY( options.mouseAreaXDilation, options.mouseAreaYDilation );
      decrementButton.mouseArea = decrementButton.localBounds.dilatedXY( options.mouseAreaXDilation, options.mouseAreaYDilation );

      // shift touch areas for these options, to prevent overlap
      if ( options.arrowsPosition === 'bothRight' ) {
        incrementButton.mouseArea = incrementButton.mouseArea.shiftedY( -options.mouseAreaYDilation );
        decrementButton.mouseArea = decrementButton.mouseArea.shiftedY( options.mouseAreaYDilation );
      }
      else if ( options.arrowsPosition === 'bothBottom' ) {
        incrementButton.mouseArea = incrementButton.mouseArea.shiftedX( options.mouseAreaXDilation );
        decrementButton.mouseArea = decrementButton.mouseArea.shiftedX( -options.mouseAreaXDilation );
      }
    }

    options.children = [ numberDisplay, incrementButton, decrementButton ];

    // pdom - NumberSpinner uses AccessibleValueHandler for accessibility, but it was decided that keyboardStep
    // and shiftKeyboardStep should have the same behavior as the NumberSpinner ArrowButtons AND the ArrowButtons
    // should look depressed when interacting with those keys. To accomplish this we actually press the ArrowButtons
    // in response to input with those keys. keyboardStep and shiftKeyboardStep are set to zero so the value isn't
    // modified again by AccessibleValueHandler.
    assert && assert( options.keyboardStep === undefined, 'NumberSpinner sets keyboardStep, it will be the same as deltaValue' );
    assert && assert( options.shiftKeyboardStep === undefined, 'NumberSpinner sets shiftKeyboardStep, it will be the same as deltaValue' );
    assert && assert( options.pageKeyboardStep === undefined, 'NumberSpinner sets pageKeyboardStep, it should not be used with NumberSpinner' );
    options.keyboardStep = 0;
    options.shiftKeyboardStep = 0;
    options.pageKeyboardStep = 0;

    // Call super without the options that require valid bounds. Call mutate later with those options.
    const boundsRequiredOptionKeys = _.pick( options, Node.REQUIRES_BOUNDS_OPTION_KEYS );
    super( _.omit( options, Node.REQUIRES_BOUNDS_OPTION_KEYS ) );

    // enable/disable arrow buttons
    const updateEnabled = () => {
      incrementButton.enabled = ( incrementFunction( numberProperty.value ) <= rangeProperty.value.max );
      decrementButton.enabled = ( decrementFunction( numberProperty.value ) >= rangeProperty.value.min );
    };

    // synchronize with number value
    const numberPropertyObserver = ( value: number ) => {
      assert && assert( rangeProperty.value.contains( value ), `value out of range: ${value}` );
      updateEnabled();
    };
    numberProperty.link( numberPropertyObserver ); // must be unlinked in dispose

    // Dynamic range changes, see https://github.com/phetsims/scenery-phet/issues/305
    const rangeObserver = ( range: Range ) => {

      // If our value is outside our new range, adjust it to be within the range.
      numberProperty.value = range.constrainValue( numberProperty.value );

      // Range changes may change whether the buttons are enabled
      updateEnabled();
    };
    rangeProperty.link( rangeObserver );

    // pdom - click arrow buttons on press of arrow keys so that the Property value changes by deltaValue
    // and the buttons look depressed
    const increasedListener = ( isDown: boolean ) => ( isDown && incrementButton.pdomClick() );
    const decreasedListener = ( isDown: boolean ) => ( isDown && decrementButton.pdomClick() );
    this.incrementDownEmitter.addListener( increasedListener );
    this.decrementDownEmitter.addListener( decreasedListener );

    this.disposeNumberSpinner = () => {

      // dispose of subcomponents
      numberDisplay.dispose();
      incrementButton.dispose();
      decrementButton.dispose();

      // dispose a11y features
      this.incrementDownEmitter.removeListener( increasedListener );
      this.decrementDownEmitter.removeListener( decreasedListener );

      numberProperty.unlink( numberPropertyObserver );
      rangeProperty.unlink( rangeObserver );
    };

    this.mutate( boundsRequiredOptionKeys );

    this.numberDisplay = numberDisplay;

    // Create a link to associated Property, so it's easier to find in Studio. Must be after instrumentation
    this.addLinkedElement( numberProperty, {
      tandem: options.tandem.createTandem( 'property' )
    } );

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'NumberSpinner', this );
  }

  public override dispose(): void {
    this.disposeNumberSpinner();
    super.dispose();
  }

  /**
   * Sets the numberFormatter for the NumberDisplay.
   */
  public setNumberFormatter( numberFormatter: ( n: number ) => string ): void {
    this.numberDisplay.setNumberFormatter( numberFormatter );
  }

}

sun.register( 'NumberSpinner', NumberSpinner );