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
  var Input = require( 'SCENERY/input/Input' );
  var LinearFunction = require( 'DOT/LinearFunction' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Property = require( 'AXON/Property' );
  var Shape = require( 'KITE/Shape' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );
  var TandemDragHandler = require( 'TANDEM/scenery/input/TandemDragHandler' );
  var Util = require( 'DOT/Util' );

  // phet-io modules
  var THSlider = require( 'ifphetio!PHET_IO/types/sun/THSlider' );

  /**
   * @param {Property.<number>} valueProperty
   * @param { {min:number, max:number} } range
   * @param {Object} [options]
   * @constructor
   */
  function HSlider( valueProperty, range, options ) {

    var thisSlider = this;
    Node.call( thisSlider );

    options = _.extend( {

      // track
      trackSize: new Dimension2( 100, 5 ),
      trackFillEnabled: 'white',
      trackFillDisabled: 'gray',
      trackStroke: 'black',
      trackLineWidth: 1,

      // {Node} optional thumb, replaces the default.
      // Client is responsible for highlighting, disabling and pointer areas.
      // The thumb will be centered in the track.
      thumbNode: null,

      // Dilation of touchArea for default thumb, ignored for custom thumb.
      // A value of null results in a default dilation that is based on the size of the thumb.
      thumbTouchAreaXDilation: null, // {number|null}
      thumbTouchAreaYDilation: null, // {number|null}

      // Options for the default thumb, ignored if thumbNode is set
      thumbSize: new Dimension2( 22, 45 ),
      thumbFillEnabled: 'rgb(50,145,184)',
      thumbFillHighlighted: 'rgb(71,207,255)',
      thumbFillDisabled: '#F0F0F0',
      thumbStroke: 'black',
      thumbLineWidth: 1,
      thumbCenterLineStroke: 'white',

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

      // phet-io
      tandem: null // {Tandem|null}

    }, options );

    Tandem.validateOptions( options ); // The tandem is required when brand==='phet-io'

    // @public
    this.enabledProperty = options.enabledProperty;
    this.enabledRangeProperty = options.enabledRangeProperty;

    // @private options needed by prototype functions that add ticks
    this.tickOptions = _.pick( options, 'tickLabelSpacing',
      'majorTickLength', 'majorTickStroke', 'majorTickLineWidth',
      'minorTickLength', 'minorTickStroke', 'minorTickLineWidth' );

    // @private
    this._snapValue = options.snapValue;

    // @private ticks are added to these parents, so they are behind the knob
    thisSlider.majorTicksParent = new Node();
    thisSlider.minorTicksParent = new Node();
    thisSlider.addChild( thisSlider.majorTicksParent );
    thisSlider.addChild( thisSlider.minorTicksParent );

    // @private mapping between value and track position
    thisSlider.valueToPosition = new LinearFunction( range.min, range.max, 0, options.trackSize.width, true /* clamp */ );

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
    thisSlider.track = new HSliderTrack( valueProperty, thisSlider.valueToPosition, snapToValue, {

      // propagate options that are specific to HSliderTrack
      size: options.trackSize,
      fillEnabled: options.trackFillEnabled,
      fillDisabled: options.trackFillDisabled,
      stroke: options.trackStroke,
      lineWidth: options.trackLineWidth,
      enabledProperty: options.enabledProperty,
      startDrag: options.startDrag,
      endDrag: options.endDrag,
      snapValue: options.snapValue,
      constrainValue: options.constrainValue,

      // phet-io
      tandem: options.tandem && options.tandem.createTandem( 'sliderTrack' )
    } );
    thisSlider.track.centerX = thisSlider.valueToPosition( ( range.max + range.min ) / 2 );
    thisSlider.addChild( thisSlider.track );

    // thumb
    var thumbNode = options.thumbNode || new HSliderThumb( this.enabledProperty, {

        // propagate options that are specific to HSliderThumb
        size: options.thumbSize,
        fillEnabled: options.thumbFillEnabled,
        fillHighlighted: options.thumbFillHighlighted,
        fillDisabled: options.thumbFillDisabled,
        stroke: options.thumbStroke,
        lineWidth: options.thumbLineWidth,
        centerLineStroke: options.thumbCenterLineStroke,
        tandem: options.tandem && options.tandem.createTandem( 'thumbNode' )
      } );
    thumbNode.centerY = thisSlider.track.centerY;
    thisSlider.addChild( thumbNode );

    // Touch area for the default thumb. If a custom thumb is provided, the client is responsible for its touchArea.
    if ( !options.thumbNode ) {

      if ( options.thumbTouchAreaXDilation === null ) {
        options.thumbTouchAreaXDilation = 0.5 * thumbNode.width;
      }

      if ( options.thumbTouchAreaYDilation === null ) {
        options.thumbTouchAreaYDilation = 0.25 * thumbNode.height;
      }

      // touch area dilated along X and Y directions
      thumbNode.touchArea = thumbNode.bounds.dilatedXY( options.thumbTouchAreaXDilation, options.thumbTouchAreaYDilation );
    }

    // update value when thumb is dragged
    var clickXOffset = 0; // x-offset between initial click and thumb's origin
    var thumbInputListener = new TandemDragHandler( {

      tandem: options.tandem ? options.tandem.createTandem( 'thumbInputListener' ) : null,

      allowTouchSnag: true,

      start: function( event, trail ) {
        if ( thisSlider.enabledProperty.get() ) {
          options.startDrag();

          var transform = trail.subtrailTo( thisSlider ).getTransform();
          clickXOffset = transform.inversePosition2( event.pointer.point ).x - thumbNode.x;
        }
      },

      drag: function( event, trail ) {
        if ( thisSlider.enabledProperty.get() ) {
          var transform = trail.subtrailTo( thisSlider ).getTransform(); // we only want the transform to our parent
          var x = transform.inversePosition2( event.pointer.point ).x - clickXOffset;
          var newValue = thisSlider.valueToPosition.inverse( x );

          valueProperty.set( options.constrainValue( newValue ) );
        }
      },

      end: function() {
        if ( thisSlider.enabledProperty.get() ) {
          if ( typeof thisSlider._snapValue === 'number' ) {
            snapToValue( thisSlider._snapValue );
          }
          options.endDrag();
        }
      }
    } );
    thumbNode.addInputListener( thumbInputListener );

    //TODO This is experimental code. Decide how this affects data collection.
    // Keyboard accessibility
    thumbNode.addInputListener( {
      keydown: function( event, trail ) {
        if ( thisSlider.enabledProperty.get() ) {
          var keyCode = event.domEvent.keyCode;
          var delta = keyCode === Input.KEY_LEFT_ARROW || keyCode === Input.KEY_DOWN_ARROW ? -1 :
                      keyCode === Input.KEY_RIGHT_ARROW || keyCode === Input.KEY_UP_ARROW ? +1 :
                      0;
          var clampedValue = Util.clamp( valueProperty.get() + (range.max - range.min) * 0.1 * delta, range.min, range.max );
          valueProperty.set( options.constrainValue( clampedValue ) );
        }
      }
    } );

    // enable/disable
    var enabledObserver = function( enabled ) {
      thisSlider.cursor = thisSlider.enabledProperty.get() ? options.cursor : 'default';
      if ( !enabled ) {
        if ( thumbInputListener.dragging ) { thumbInputListener.endDrag(); }
      }
      thisSlider.pickable = enabled;
    };
    thisSlider.enabledProperty.link( enabledObserver ); // must be unlinked in disposeHSlider

    // update thumb location when value changes
    var valueObserver = function( value ) {
      thumbNode.centerX = thisSlider.valueToPosition( value );
    };
    valueProperty.link( valueObserver ); // must be unlinked in disposeHSlider

    // when the enabled range changes, the value to position linear function must change as well
    var enabledRangeObserver = function( enabledRange ) {

      assert && assert( enabledRange.min >= range.min && enabledRange.max <= range.max, 'enabledRange is out of range' );

      var initialValueToPosition = new LinearFunction( range.min, range.max, 0, options.trackSize.width, true /* clamp */ );
      var min = initialValueToPosition( enabledRange.min );
      var max = initialValueToPosition( enabledRange.max );

      // update the geometry of the enabled track
      thisSlider.track.updateEnabledTrackWidth( min, max );

      // update the function that maps value to position for the track and the slider
      thisSlider.valueToPosition = new LinearFunction( enabledRange.min, enabledRange.max, min, max, true /* clamp */ );
      thisSlider.track.valueToPosition = thisSlider.valueToPosition;

      // clamp the value to the enabled range if it changes
      valueProperty.set( Util.clamp( valueProperty.value, enabledRange.min, enabledRange.max ) );
    };
    this.enabledRangeProperty.link( enabledRangeObserver ); // needs to be unlinked in dispose function

    // @private Called by dispose
    this.disposeHSlider = function() {
      thumbNode.dispose && thumbNode.dispose(); // in case a custom thumb is provided via options.thumbNode that doesn't implement dispose
      thisSlider.track.dispose();
      valueProperty.unlink( valueObserver );
      thisSlider.enabledRangeProperty.unlink( enabledRangeObserver );
      thisSlider.enabledProperty.unlink( enabledObserver );
      options.tandem && options.tandem.removeInstance( thisSlider );
      thumbInputListener.dispose();
    };

    thisSlider.mutate( options );

    options.tandem && options.tandem.addInstance( this, THSlider );
  }

  sun.register( 'HSlider', HSlider );

  inherit( Node, HSlider, {

    // @public - ensures that this object is eligible for GC
    dispose: function() {
      this.disposeHSlider();
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