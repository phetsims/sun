// Copyright 2013-2015, University of Colorado Boulder

/**
 * Horizontal slider.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var Dimension2 = require( 'DOT/Dimension2' );
  var HSliderThumb = require( 'SUN/HSliderThumb' );
  var HSliderTrack = require( 'SUN/HSliderTrack' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearFunction = require( 'DOT/LinearFunction' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Property = require( 'AXON/Property' );
  var Shape = require( 'KITE/Shape' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var FocusOverlay = require( 'SCENERY/overlays/FocusOverlay' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Input = require( 'SCENERY/input/Input' );
  var Util = require( 'DOT/Util' );

  // phet-io modules
  var THSlider = require( 'SUN/THSlider' );

  /**
   * @param {Property.<number>} valueProperty
   * @param { {min:number, max:number} } range
   * @param {Object} [options]
   * @constructor
   */
  function HSlider( valueProperty, range, options ) {

    var self = this;
    Node.call( this );

    options = _.extend( {

      // track
      trackSize: new Dimension2( 100, 5 ),
      trackFillEnabled: 'white',
      trackFillDisabled: 'gray',
      trackStroke: 'black',
      trackLineWidth: 1,
      trackCornerRadius: 0,

      // {Node} optional thumb, replaces the default.
      // Client is responsible for highlighting, disabling and pointer areas.
      // The thumb is positioned based on its center and hence can have its origin anywhere
      thumbNode: null,

      // Options for the default thumb, ignored if thumbNode is set
      thumbSize: new Dimension2( 22, 45 ),
      thumbFillEnabled: 'rgb(50,145,184)',
      thumbFillHighlighted: 'rgb(71,207,255)',
      thumbFillDisabled: '#F0F0F0',
      thumbStroke: 'black',
      thumbLineWidth: 1,
      thumbYOffset: 0, // center of the thumb is vertically offset by this amount from the center of the track
      thumbCenterLineStroke: 'white',
      thumbTouchAreaXDilation: 11,
      thumbTouchAreaYDilation: 11,
      thumbMouseAreaXDilation: 0,
      thumbMouseAreaYDilation: 0,

      // ticks
      tickLabelSpacing: 6,
      majorTickLength: 25,
      majorTickStroke: 'black',
      majorTickLineWidth: 1,
      minorTickLength: 10,
      minorTickStroke: 'black',
      minorTickLineWidth: 1,

      // other
      cursor: 'pointer',
      enabledProperty: new Property( true ),
      enabledRangeProperty: new Property( range ), // controls the portion of the slider that is enabled
      snapValue: null, // if specified, slider will snap to this value on end drag
      startDrag: function() {}, // called when a drag sequence starts
      endDrag: function() {}, // called when a drag sequence ends
      constrainValue: function( value ) { return value; }, // called before valueProperty is set

      // a11y
      tagName: 'input',
      inputType: 'range',
      ariaRole: 'slider', // required for NVDA to read the value text correctly, see https://github.com/phetsims/a11y-research/issues/51
      accessibleValuePattern: '{{value}}', // {string} if you want units or additional content, add to pattern
      accessibleDecimalPlaces: 0, // number of decimal places for the value read by assistive technology
      keyboardStep: ( range.max - range.min ) / 20,
      shiftKeyboardStep: ( range.max - range.min ) / 100,
      pageKeyboardStep: ( range.max - range.min ) / 10,
      focusHighlightLineWidth: 4,

      // phet-io
      tandem: Tandem.tandemRequired(),
      phetioType: THSlider
    }, options );

    // @public
    this.enabledProperty = options.enabledProperty;
    this.enabledRangeProperty = options.enabledRangeProperty;

    // @private options needed by prototype functions that add ticks
    this.tickOptions = _.pick( options, 'tickLabelSpacing',
      'majorTickLength', 'majorTickStroke', 'majorTickLineWidth',
      'minorTickLength', 'minorTickStroke', 'minorTickLineWidth' );

    // @private
    this._snapValue = options.snapValue;

    // @private (a11y) - delta for the valueProperty when using keyboard to interact with slider
    this._keyboardStep = options.keyboardStep;

    // @private (a11y) - delta or the valueProperty when holding shift and using the keyboard to interact with
    // the slider
    this._shiftKeyboardStep = options.shiftKeyboardStep;
    this._pageKeyboardStep = options.pageKeyboardStep;

    // @private ticks are added to these parents, so they are behind the knob
    this.majorTicksParent = new Node();
    this.minorTicksParent = new Node();
    this.addChild( this.majorTicksParent );
    this.addChild( this.minorTicksParent );

    // @private mapping between value and track position
    this.valueToPosition = new LinearFunction( range.min, range.max, 0, options.trackSize.width, true /* clamp */ );

    // snap to a value if value is within range, used by HSlider and HSliderTrack
    var snapToValue = function( value ) {
      if ( value <= range.max && value >= range.min ) {
        valueProperty.set( value );
      }
      else {
        throw new Error( 'value is out of range: ' + value );
      }
    };

    // @private track
    this.track = new HSliderTrack( valueProperty, this.valueToPosition, snapToValue, {

      // propagate options that are specific to HSliderTrack
      size: options.trackSize,
      fillEnabled: options.trackFillEnabled,
      fillDisabled: options.trackFillDisabled,
      stroke: options.trackStroke,
      lineWidth: options.trackLineWidth,
      cornerRadius: options.trackCornerRadius,
      enabledProperty: options.enabledProperty,
      startDrag: options.startDrag,
      endDrag: options.endDrag,
      snapValue: options.snapValue,
      constrainValue: options.constrainValue,

      // phet-io
      tandem: options.tandem.createTandem( 'track' )
    } );
    this.track.centerX = this.valueToPosition( ( range.max + range.min ) / 2 );

    // The thumb of the slider
    var thumb = options.thumbNode || new HSliderThumb( this.enabledProperty, {

        // propagate options that are specific to HSliderThumb
        size: options.thumbSize,
        fillEnabled: options.thumbFillEnabled,
        fillHighlighted: options.thumbFillHighlighted,
        fillDisabled: options.thumbFillDisabled,
        stroke: options.thumbStroke,
        lineWidth: options.thumbLineWidth,
        centerLineStroke: options.thumbCenterLineStroke,
        tandem: options.tandem.createTandem( 'thumb' )
      } );

    // Dilate the local bounds horizontally so that it extends beyond where the thumb can reach.  This prevents layout
    // asymmetry when the slider thumb is off the edges of the track.  See https://github.com/phetsims/sun/issues/282
    this.track.localBounds = this.track.localBounds.dilatedX( thumb.width / 2 );

    // Add the track
    this.addChild( this.track );

    // do this outside of options hash, so that it applied to both default and custom thumbs
    thumb.centerY = this.track.centerY + options.thumbYOffset;
    this.addChild( thumb );

    // touchArea for the default thumb. If a custom thumb is provided, the client is responsible for its touchArea.
    if ( !options.thumbNode && ( options.thumbTouchAreaXDilation || options.thumbTouchAreaYDilation ) ) {
      thumb.touchArea = thumb.localBounds.dilatedXY( options.thumbTouchAreaXDilation, options.thumbTouchAreaYDilation );
    }

    // mouseArea for the default thumb. If a custom thumb is provided, the client is responsible for its mouseArea.
    if ( !options.thumbNode && ( options.thumbMouseAreaXDilation || options.thumbMouseAreaYDilation ) ) {
      thumb.mouseArea = thumb.localBounds.dilatedXY( options.thumbMouseAreaXDilation, options.thumbMouseAreaYDilation );
    }

    // update value when thumb is dragged
    var clickXOffset = 0; // x-offset between initial click and thumb's origin
    var thumbInputListener = new SimpleDragHandler( {

      tandem: options.tandem.createTandem( 'thumbInputListener' ),

      allowTouchSnag: true,

      start: function( event, trail ) {
        if ( self.enabledProperty.get() ) {
          options.startDrag();
          var transform = trail.subtrailTo( self ).getTransform();

          // Determine the offset relative to the center of the thumb
          clickXOffset = transform.inversePosition2( event.pointer.point ).x - thumb.centerX;
        }
      },

      drag: function( event, trail ) {
        if ( self.enabledProperty.get() ) {
          var transform = trail.subtrailTo( self ).getTransform(); // we only want the transform to our parent
          var x = transform.inversePosition2( event.pointer.point ).x - clickXOffset;
          var newValue = self.valueToPosition.inverse( x );

          valueProperty.set( options.constrainValue( newValue ) );
        }
      },

      end: function() {
        if ( self.enabledProperty.get() ) {
          if ( typeof self._snapValue === 'number' ) {
            snapToValue( self._snapValue );
          }
          options.endDrag();
        }
      }
    } );
    thumb.addInputListener( thumbInputListener );

    // enable/disable
    var enabledObserver = function( enabled ) {
      self.cursor = self.enabledProperty.get() ? options.cursor : 'default';
      if ( !enabled ) {
        if ( thumbInputListener.dragging ) { thumbInputListener.endDrag(); }
      }
      self.pickable = enabled;
    };
    this.enabledProperty.link( enabledObserver ); // must be unlinked in disposeHSlider

    // a11y - custom focus highlight that surrounds and moves with the thumb
    this.focusHighlight = Rectangle.bounds( thumb.bounds.dilated( 5 ), {
      stroke: FocusOverlay.innerFocusColor,
      lineWidth: options.focusHighlightLineWidth
    } );

    // update thumb location when value changes
    var valueObserver = function( value ) {
      thumb.centerX = self.valueToPosition( value );
      self.focusHighlight.centerX = thumb.centerX;
    };
    valueProperty.link( valueObserver ); // must be unlinked in disposeHSlider

    // when the enabled range changes, the value to position linear function must change as well
    var enabledRangeObserver = function( enabledRange ) {

      assert && assert( enabledRange.min >= range.min && enabledRange.max <= range.max, 'enabledRange is out of range' );

      var initialValueToPosition = new LinearFunction( range.min, range.max, 0, options.trackSize.width, true /* clamp */ );
      var min = initialValueToPosition( enabledRange.min );
      var max = initialValueToPosition( enabledRange.max );

      // update the geometry of the enabled track
      self.track.updateEnabledTrackWidth( min, max );

      // update the function that maps value to position for the track and the slider
      self.valueToPosition = new LinearFunction( enabledRange.min, enabledRange.max, min, max, true /* clamp */ );
      self.track.valueToPosition = self.valueToPosition;

      // clamp the value to the enabled range if it changes
      valueProperty.set( Util.clamp( valueProperty.value, enabledRange.min, enabledRange.max ) );
    };
    this.enabledRangeProperty.link( enabledRangeObserver ); // needs to be unlinked in dispose function

    this.mutate( options );

    // a11y - Implements the keyboard interaction for a typical HTML range slider - browsers place limitations
    // on the interaction when the slider range is not evently divisible by the step size.  Rather
    // than allow the browser to natively change the valueProperty with an input event, we decided to roll our
    // own implementation, but keep the general behavior the same.
    var accessibleInputListener = this.addAccessibleInputListener( {
      keydown: function( event ) {
        var code = event.keyCode;

        if ( self.enabledProperty.get() ) {

          // Prevent default so browser doesn't change input value automatically
          if ( Input.isRangeKey( code ) ) {
            event.preventDefault();
          }

          var newValue = valueProperty.get();
          if ( code === Input.KEY_END || code === Input.KEY_HOME ) {

            // on 'end' and 'home' snap to max and min of enabled range respectively (this is typical browser
            // behavior for sliders)
            if ( code === Input.KEY_END ) {
              newValue = self.enabledRange.max;
            }
            else if ( code === Input.KEY_HOME ) {
              newValue = self.enabledRange.min;
            }
          }
          else {
            var stepSize;
            if ( code === Input.KEY_PAGE_UP || code === Input.KEY_PAGE_DOWN ) {

              // on page up and page down, the default step size is 1/10 of the range (this is typical browser behavior)
              stepSize = options.pageKeyboardStep;

              if ( code === Input.KEY_PAGE_UP ) {
                newValue = valueProperty.get() + stepSize;
              }
              else if ( code === Input.KEY_PAGE_DOWN ) {
                newValue = valueProperty.get() - stepSize;
              }
            }
            else if ( Input.isArrowKey( code ) ) {

              // if the shift key is pressed down, modify the step size (this is atypical browser behavior for sliders)
              stepSize = event.shiftKey ? self.shiftKeyboardStep : self.keyboardStep;
              // 

              if ( code === Input.KEY_RIGHT_ARROW || code === Input.KEY_UP_ARROW ) {
                newValue = valueProperty.get() + stepSize;
              }
              else if ( code === Input.KEY_LEFT_ARROW || code === Input.KEY_DOWN_ARROW ) {
                newValue = valueProperty.get() - stepSize;
              }

              // round the value to the nearest keyboard step
              newValue = Util.roundSymmetric( newValue / stepSize ) * stepSize;

              // it is possible to pass a value in either direction due to rounding, go up or down a step if we have
              // passed the nearest step
              if ( Util.toFixedNumber( Math.abs( newValue - valueProperty.get() ), 5 ) > stepSize ) {
                newValue += ( newValue > valueProperty.get() ) ? ( -1 * stepSize ) : stepSize;
              }
            }

            // limit the value to the enabled range
            newValue = Util.clamp( newValue, self.enabledRange.min, self.enabledRange.max );
          }

          // optionally constrain the value further
          valueProperty.set( options.constrainValue( newValue ) );
        }
      }
    } );


    // a11y - when the property changes, be sure to update the accessible input value and
    // aria-valuetext for assistive, which is read by assistive technology when the value changes
    var accessiblePropertyListener = function( value ) {
      self.inputValue = value;

      // format the value text for reading
      var formattedValue = Util.toFixed( value, options.accessibleDecimalPlaces );
      var valueText = StringUtils.fillIn( options.accessibleValuePattern, {
        value: formattedValue
      } );
      self.setAccessibleAttribute( 'aria-valuetext', valueText );
    };

    valueProperty.link( accessiblePropertyListener );

    // @private Called by dispose
    this.disposeHSlider = function() {
      thumb.dispose && thumb.dispose(); // in case a custom thumb is provided via options.thumbNode that doesn't implement dispose
      self.track.dispose();
      valueProperty.unlink( valueObserver );
      self.enabledRangeProperty.unlink( enabledRangeObserver );
      self.enabledProperty.unlink( enabledObserver );
      self.removeAccessibleInputListener( accessibleInputListener );
      valueProperty.unlink( accessiblePropertyListener );

      thumbInputListener.dispose();
    };
  }

  sun.register( 'HSlider', HSlider );

  inherit( Node, HSlider, {

    // @public - ensures that this object is eligible for GC
    dispose: function() {
      this.disposeHSlider();
      Node.prototype.dispose.call( this );
    },

    /**
     * Adds a major tick mark.
     * @param {number} value
     * @param {Node} [label] optional
     * @public
     */
    addMajorTick: function( value, label ) {
      this.addTick( this.majorTicksParent, value, label,
        this.tickOptions.majorTickLength, this.tickOptions.majorTickStroke, this.tickOptions.majorTickLineWidth );
    },

    /**
     * Adds a minor tick mark.
     * @param {number} value
     * @param {Node} [label] optional
     * @public
     */
    addMinorTick: function( value, label ) {
      this.addTick( this.minorTicksParent, value, label,
        this.tickOptions.minorTickLength, this.tickOptions.minorTickStroke, this.tickOptions.minorTickLineWidth );
    },

    /*
     * Adds a tick mark above the track.
     * @param {Node} parent
     * @param {number} value
     * @param {Node} [label] optional
     * @param {number} length
     * @param {number} stroke
     * @param {number} lineWidth
     * @private
     */
    addTick: function( parent, value, label, length, stroke, lineWidth ) {
      var labelX = this.valueToPosition( value );
      // ticks
      var tick = new Path( new Shape()
          .moveTo( labelX, this.track.top )
          .lineTo( labelX, this.track.top - length ),
        { stroke: stroke, lineWidth: lineWidth } );
      parent.addChild( tick );
      // label
      if ( label ) {
        parent.addChild( label );
        label.centerX = tick.centerX;
        label.bottom = tick.top - this.tickOptions.tickLabelSpacing;
      }
    },

    // @public
    setEnabled: function( enabled ) { this.enabledProperty.value = enabled; },
    set enabled( value ) { this.setEnabled( value ); },

    // @public
    getEnabled: function() { return this.enabledProperty.value; },
    get enabled() { return this.getEnabled(); },

    // @public
    setEnabledRange: function( enabledRange ) { this.enabledRangeProperty.value = enabledRange; },
    set enabledRange( range ) { this.setEnabledRange( range ); },

    // @public
    getEnabledRange: function() { return this.enabledRangeProperty.value; },
    get enabledRange() { return this.getEnabledRange(); },

    // @public
    setSnapValue: function( snapValue ) {
      this._snapValue = snapValue;
      this.track.snapValue = snapValue;
    },
    set snapValue( snapValue ) { this.setSnapValue( snapValue ); },

    // @public
    getSnapValue: function() { return this._snapValue; },
    get snapValue() { return this.getSnapValue(); },

    // @public
    setKeyboardStep: function( keyboardStep ) {
      this._keyboardStep = keyboardStep;
    },
    set keyboardStep( keyboardStep ) { this.setKeyboardStep( keyboardStep ); },

    // @public
    getKeyboardStep: function() {
      return this._keyboardStep;
    },
    get keyboardStep() { return this.getKeyboardStep(); },

    // @public
    setShiftKeyboardStep: function( shiftKeyboardStep ) {
      this._shiftKeyboardStep = shiftKeyboardStep;
    },
    set shiftKeyboardStep( shiftKeyboardStep ) { this.setShiftKeyboardStep( shiftKeyboardStep ); },

    // @public
    getShiftKeyboardStep: function() {
      return this._shiftKeyboardStep;
    },
    get shiftKeyboardStep() { return this.getShiftKeyboardStep(); },

    // @public
    getPageKeyboardStep: function() {
      return this._pageKeyboardStep;
    },
    get pageKeyboardStep() { return this.getPageKeyboardStep(); },

    // @public
    setPageKeyboardStep: function( pageKeyboardStep ) {
      this._pageKeyboardStep = pageKeyboardStep;
    },
    set pageKeyboardStep( pageKeyboardStep ) { this.setPageKeyboardStep( pageKeyboardStep ); },

    // @public - Sets visibility of major ticks.
    setMajorTicksVisible: function( visible ) {
      this.majorTicksParent.visible = visible;
    },
    set majorTicksVisible( value ) { this.setMajorTicksVisible( value ); },

    // @public - Gets visibility of major ticks.
    getMajorTicksVisible: function() {
      return this.majorTicksParent.visible;
    },
    get majorTicksVisible() { return this.getMajorTicksVisible(); },

    // @public - Sets visibility of minor ticks.
    setMinorTicksVisible: function( visible ) {
      this.minorTicksParent.visible = visible;
    },
    set minorTicksVisible( value ) { this.setMinorTicksVisible( value ); },

    // @public - Gets visibility of minor ticks.
    getMinorTicksVisible: function() {
      return this.minorTicksParent.visible;
    },
    get minorTicksVisible() { return this.getMinorTicksVisible(); }
  } );

  return HSlider;
} );