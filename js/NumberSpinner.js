// Copyright 2016-2021, University of Colorado Boulder

/**
 * Spinner for numbers.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Andrea Lin (PhET Interactive Simulations)
 */

import merge from '../../phet-core/js/merge.js';
import NumberDisplay from '../../scenery-phet/js/NumberDisplay.js';
import Node from '../../scenery/js/nodes/Node.js';
import SceneryConstants from '../../scenery/js/SceneryConstants.js';
import Tandem from '../../tandem/js/Tandem.js';
import AccessibleNumberSpinner from './accessibility/AccessibleNumberSpinner.js';
import ArrowButton from './buttons/ArrowButton.js';
import sun from './sun.js';

// possible values for options.arrowsPosition
const ARROWS_POSITION_VALUES = [
  'leftRight', // arrow buttons on left and right of value
  'topBottom', // arrow buttons on top and bottom of value
  'bothRight', // both arrow buttons to the right of the value
  'bothBottom' // both arrow buttons below the value
];

class NumberSpinner extends Node {

  /**
   * @param {Property.<number>} numberProperty value, must be an integer
   * @param {Property.<Range>} rangeProperty - Dynamic range of values, min and max must be integers
   * @param {Object} [options]
   * @mixes AccessibleNumberSpinner
   */
  constructor( numberProperty, rangeProperty, options ) {

    assert && assert( rangeProperty.value.contains( numberProperty.get() ),
      `value ${numberProperty.get()} is out of range ${rangeProperty.value.toString()}` );

    options = merge( {

      // {string} where to place the arrow buttons, see ARROWS_POSITION_VALUES
      arrowsPosition: 'bothRight',

      // {number|null} By default, arrows are scaled to fit dimensions of value background. This is an additional scale factor.
      arrowsScale: null,
      arrowButtonFill: 'white',
      arrowButtonStroke: 'black',
      arrowButtonLineWidth: 1,

      // {function(number):number|null} function called when the increment button is pressed.
      // Parameter is the current value, returns the new value. Defaults to adding options.deltaValue.
      incrementFunction: null,

      // {function(number):number|null} function called when the decrement button is pressed.
      // Parameter is the current value, returns the new value. Defaults to subtracting options.deltaValue.
      decrementFunction: null,

      // may be ignored if incrementFunction and decrementFunction are provided
      deltaValue: 1,

      // {number} - opt into Node's disabled opacity when enabled:false
      disabledOpacity: SceneryConstants.DISABLED_OPACITY,
      xSpacing: 5,
      ySpacing: 3,

      // NumberDisplay options
      numberDisplayOptions: {
        cornerRadius: 5,
        backgroundStroke: 'black'
      },

      // arrow button pointer areas
      touchAreaXDilation: 0,
      touchAreaYDilation: 0,
      mouseAreaXDilation: 0,
      mouseAreaYDilation: 0,

      // PhET-iO
      tandem: Tandem.REQUIRED,
      phetioEnabledPropertyInstrumented: true // opt into default PhET-iO instrumented enabledProperty
    }, options );

    // validate options
    assert && assert( _.includes( ARROWS_POSITION_VALUES, options.arrowsPosition ), `invalid arrowsPosition: ${options.arrowsPosition}` );
    assert && assert( options.numberDisplayOptions.tandem === undefined, 'NumberSpinner sets tandem for NumberDisplay' );

    // Defaults for incrementFunction and decrementFunction
    if ( !options.incrementFunction ) {
      options.incrementFunction = value => value + options.deltaValue;
    }
    if ( !options.decrementFunction ) {
      options.decrementFunction = value => value - options.deltaValue;
    }

    const numberDisplay = new NumberDisplay( numberProperty, rangeProperty.value, merge( {},
      options.numberDisplayOptions, {
        tandem: options.tandem.createTandem( 'numberDisplay' )
      } ) );

    // buttons
    const arrowButtonOptions = {
      baseColor: options.arrowButtonFill,
      stroke: options.arrowButtonStroke,
      lineWidth: options.arrowButtonLineWidth,
      focusable: false,

      // as requested in https://github.com/phetsims/sun/issues/575
      enabledPropertyOptions: {
        phetioReadOnly: true,
        phetioFeatured: false
      }
    };

    // increment button
    const incrementDirection = ( options.arrowsPosition === 'topBottom' || options.arrowsPosition === 'bothRight' ) ? 'up' : 'right';
    const incrementButton = new ArrowButton( incrementDirection,
      () => incrementButton.enabled && numberProperty.set( options.incrementFunction( numberProperty.get() ) ),
      merge( {
        tandem: options.tandem.createTandem( 'incrementButton' )
      }, arrowButtonOptions ) );

    // decrement button
    const decrementDirection = ( options.arrowsPosition === 'topBottom' || options.arrowsPosition === 'bothRight' ) ? 'down' : 'left';
    const decrementButton = new ArrowButton( decrementDirection,
      () => decrementButton.enabled && numberProperty.set( options.decrementFunction( numberProperty.get() ) ),
      merge( {
        tandem: options.tandem.createTandem( 'decrementButton' )
      }, arrowButtonOptions ) );

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

    assert && assert( !options.children, 'decoration not supported' );
    options.children = [ numberDisplay, incrementButton, decrementButton ];

    super( options );

    // enable/disable arrow buttons
    const updateEnabled = () => {
      incrementButton.enabled = ( options.incrementFunction( numberProperty.value ) <= rangeProperty.value.max );
      decrementButton.enabled = ( options.decrementFunction( numberProperty.value ) >= rangeProperty.value.min );
    };

    // synchronize with number value
    const numberPropertyObserver = value => {
      assert && assert( rangeProperty.value.contains( value ), `value out of range: ${value}` );
      updateEnabled();
    };
    numberProperty.link( numberPropertyObserver ); // must be unlinked in dispose

    // Dynamic range changes, see https://github.com/phetsims/scenery-phet/issues/305
    const rangeObserver = range => {
      // If our value is outside our new range, adjust it to be within the range.
      numberProperty.value = range.constrainValue( numberProperty.value );

      // Range changes may change whether the buttons are enabled
      updateEnabled();
    };
    rangeProperty.link( rangeObserver );

    // pdom - NumberSpinner uses AccessibleValueHandler for accessibility, but it was decided that keyboardStep
    // and shiftKeyboardStep should have the same behavior as the NumberSpinner ArrowButtons AND the ArrowButtons
    // should look depressed when interacting with those keys. To accomplish this we actually press the ArrowButtons
    // in response to input with those keys. keyboardStep and shiftKeyboardStep are set to zero so the value isn't
    // modified again by AccessibleValueHandler.
    assert && assert( !options.keyboardStep, 'NumberSpinner sets keyboardStep, it will be the same as deltaValue' );
    assert && assert( !options.shiftKeyboardStep, 'NumberSpinner sets shiftKeyboardStep, it will be the same as deltaValue' );
    options.keyboardStep = 0;
    options.shiftKeyboardStep = 0;
    this.initializeAccessibleNumberSpinner( numberProperty, rangeProperty, this.enabledProperty, options );

    // pdom - click arrow buttons on press of arrow keys so that the Property value changes by deltaValue
    // and the buttons look depressed
    const increasedListener = function( isDown ) { isDown && incrementButton.pdomClick(); };
    const decreasedListener = function( isDown ) { isDown && decrementButton.pdomClick(); };
    this.incrementDownEmitter.addListener( increasedListener );
    this.decrementDownEmitter.addListener( decreasedListener );

    // Create a link to associated Property, so it's easier to find in Studio.
    this.addLinkedElement( numberProperty, {
      tandem: options.tandem.createTandem( 'property' )
    } );

    // @private
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
  }

  // @public Ensures that this node is eligible for GC.
  dispose() {
    this.disposeNumberSpinner();
    this.disposeAccessibleNumberSpinner();
    super.dispose();
  }
}

AccessibleNumberSpinner.mixInto( NumberSpinner );

sun.register( 'NumberSpinner', NumberSpinner );
export default NumberSpinner;