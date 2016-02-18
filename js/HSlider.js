// Copyright 2013-2015, University of Colorado Boulder

/**
 * Horizontal slider.
 *
 * Moved from beers-law-lab/EvaporationSlider on 9/15/2013
 * see https://github.com/phetsims/sun/issues/9
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Input = require( 'SCENERY/input/Input' );
  var LinearFunction = require( 'DOT/LinearFunction' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var TandemDragHandler = require( 'SUN/TandemDragHandler' );
  var sun = require( 'SUN/sun' );
  var Util = require( 'DOT/Util' );

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
      trackFill: 'white',
      trackStroke: 'black',
      trackLineWidth: 1,
      // {Node} optional thumb, replaces the default. Client is responsible for highlighting and disabling. Centered in the track.
      // If you are using the default thumb, see ThumbNode constructor for additional pass-through options.
      thumbNode: null,
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
      startDrag: function() {}, // called when a drag sequence starts
      endDrag: function() {}, // called when a drag sequence ends
      constrainValue: function( value ) { return value; }, // called before valueProperty is set
      // tandem
      tandem: null
    }, options );
    this.options = options; // @private TODO save only the options that are needed by prototype functions
    this.enabledProperty = options.enabledProperty;

    // @private ticks are added to these parents, so they are behind the knob
    thisSlider.majorTicksParent = new Node();
    thisSlider.minorTicksParent = new Node();
    thisSlider.addChild( thisSlider.majorTicksParent );
    thisSlider.addChild( thisSlider.minorTicksParent );

    // @private mapping between value and track position
    thisSlider.valueToPosition = new LinearFunction( range.min, range.max, 0, options.trackSize.width, true /* clamp */ );

    // @private track
    thisSlider.track = new Rectangle( 0, 0, options.trackSize.width, options.trackSize.height,
      { fill: options.trackFill, stroke: options.trackStroke, lineWidth: options.trackLineWidth } );
    thisSlider.addChild( thisSlider.track );

    // click in the track to change the value, continue dragging if desired
    var handleTrackEvent = function( event, trail ) {
      if ( thisSlider.enabledProperty.get() ) {
        var transform = trail.subtrailTo( thisSlider ).getTransform();
        var x = transform.inversePosition2( event.pointer.point ).x;
        var value = thisSlider.valueToPosition.inverse( x );
        var newValue = options.constrainValue( value );
        valueProperty.set( newValue );
      }
    };
    var trackInputListener = new TandemDragHandler( {
      tandem: options.tandem ? options.tandem.createTandem( 'trackInputListener' ) : null,

      start: function( event, trail ) {
        if ( thisSlider.enabledProperty.get() ) {
          options.startDrag();
          handleTrackEvent( event, trail );
        }
      },

      drag: function( event, trail ) {

        // Reuse the same handleTrackEvent but make sure the startedCallbacks call is made before the value changes
        handleTrackEvent( event, trail );
      },

      end: function() {
        if ( thisSlider.enabledProperty.get() ) {
          options.endDrag();
        }
      }
    } );
    thisSlider.track.addInputListener( trackInputListener );

    // thumb
    var thumbNode = options.thumbNode || new ThumbNode( this.enabledProperty, options );

    thumbNode.centerY = thisSlider.track.centerY;
    thisSlider.addChild( thumbNode );

    // thumb touch area
    if ( !options.thumbNode ) {
      var dx = 0.5 * thumbNode.width;
      var dy = 0.25 * thumbNode.height;
      thumbNode.touchArea = Shape.rectangle( ( -thumbNode.width / 2 ) - dx, ( -thumbNode.height / 2 ) - dy, thumbNode.width + dx + dx, thumbNode.height + dy + dy );
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

    // @private enable/disable
    var enabledObserver = function( enabled ) {
      thisSlider.cursor = thisSlider.enabledProperty.get() ? options.cursor : 'default';
      if ( !enabled ) {
        if ( thumbInputListener.dragging ) { thumbInputListener.endDrag(); }
        if ( trackInputListener.dragging ) { trackInputListener.endDrag(); }
      }
    };
    thisSlider.enabledProperty.link( enabledObserver ); // must be unlinked in disposeHSlider

    // @private update thumb location when value changes
    var valueObserver = function( value ) {
      thumbNode.centerX = thisSlider.valueToPosition( value );
    };
    valueProperty.link( valueObserver ); // must be unlinked in disposeHSlider

    // @private Called by dispose
    this.disposeHSlider = function() {
      thumbNode.dispose && thumbNode.dispose(); // in case a custom thumb is provided via options.thumbNode that doesn't implement dispose
      valueProperty.unlink( valueObserver );
      thisSlider.enabledProperty.unlink( enabledObserver );
      options.tandem && options.tandem.removeInstance( thisSlider );
      trackInputListener.dispose();
      thumbInputListener.dispose();
    };

    thisSlider.mutate( options );

    options.tandem && options.tandem.addInstance( this );
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
      this.addTick( this.majorTicksParent, value, label, this.options.majorTickLength, this.options.majorTickStroke, this.options.majorTickLineWidth );
    },

    /**
     * Adds a minor tick mark.
     * @param {number} value
     * @param {Node} [label] optional
     * @public
     */
    addMinorTick: function( value, label ) {
      this.addTick( this.minorTicksParent, value, label, this.options.minorTickLength, this.options.minorTickStroke, this.options.minorTickLineWidth );
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
        label.bottom = tick.top - this.options.tickLabelSpacing;
      }
    },

    // @public
    setEnabled: function( enabled ) { this.enabledProperty.value = enabled; },
    set enabled( value ) { this. setEnabled( value ); },

    // @public
    getEnabled: function() { return this.enabledProperty.value; },
    get enabled() { return this.getEnabled(); },

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

  /**
   * Default thumb, a rectangle with a vertical white line down the center
   * @param {Property.<boolean>} enabledProperty
   * @param {Object} [options] see HSlider constructor
   * @constructor
   * @private
   */
  function ThumbNode( enabledProperty, options ) {

    options = _.extend( {
      // default thumb (ignored if thumbNode is provided)
      thumbSize: new Dimension2( 22, 45 ),
      thumbFillEnabled: 'rgb(50,145,184)',
      thumbFillHighlighted: 'rgb(71,207,255)',
      thumbFillDisabled: '#F0F0F0',
      thumbStroke: 'black',
      thumbLineWidth: 1,
      thumbCenterLineStroke: 'white'
    }, options );

    var thisNode = this;

    // rectangle
    var arcWidth = 0.25 * options.thumbSize.width;
    Rectangle.call( thisNode,
      -options.thumbSize.width / 2, -options.thumbSize.height / 2,
      options.thumbSize.width, options.thumbSize.height,
      arcWidth, arcWidth,
      {
        fill: enabledProperty.get() ? options.thumbFillEnabled : options.thumbFillDisabled,
        stroke: options.thumbStroke,
        lineWidth: options.thumbLineWidth,
        cachedPaints: [
          options.thumbFillHighlighted, options.thumbFillEnabled, options.thumbFillDisabled
        ]
      } );

    // vertical line down the center
    var centerLineYMargin = 3;
    thisNode.addChild( new Path( Shape.lineSegment(
      0, -( options.thumbSize.height / 2 ) + centerLineYMargin,
      0, ( options.thumbSize.height / 2 ) - centerLineYMargin ),
      { stroke: options.thumbCenterLineStroke } ) );

    // highlight thumb on pointer over
    thisNode.addInputListener( new ButtonListener( {
      over: function( event ) {
        if ( enabledProperty.get() ) { thisNode.fill = options.thumbFillHighlighted; }
      },
      up: function( event ) {
        if ( enabledProperty.get() ) { thisNode.fill = options.thumbFillEnabled; }
      }
    } ) );

    // @private enable/disable the look of the thumb
    var enabledObserver = function( enabled ) {
      thisNode.fill = enabled ? options.thumbFillEnabled : options.thumbFillDisabled;
    };
    enabledProperty.link( enabledObserver ); // must be unlinked in disposeThumbNode

    // @private Called by dispose
    this.disposeThumbNode = function() {
      enabledProperty.unlink( enabledObserver );
    };
  }

  sun.register( 'HSlider.ThumbNode', ThumbNode );

  inherit( Rectangle, ThumbNode, {

    // @public - Ensures that this object is eligible for GC.
    dispose: function() {
      this.disposeThumbNode();
    }
  } );

  return HSlider;
} );