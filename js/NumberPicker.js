// Copyright 2014-2020, University of Colorado Boulder

/**
 * User-interface component for picking a number value from a range.
 * This is essentially a value with integrated up/down spinners.
 * But PhET has been calling it a 'picker', so that's what this type is named.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Property from '../../axon/js/Property.js';
import StringProperty from '../../axon/js/StringProperty.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import Utils from '../../dot/js/Utils.js';
import Shape from '../../kite/js/Shape.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import merge from '../../phet-core/js/merge.js';
import FocusHighlightPath from '../../scenery/js/accessibility/FocusHighlightPath.js';
import FireListener from '../../scenery/js/listeners/FireListener.js';
import Node from '../../scenery/js/nodes/Node.js';
import Path from '../../scenery/js/nodes/Path.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import Text from '../../scenery/js/nodes/Text.js';
import Color from '../../scenery/js/util/Color.js';
import LinearGradient from '../../scenery/js/util/LinearGradient.js';
import PaintColorProperty from '../../scenery/js/util/PaintColorProperty.js';
import AccessibleNumberSpinner from '../../sun/js/accessibility/AccessibleNumberSpinner.js';
import SunConstants from '../../sun/js/SunConstants.js';
import generalBoundaryBoopSoundPlayer from '../../tambo/js/shared-sound-players/generalBoundaryBoopSoundPlayer.js';
import generalSoftClickSoundPlayer from '../../tambo/js/shared-sound-players/generalSoftClickSoundPlayer.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import MathSymbols from './MathSymbols.js';
import PhetFont from './PhetFont.js';
import sceneryPhet from './sceneryPhet.js';

class NumberPicker extends Node {

  /**
   * @param {Property.<number>} valueProperty
   * @param {Property.<Range>} rangeProperty - If the range is anticipated to change, it's best to have the range
   *                                           property contain the (maximum) union of all potential changes, so that
   *                                           NumberPicker can iterate through all possible values and compute the
   *                                           bounds of the labels.
   * @param {Object} [options]
   * @mixes AccessibleNumberSpinner
   */
  constructor( valueProperty, rangeProperty, options ) {

    options = merge( {
      cursor: 'pointer',
      color: new Color( 0, 0, 255 ), // {Color|string|Property.<Color|string>} color of arrows, and top/bottom gradient on pointer over
      backgroundColor: 'white', // {Color|string|Property.<Color|string>} color of the background when pointer is not over it
      cornerRadius: 6,
      xMargin: 3,
      yMargin: 3,
      decimalPlaces: 0,
      font: new PhetFont( 24 ),
      upFunction: function( value ) { return value + 1; },
      downFunction: function( value ) { return value - 1; },
      timerDelay: 400, // start to fire continuously after pressing for this long (milliseconds)
      timerInterval: 100, // fire continuously at this frequency (milliseconds),
      noValueString: MathSymbols.NO_VALUE, // string to display if valueProperty.get is null or undefined
      align: 'center', // horizontal alignment of the value, 'center'|'right'|'left'
      touchAreaXDilation: 10,
      touchAreaYDilation: 10,
      mouseAreaXDilation: 0,
      mouseAreaYDilation: 5,
      backgroundStroke: 'gray',
      backgroundLineWidth: 0.5,
      arrowHeight: 6,
      arrowYSpacing: 3,
      arrowStroke: 'black',
      arrowLineWidth: 0.25,
      valueMaxWidth: null, // {number|null} - If non-null, it will cap the value's maxWidth to this value

      /**
       * Converts a value to a string to be displayed in a Text node. NOTE: If this function can give different strings
       * to the same value depending on external state, it is recommended to rebuild the NumberPicker when that state
       * changes (as it uses formatValue over the initial range to determine the bounds that labels can take).
       *
       * @param {number} value - the current value
       * @returns {string}
       */
      formatValue: function( value ) {
        return Utils.toFixed( value, options.decimalPlaces );
      },

      /**
       * Determines whether the up arrow is enabled.
       * @param {number} value - the current value
       * @param {Range} range - the picker's range
       * @returns {boolean}
       */
      upEnabledFunction: function( value, range ) {
        return ( value !== null && value !== undefined && value < range.max );
      },

      /**
       * Determines whether the down arrow is enabled.
       * @param {number} value - the current value
       * @param {Range} range - the picker's range
       * @returns {boolean}
       */
      downEnabledFunction: function( value, range ) {
        return ( value !== null && value !== undefined && value > range.min );
      },

      // {BooleanProperty|null} if null, a default BooleanProperty is created
      enabledProperty: null,

      // {*|null} options passed to enabledProperty constructor, ignored if enabledProperty is provided
      enabledPropertyOptions: null,

      // Opacity used to indicate disabled, [0,1] exclusive
      disabledOpacity: SunConstants.DISABLED_OPACITY,

      // {Playable} - Sound generators for when the NumberPicker's value changes, and when it hits range extremities.
      // Use Playable.NO_SOUND to disable.
      valueChangedSoundPlayer: generalSoftClickSoundPlayer,
      boundarySoundPlayer: generalBoundaryBoopSoundPlayer,

      // phet-io
      tandem: Tandem.REQUIRED,
      phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly,
      phetioComponentOptions: null, // filled in below with PhetioObject.mergePhetioComponentOptions()

      // pdom (passed to AccessibleNumberSpinner)
      pageKeyboardStep: 2, // {number} - change in value when using page up/page down, see AccessibleNumberSpinner
      change: _.noop
    }, options );

    // {Color|string|Property.<Color|string} color of arrows and top/bottom gradient when pressed
    let colorProperty = null;
    if ( options.pressedColor === undefined ) {
      colorProperty = new PaintColorProperty( options.color ); // dispose required!

      // No reference needs to be kept, since we dispose its dependency.
      options.pressedColor = new DerivedProperty( [ colorProperty ], function( color ) {
        return color.darkerColor();
      } );
    }

    assert && assert( options.disabledOpacity > 0 && options.disabledOpacity < 1,
      `invalid disabledOpacity: ${options.disabledOpacity}` );

    PhetioObject.mergePhetioComponentOptions( { visibleProperty: { phetioFeatured: true } }, options );

    super();

    //------------------------------------------------------------
    // Properties

    const upStateProperty = new StringProperty( 'up' ); // 'up'|'down'|'over'|'out'
    const downStateProperty = new StringProperty( 'up' ); // 'up'|'down'|'over'|'out'

    // must be disposed
    const upEnabledProperty = new DerivedProperty( [ valueProperty, rangeProperty ], options.upEnabledFunction );

    // must be disposed
    const downEnabledProperty = new DerivedProperty( [ valueProperty, rangeProperty ], options.downEnabledFunction );

    // @private
    this.enabledProperty = options.enabledProperty;
    const ownsEnabledProperty = !this.enabledProperty;
    if ( ownsEnabledProperty ) {
      this.enabledProperty = new BooleanProperty( true, merge( {
        tandem: options.tandem.createTandem( 'enabledProperty' ),
        phetioReadOnly: options.phetioReadOnly,
        phetioDocumentation: 'When disabled, the picker is grayed out and cannot be pressed.',
        phetioFeatured: true
      }, options.enabledPropertyOptions ) );
    }
    else {
      assert && Tandem.VALIDATION && assert( this.enabledProperty.phetioFeatured, 'provided enabledProperty must be phetioFeatured' );
    }

    //------------------------------------------------------------
    // Nodes

    // displays the value
    const valueNode = new Text( '', { font: options.font, pickable: false } );

    // compute max width of text based on the width of all possible values.
    // See https://github.com/phetsims/area-model-common/issues/5
    // TODO: Recalculate maximum width on range changes, see https://github.com/phetsims/scenery-phet/issues/306
    let currentSampleValue = rangeProperty.get().min;
    const sampleValues = [];
    while ( currentSampleValue <= rangeProperty.get().max ) {
      sampleValues.push( currentSampleValue );
      currentSampleValue = options.upFunction( currentSampleValue );
      assert && assert( sampleValues.length < 500000, 'Don\'t infinite loop here' );
    }
    let maxWidth = Math.max.apply( null, sampleValues.map( function( value ) {
      valueNode.text = options.formatValue( value );
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

    // top half of the background, for 'up'. Shape computed starting at upper-left, going clockwise.
    const upBackground = new Path( new Shape()
      .arc( backgroundCornerRadius, backgroundCornerRadius, backgroundCornerRadius, Math.PI, Math.PI * 3 / 2, false )
      .arc( backgroundWidth - backgroundCornerRadius, backgroundCornerRadius, backgroundCornerRadius, -Math.PI / 2, 0, false )
      .lineTo( backgroundWidth, ( backgroundHeight / 2 ) + backgroundOverlap )
      .lineTo( 0, ( backgroundHeight / 2 ) + backgroundOverlap )
      .close(), { pickable: false } );

    // bottom half of the background, for 'down'. Shape computed starting at bottom-right, going clockwise.
    const downBackground = new Path( new Shape()
      .arc( backgroundWidth - backgroundCornerRadius, backgroundHeight - backgroundCornerRadius, backgroundCornerRadius, 0, Math.PI / 2, false )
      .arc( backgroundCornerRadius, backgroundHeight - backgroundCornerRadius, backgroundCornerRadius, Math.PI / 2, Math.PI, false )
      .lineTo( 0, backgroundHeight / 2 )
      .lineTo( backgroundWidth, backgroundHeight / 2 )
      .close(), { pickable: false } );

    // separate rectangle for stroke around value background
    const strokedBackground = new Rectangle( 0, 0, backgroundWidth, backgroundHeight, backgroundCornerRadius, backgroundCornerRadius, {
      pickable: false,
      stroke: options.backgroundStroke,
      lineWidth: options.backgroundLineWidth
    } );

    // compute size of arrows
    const arrowButtonSize = new Dimension2( 0.5 * backgroundWidth, options.arrowHeight );

    const arrowOptions = {
      stroke: options.arrowStroke,
      lineWidth: options.arrowLineWidth,
      pickable: false
    };

    // 'up' arrow
    const upArrowShape = new Shape()
      .moveTo( arrowButtonSize.width / 2, 0 )
      .lineTo( arrowButtonSize.width, arrowButtonSize.height )
      .lineTo( 0, arrowButtonSize.height )
      .close();
    this.upArrow = new Path( upArrowShape, arrowOptions ); // @private
    this.upArrow.centerX = upBackground.centerX;
    this.upArrow.bottom = upBackground.top - options.arrowYSpacing;

    // 'down' arrow
    const downArrowShape = new Shape()
      .moveTo( arrowButtonSize.width / 2, arrowButtonSize.height )
      .lineTo( 0, 0 )
      .lineTo( arrowButtonSize.width, 0 )
      .close();
    this.downArrow = new Path( downArrowShape, arrowOptions ); // @private
    this.downArrow.centerX = downBackground.centerX;
    this.downArrow.top = downBackground.bottom + options.arrowYSpacing;

    // parents for 'up' and 'down' components
    const upParent = new Node( { children: [ upBackground, this.upArrow ] } );
    upParent.addChild( new Rectangle( upParent.localBounds ) ); // invisible overlay
    const downParent = new Node( { children: [ downBackground, this.downArrow ] } );
    downParent.addChild( new Rectangle( downParent.localBounds ) ); // invisible overlay

    // rendering order
    this.addChild( upParent );
    this.addChild( downParent );
    this.addChild( strokedBackground );
    this.addChild( valueNode );

    //------------------------------------------------------------
    // Pointer areas

    // touch area
    upParent.touchArea = Shape.rectangle(
      upParent.left - ( options.touchAreaXDilation / 2 ), upParent.top - options.touchAreaYDilation,
      upParent.width + options.touchAreaXDilation, upParent.height + options.touchAreaYDilation );
    downParent.touchArea = Shape.rectangle(
      downParent.left - ( options.touchAreaXDilation / 2 ), downParent.top,
      downParent.width + options.touchAreaXDilation, downParent.height + options.touchAreaYDilation );

    // mouse area
    upParent.mouseArea = Shape.rectangle(
      upParent.left - ( options.mouseAreaXDilation / 2 ), upParent.top - options.mouseAreaYDilation,
      upParent.width + options.mouseAreaXDilation, upParent.height + options.mouseAreaYDilation );
    downParent.mouseArea = Shape.rectangle(
      downParent.left - ( options.mouseAreaXDilation / 2 ), downParent.top,
      downParent.width + options.mouseAreaXDilation, downParent.height + options.mouseAreaYDilation );

    //------------------------------------------------------------
    // Colors

    // arrow colors
    const arrowColors = {
      up: options.color,
      over: options.color,
      down: options.pressedColor,
      out: options.color,
      disabled: 'rgb(176,176,176)'
    };

    // background colors
    const highlightGradient = createVerticalGradient( options.color, options.backgroundColor, options.color, backgroundHeight );
    const pressedGradient = createVerticalGradient( options.pressedColor, options.backgroundColor, options.pressedColor, backgroundHeight );
    const backgroundColors = {
      up: options.backgroundColor,
      over: highlightGradient,
      down: pressedGradient,
      out: pressedGradient,
      disabled: options.backgroundColor
    };

    const playUISound = () => {
      let soundClip = options.valueChangedSoundPlayer;

      // If the value is at min or max, then play the boundary sound instead of the default sound
      if ( valueProperty.value === rangeProperty.get().max || valueProperty.value === rangeProperty.get().min ) {
        soundClip = options.boundarySoundPlayer;
      }
      soundClip.play();
    };

    //------------------------------------------------------------
    // Observers and InputListeners

    // @private
    const inputListenerOptions = {
      fireOnHold: true,
      fireOnHoldDelay: options.timerDelay,
      fireOnHoldInterval: options.timerInterval
    };
    this.upInputListener = new NumberPickerInputListener( upStateProperty, merge( {
      tandem: options.tandem.createTandem( 'upInputListener' ),
      fire: () => {
        valueProperty.set( Math.min( options.upFunction( valueProperty.get() ), rangeProperty.get().max ) );
        playUISound();
      }
    }, inputListenerOptions ) );
    upParent.addInputListener( this.upInputListener );

    // @private
    this.downInputListener = new NumberPickerInputListener( downStateProperty, merge( {
      tandem: options.tandem.createTandem( 'downInputListener' ),
      fire: () => {
        valueProperty.set( Math.max( options.downFunction( valueProperty.get() ), rangeProperty.get().min ) );
        playUISound();
      }
    }, inputListenerOptions ) );
    downParent.addInputListener( this.downInputListener );

    // enable/disable listeners: unlink unnecessary, Properties are owned by this instance
    upEnabledProperty.link( enabled => !enabled && this.upInputListener.interrupt() );
    downEnabledProperty.link( enabled => !enabled && this.downInputListener.interrupt() );

    // Update text to match the value
    const valueObserver = function( value ) {
      if ( value === null || value === undefined ) {
        valueNode.text = options.noValueString;
        valueNode.x = ( backgroundWidth - valueNode.width ) / 2; // horizontally centered
      }
      else {
        valueNode.text = options.formatValue( value );
        if ( options.align === 'center' ) {
          valueNode.centerX = upBackground.centerX;
        }
        else if ( options.align === 'right' ) {
          valueNode.right = upBackground.right - options.xMargin;
        }
        else if ( options.align === 'left' ) {
          valueNode.left = upBackground.left + options.xMargin;
        }
        else {
          throw new Error( 'unsupported value for options.align: ' + options.align );
        }
      }
      valueNode.centerY = backgroundHeight / 2;
    };
    valueProperty.link( valueObserver ); // must be unlinked in dispose

    // @private update colors for 'up' components
    Property.multilink( [ upStateProperty, upEnabledProperty ], ( state, enabled ) => {
      updateColors( state, enabled, upBackground, this.upArrow, backgroundColors, arrowColors );
    } );

    // @private update colors for 'down' components
    Property.multilink( [ downStateProperty, downEnabledProperty ], ( state, enabled ) => {
      updateColors( state, enabled, downBackground, this.downArrow, backgroundColors, arrowColors );
    } );

    this.mutate( options );

    // Dilate based on consistent technique which brings into account transform of this node.
    const focusBounds = this.localBounds.dilated( FocusHighlightPath.getDilationCoefficient( this ) );

    // pdom - custom focus highlight that matches rounded background behind the numeric value
    this.focusHighlight = new FocusHighlightPath( Shape.roundedRectangleWithRadii(
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

    // Overwrite the passed in change listener to make sure that sound implementation can't be blown away in the defaults.
    const passedInChangeListener = options.change;
    options.change = () => {
      passedInChangeListener();
      playUISound();
    };

    // initialize accessibility features - must reach into up function to get delta
    // both normal arrow and shift arrow keys use delta produced with up function
    const keyboardStep = options.upFunction( valueProperty.get() ) - valueProperty.get();
    this.initializeAccessibleNumberSpinner( valueProperty, rangeProperty, this.enabledProperty, merge( {
      keyboardStep: keyboardStep,
      shiftKeyboardStep: keyboardStep
    }, options ) );

    // update style with keyboard input, Emitters owned by this instance and disposed in AccessibleNumberSpinner
    this.incrementDownEmitter.addListener( function( isDown ) { upStateProperty.value = ( isDown ? 'down' : 'up' ); } );
    this.decrementDownEmitter.addListener( function( isDown ) { downStateProperty.value = ( isDown ? 'down' : 'up' ); } );

    const enabledListener = enabled => {
      this.interruptSubtreeInput(); // cancel interaction that may be in progress
      this.pickable = enabled;
      this.cursor = enabled ? options.cursor : 'default';
      this.opacity = enabled ? 1 : options.disabledOpacity;
    };
    this.enabledProperty.link( enabledListener );

    this.addLinkedElement( valueProperty, {
      tandem: options.tandem.createTandem( 'valueProperty' )
    } );

    // @private
    this.disposeNumberPicker = function() {

      colorProperty && colorProperty.dispose();
      upEnabledProperty.dispose();
      downEnabledProperty.dispose();

      if ( valueProperty.hasListener( valueObserver ) ) {
        valueProperty.unlink( valueObserver );
      }

      if ( ownsEnabledProperty ) {
        this.enabledProperty.dispose();
      }
      else if ( this.enabledProperty.hasListener( enabledListener ) ) {
        this.enabledProperty.unlink( enabledListener );
      }

      // pdom mixin
      this.disposeAccessibleNumberSpinner();
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'scenery-phet', 'NumberPicker', this );
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeNumberPicker();
    super.dispose();
  }

  /**
   * Sets visibility of the arrows.
   * @param {boolean} visible
   * @public
   */
  setArrowsVisible( visible ) {
    if ( !visible ) {
      this.upInputListener.interrupt();
      this.downInputListener.interrupt();
    }
    this.upArrow.visible = this.downArrow.visible = visible;
  }

  /**
   * Sets whether the picker is enabled.
   * @param {boolean} enabled
   * @public
   */
  setEnabled( enabled ) { this.enabledProperty.value = enabled; }

  set enabled( value ) { this.setEnabled( value ); }

  /**
   * Is the picker enabled?
   * @returns {boolean}
   * @public
   */
  getEnabled() { return this.enabledProperty.value; }

  get enabled() { return this.getEnabled(); }
}

sceneryPhet.register( 'NumberPicker', NumberPicker );

/**
 * Converts FireListener events to state changes.
 */
class NumberPickerInputListener extends FireListener {

  /**
   * @param {Property.<string>} stateProperty 'up'|'down'|'over'|'out'
   * @param {Object} [options]
   */
  constructor( stateProperty, options ) {
    super( options );

    const updateState = () => {
      const isOver = this.isOverProperty.value;
      const isPressed = this.isPressedProperty.value;

      stateProperty.set( isOver && !isPressed ? 'over' :
                         isOver && isPressed ? 'down' :
                         !isOver && !isPressed ? 'up' :
                         !isOver && isPressed ? 'out' :
                         assert && assert( 'bad state' )
      );
    };
    this.isOverProperty.link( updateState );
    this.isPressedProperty.link( updateState );
  }
}

/**
 * Creates a vertical gradient.
 * @param {ColorDef} topColor
 * @param {ColorDef} centerColor
 * @param {ColorDef} bottomColor
 * @param {number} height
 * @returns {LinearGradient}
 */
const createVerticalGradient = function( topColor, centerColor, bottomColor, height ) {
  return new LinearGradient( 0, 0, 0, height )
    .addColorStop( 0, topColor )
    .addColorStop( 0.5, centerColor )
    .addColorStop( 1, bottomColor );
};

/**
 * Updates arrow and background colors
 * @param {string} state
 * @param {boolean} enabled
 * @param {ColorDef} background
 * @param {Path} arrow
 * @param {Object} backgroundColors - see backgroundColors in constructor
 * @param {Object} arrowColors - see arrowColors in constructor
 */
const updateColors = function( state, enabled, background, arrow, backgroundColors, arrowColors ) {
  if ( enabled ) {
    arrow.stroke = 'black';
    if ( state === 'up' ) {
      background.fill = backgroundColors.up;
      arrow.fill = arrowColors.up;
    }
    else if ( state === 'over' ) {
      background.fill = backgroundColors.over;
      arrow.fill = arrowColors.over;
    }
    else if ( state === 'down' ) {
      background.fill = backgroundColors.down;
      arrow.fill = arrowColors.down;
    }
    else if ( state === 'out' ) {
      background.fill = backgroundColors.out;
      arrow.fill = arrowColors.out;
    }
    else {
      throw new Error( 'unsupported state: ' + state );
    }
  }
  else {
    background.fill = backgroundColors.disabled;
    arrow.fill = arrowColors.disabled;
    arrow.stroke = arrowColors.disabled; // stroke so that arrow size will look the same when it's enabled/disabled
  }
};

// mix accessibility into NumberPicker
AccessibleNumberSpinner.mixInto( NumberPicker );

export default NumberPicker;