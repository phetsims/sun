// Copyright 2016-2020, University of Colorado Boulder

/**
 * Spinner for numbers.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Andrea Lin (PhET Interactive Simulations)
 */

import Property from '../../axon/js/Property.js';
import Utils from '../../dot/js/Utils.js';
import merge from '../../phet-core/js/merge.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import Node from '../../scenery/js/nodes/Node.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import Text from '../../scenery/js/nodes/Text.js';
import Tandem from '../../tandem/js/Tandem.js';
import AccessibleNumberSpinner from './accessibility/AccessibleNumberSpinner.js';
import ArrowButton from './buttons/ArrowButton.js';
import sun from './sun.js';
import SunConstants from './SunConstants.js';

// possible values for options.arrowsPosition
const ARROWS_POSITION_VALUES = [
  'leftRight', // arrow buttons on left and right of value
  'topBottom', // arrow buttons on top and bottom of value
  'bothRight', // both arrow buttons to the right of the value
  'bothBottom' // both arrow buttons below the value
];

// possible values for options.valueAlign
const VALUE_ALIGN_VALUES = [ 'center', 'left', 'right' ];

class NumberSpinner extends Node {

  /**
   * @param {Property.<number>} numberProperty value, must be an integer
   * @param {Property.<Range>} rangeProperty - Dynamic range of values, min and max must be integers
   * @param {Object} [options]
   * @mixes AccessibleNumberSpinner
   */
  constructor( numberProperty, rangeProperty, options ) {

    assert && assert( rangeProperty.value.contains( numberProperty.get() ),
      'value ' + numberProperty.get() + ' is out of range ' + rangeProperty.value.toString() );

    options = merge( {
      enabledProperty: new Property( true ),

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

      valuePattern: SunConstants.VALUE_NAMED_PLACEHOLDER, // {string} must contain SunConstants.VALUE_NAMED_PLACEHOLDER
      decimalPlaces: 0,
      deltaValue: 1, // may be ignored if incrementFunction and decrementFunction are provided
      font: new PhetFont( 28 ),

      // {string} alignment for value, see VALUE_ALIGN_VALUES
      valueAlign: 'center',
      xSpacing: 5,
      ySpacing: 3,

      // background node
      xMargin: 5,
      yMargin: 3,
      cornerRadius: 5,
      backgroundMinWidth: 0,
      backgroundFill: 'white',
      backgroundStroke: 'black',
      backgroundLineWidth: 1,

      // arrow button pointer areas
      touchAreaXDilation: 0,
      touchAreaYDilation: 0,
      mouseAreaXDilation: 0,
      mouseAreaYDilation: 0,

      // PhET-iO
      tandem: Tandem.REQUIRED
    }, options );

    // validate options
    assert && assert( _.includes( ARROWS_POSITION_VALUES, options.arrowsPosition ), 'invalid arrowsPosition: ' + options.arrowsPosition );
    assert && assert( _.includes( VALUE_ALIGN_VALUES, options.valueAlign ), 'invalid valueAlign: ' + options.valueAlign );
    assert && assert( !!phet.chipper.queryParameters.stringTest ||
                      options.valuePattern.indexOf( SunConstants.VALUE_NAMED_PLACEHOLDER ) !== -1,
      'missing value placeholder in options.valuePattern: ' + options.valuePattern );

    // Defaults for incrementFunction and decrementFunction
    if ( !options.incrementFunction ) {
      options.incrementFunction = value => value + options.deltaValue;
    }
    if ( !options.decrementFunction ) {
      options.decrementFunction = value => value - options.deltaValue;
    }

    const valueOptions = {
      font: options.font,
      fill: 'black'
    };

    // compute max width of the value that's going to be displayed
    const minString = StringUtils.fillIn( options.valuePattern, {
      value: Utils.toFixed( rangeProperty.value.min, options.decimalPlaces )
    } );
    const maxString = StringUtils.fillIn( options.valuePattern, {
      value: Utils.toFixed( rangeProperty.value.max, options.decimalPlaces )
    } );
    const maxWidth = Math.max(
      new Text( minString, valueOptions ).width,
      new Text( maxString, valueOptions ).width
    );

    // number
    const numberNode = new Text( numberProperty.get(), valueOptions );

    // compute the size of the background
    const backgroundWidth = Math.max( maxWidth + 2 * options.xMargin, options.backgroundMinWidth );
    const backgroundHeight = numberNode.height + ( 2 * options.yMargin );

    // background for displaying the value
    const backgroundNode = new Rectangle( 0, 0, backgroundWidth, backgroundHeight,
      options.cornerRadius, options.cornerRadius, {
        fill: options.backgroundFill,
        stroke: options.backgroundStroke,
        lineWidth: options.backgroundLineWidth
      } );
    numberNode.center = backgroundNode.center;
    const valueParent = new Node( { children: [ backgroundNode, numberNode ] } );

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
      () => numberProperty.set( options.incrementFunction( numberProperty.get() ) ),
      merge( {
        tandem: options.tandem.createTandem( 'incrementButton' )
      }, arrowButtonOptions ) );

    // decrement button
    const decrementDirection = ( options.arrowsPosition === 'topBottom' || options.arrowsPosition === 'bothRight' ) ? 'down' : 'left';
    const decrementButton = new ArrowButton( decrementDirection,
      () => numberProperty.set( options.decrementFunction( numberProperty.get() ) ),
      merge( {
        tandem: options.tandem.createTandem( 'decrementButton' )
      }, arrowButtonOptions ) );

    // arrow button scaling
    let arrowsScale;
    if ( !arrowsScale ) {
      if ( options.arrowsPosition === 'leftRight' ) {
        arrowsScale = valueParent.height / incrementButton.height;
      }
      else if ( options.arrowsPosition === 'topBottom' ) {
        arrowsScale = valueParent.width / incrementButton.width;
      }
      else if ( options.arrowsPosition === 'bothRight' ) {
        arrowsScale = ( ( valueParent.height / 2 ) - ( options.ySpacing / 2 ) ) / incrementButton.height;
      }
      else { // 'bothBottom'
        arrowsScale = ( ( valueParent.width / 2 ) - ( options.xSpacing / 2 ) ) / incrementButton.width;
      }
    }
    if ( options.arrowsScale ) {
      arrowsScale = arrowsScale * options.arrowsScale;
    }
    incrementButton.setScaleMagnitude( arrowsScale );
    decrementButton.setScaleMagnitude( arrowsScale );

    // layout
    if ( options.arrowsPosition === 'leftRight' ) {
      incrementButton.left = valueParent.right + options.xSpacing;
      decrementButton.right = valueParent.left - options.xSpacing;
      incrementButton.centerY = decrementButton.centerY = valueParent.centerY;
    }
    else if ( options.arrowsPosition === 'topBottom' ) {
      incrementButton.centerX = decrementButton.centerX = valueParent.centerX;
      incrementButton.bottom = valueParent.top - options.ySpacing;
      decrementButton.top = valueParent.bottom + options.ySpacing;
    }
    else if ( options.arrowsPosition === 'bothRight' ) {
      incrementButton.left = decrementButton.left = valueParent.right + options.xSpacing;
      incrementButton.bottom = valueParent.centerY - ( options.ySpacing / 2 );
      decrementButton.top = valueParent.centerY + ( options.ySpacing / 2 );
    }
    else { // 'bothBottom'
      incrementButton.left = valueParent.centerX + ( options.xSpacing / 2 );
      decrementButton.right = valueParent.centerX - ( options.xSpacing / 2 );
      incrementButton.top = decrementButton.top = valueParent.bottom + options.ySpacing;
    }

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
    options.children = [ valueParent, incrementButton, decrementButton ];

    super( options );

    // enable/disable arrow buttons
    const updateEnabled = () => {
      incrementButton.enabled = ( options.incrementFunction( numberProperty.value ) <= rangeProperty.value.max );
      decrementButton.enabled = ( options.decrementFunction( numberProperty.value ) >= rangeProperty.value.min );
    };

    // synchronize with number value
    const numberPropertyObserver = value => {
      assert && assert( rangeProperty.value.contains( value ), 'value out of range: ' + value );

      // update the number
      numberNode.text = StringUtils.fillIn( options.valuePattern, {
        value: Utils.toFixed( value, options.decimalPlaces )
      } );

      // update the alignment
      switch( options.valueAlign ) {
        case 'center':
          numberNode.center = backgroundNode.center;
          break;
        case 'left':
          numberNode.left = backgroundNode.left + options.xMargin;
          break;
        case 'right':
          numberNode.right = backgroundNode.right - options.xMargin;
          break;
        default:
          throw new Error( 'invalid valueAlign: ' + options.valueAlign );
      }

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

    // enable or disable this component
    this.enabledProperty = options.enabledProperty; // @public
    const enabledPropertyObserver = enabled => {
      this.pickable = enabled;
      this.opacity = enabled ? 1 : 0.5;
      //TODO if !enabled, cancel any interaction that is in progress, see scenery#218
    };
    this.enabledProperty.link( enabledPropertyObserver );

    // a11y - initialize accessibility features
    assert && assert( !options.keyboardStep, 'keyboardStep supported by arrow buttons, do not pass value to NumberSpinner' );
    assert && assert( !options.shiftKeyboardStep, 'shiftKeyboardStep handled by arrow buttons' );
    options.keyboardStep = 0;
    options.shiftKeyboardStep = 0;
    this.initializeAccessibleNumberSpinner( numberProperty, rangeProperty, this.enabledProperty, options );

  // a11y - click arrow buttons on keyboard increment/decrement; must be disposed
  const increasedListener = function( isDown ) { isDown && incrementButton.a11yClick(); };
  const decreasedListener = function( isDown ) { isDown && decrementButton.a11yClick(); };
  this.incrementDownEmitter.addListener( increasedListener );
  this.decrementDownEmitter.addListener( decreasedListener );

    // Create a link to associated Property, so it's easier to find in Studio.
    this.addLinkedElement( numberProperty, {
      tandem: options.tandem.createTandem( 'property' )
    } );

    // @private
    this.disposeNumberSpinner = () => {

      // dispose a11y features
      this.incrementDownEmitter.removeListener( increasedListener );
      this.decrementDownEmitter.removeListener( decreasedListener );
      this.disposeAccessibleNumberSpinner();

      numberProperty.unlink( numberPropertyObserver );
      rangeProperty.unlink( rangeObserver );
      this.enabledProperty.unlink( enabledPropertyObserver );
    };
  }

  // @public Ensures that this node is eligible for GC.
  dispose() {
    this.disposeNumberSpinner();
    Node.prototype.dispose.call( this );
  }

  // @public
  setEnabled( enabled ) { this.enabledProperty.set( enabled ); }

  set enabled( value ) { this.setEnabled( value ); }

  // @public
  getEnabled() { return this.enabledProperty.get(); }

  get enabled() { return this.getEnabled(); }
}

sun.register( 'NumberSpinner', NumberSpinner );

AccessibleNumberSpinner.mixInto( NumberSpinner );

export default NumberSpinner;