// Copyright 2002-2013, University of Colorado Boulder

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
  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearFunction = require( 'DOT/LinearFunction' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Input = require( 'SCENERY/input/Input' );
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
      thumbNode: null,
      // default thumb (ignored if thumbNode is provided)
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
      startDrag: function() {}, // called when a drag sequence starts
      endDrag: function() {}, // called when a drag sequence ends
      //together
      componentID: null
    }, options );
    this.options = options; // @private TODO save only the options that are needed by prototype functions
    this.componentID = options.componentID;

    // @private ticks are added to this parent, so they are behind knob
    thisSlider.ticksParent = new Node();
    thisSlider.addChild( thisSlider.ticksParent );

    // @private mapping between value and track position
    thisSlider.valueToPosition = new LinearFunction( range.min, range.max, 0, options.trackSize.width, true /* clamp */ );

    // @private track
    thisSlider.track = new Rectangle( 0, 0, options.trackSize.width, options.trackSize.height,
      { fill: options.trackFill, stroke: options.trackStroke, lineWidth: options.trackLineWidth } );
    thisSlider.addChild( thisSlider.track );

    // click in the track to change the value, continue dragging if desired
    var trackHandler = new SimpleDragHandler( {
      handleTrackEvent: function( event, trail ) {
        if ( options.enabledProperty.get() ) {
          var transform = trail.subtrailTo( thisSlider ).getTransform();
          var x = transform.inversePosition2( event.pointer.point ).x;
          valueProperty.set( thisSlider.valueToPosition.inverse( x ) );
        }
      },
      start: function( event, trail ) {
        if ( options.enabledProperty.get() ) {
          options.startDrag();
        }
        this.handleTrackEvent( event, trail );
      },
      drag: function( event, trail ) {
        this.handleTrackEvent( event, trail );
      },
      end: function() {
        if ( options.enabledProperty.get() ) {
          options.endDrag();
        }
      }
    } );
    thisSlider.track.addInputListener( trackHandler );

    // thumb
    var thumb = options.thumbNode || new ThumbNode( options );

    // Make the thumb focusable for keyboard accessibility 
    thumb.focusable = true;

    thisSlider.thumb = thumb; // must be disposed of
    thumb.centerY = thisSlider.track.centerY;
    thisSlider.addChild( thumb );

    // Keyboard accessibility
    thumb.addInputListener( {
      keydown: function( event, trail ) {
        var keyCode = event.domEvent.keyCode;
        var delta = keyCode === Input.KEY_LEFT_ARROW || keyCode === Input.KEY_DOWN_ARROW ? -1 :
                    keyCode === Input.KEY_RIGHT_ARROW || keyCode === Input.KEY_UP_ARROW ? +1 :
                    0;
        valueProperty.set( Util.clamp( valueProperty.get() + (range.max - range.min) * 0.1 * delta, range.min, range.max ) );
      }
    } );

    // thumb touch area
    if ( !options.thumbNode ) {
      var dx = 0.5 * thumb.width;
      var dy = 0.25 * thumb.height;
      thumb.touchArea = Shape.rectangle( ( -thumb.width / 2 ) - dx, ( -thumb.height / 2 ) - dy, thumb.width + dx + dx, thumb.height + dy + dy );
    }

    // update value when thumb is dragged
    var thumbHandler = new SimpleDragHandler( {

      // x-offset between initial click and thumb's origin
      clickXOffset: 0,

      allowTouchSnag: true,

      start: function( event, trail ) {
        if ( options.enabledProperty.get() ) {
          var messageIndex = arch && arch.start( 'user', thisSlider.componentID, 'dragStarted', { value: valueProperty.get() } );
          options.startDrag();

          var transform = trail.subtrailTo( thisSlider ).getTransform();
          this.clickXOffset = transform.inversePosition2( event.pointer.point ).x - thumb.x;

          arch && arch.end( messageIndex );
        }
      },

      drag: function( event, trail ) {
        if ( options.enabledProperty.get() ) {
          var transform = trail.subtrailTo( thisSlider ).getTransform(); // we only want the transform to our parent
          var x = transform.inversePosition2( event.pointer.point ).x - this.clickXOffset;
          var newValue = thisSlider.valueToPosition.inverse( x );

          var messageIndex = arch && arch.start( 'user', thisSlider.componentID, 'dragged', { value: newValue } );
          valueProperty.set( newValue );
          arch && arch.end( messageIndex );
        }
      },

      end: function() {
        if ( options.enabledProperty.get() ) {
          var messageIndex = arch && arch.start( 'user', thisSlider.componentID, 'dragEnded', { value: valueProperty.get() } );
          options.endDrag();
          arch && arch.end( messageIndex );
        }
      }
    } );
    thumb.addInputListener( thumbHandler );

    // @private enable/disable
    thisSlider.enabledObserver = function( enabled ) {
      thisSlider.cursor = options.enabledProperty.get() ? options.cursor : 'default';
      if ( !enabled ) {
        if ( thumbHandler.dragging ) { thumbHandler.endDrag(); }
        if ( trackHandler.dragging ) { trackHandler.endDrag(); }
      }
    };
    thisSlider.enabledProperty = options.enabledProperty; // @private
    thisSlider.enabledProperty.link( thisSlider.enabledObserver ); // must be unlinked in dispose

    // @private update thumb location when value changes
    thisSlider.valueObserver = function( value ) {
      thumb.centerX = thisSlider.valueToPosition( value );
    };
    thisSlider.valueProperty = valueProperty; // @private
    thisSlider.valueProperty.link( thisSlider.valueObserver ); // must be unlinked in dispose

    thisSlider.mutate( options );

    together && together.addComponent( this );
  }

  inherit( Node, HSlider, {

    // Ensures that this object is eligible for GC.
    dispose: function() {
      this.thumb.dispose();
      this.thumb = null;
      this.valueProperty.unlink( this.valueObserver );
      this.enabledProperty.unlink( this.enabledObserver );
    },

    /**
     * Adds a major tick mark.
     * @param {number} value
     * @param {Node} label optional
     */
    addMajorTick: function( value, label ) {
      this.addTick( value, label, this.options.majorTickLength, this.options.majorTickStroke, this.options.majorTickLineWidth );
    },

    /**
     * Adds a minor tick mark.
     * @param {number} value
     * @param {Node} label optional
     */
    addMinorTick: function( value, label ) {
      this.addTick( value, label, this.options.minorTickLength, this.options.minorTickStroke, this.options.minorTickLineWidth );
    },

    /*
     * Adds a tick mark above the track.
     * @param {number} value
     * @param {Node} label optional
     * @param {number} length
     * @param {number} stroke
     * @param {number} lineWidth
     * @private
     */
    addTick: function( value, label, length, stroke, lineWidth ) {
      var labelX = this.valueToPosition( value );
      // ticks
      var tick = new Path( new Shape()
          .moveTo( labelX, this.track.top )
          .lineTo( labelX, this.track.top - length ),
        { stroke: stroke, lineWidth: lineWidth } );
      this.ticksParent.addChild( tick );
      // label
      if ( label ) {
        this.ticksParent.addChild( label );
        label.centerX = tick.centerX;
        label.bottom = tick.top - this.options.tickLabelSpacing;
      }
    }
  } );

  /**
   * Default thumb, a rectangle with a vertical white line down the center
   * @param {Object} [options] see HSlider constructor
   * @constructor
   */
  function ThumbNode( options ) {

    assert && assert( options ); // these are options provided to HSlider, not optional for this inner type

    var thisNode = this;

    // rectangle
    var arcWidth = 0.25 * options.thumbSize.width;
    Rectangle.call( thisNode,
      -options.thumbSize.width / 2, -options.thumbSize.height / 2,
      options.thumbSize.width, options.thumbSize.height,
      arcWidth, arcWidth,
      {
        fill: options.enabledProperty.get() ? options.thumbFillEnabled : options.thumbFillDisabled,
        stroke: options.thumbStroke,
        lineWidth: options.thumbLineWidth
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
        if ( options.enabledProperty.get() ) { thisNode.fill = options.thumbFillHighlighted; }
      },
      up: function( event ) {
        if ( options.enabledProperty.get() ) { thisNode.fill = options.thumbFillEnabled; }
      }
    } ) );

    // @private enable/disable the look of the thumb
    this.enabledObserver = function( enabled ) {
      thisNode.fill = enabled ? options.thumbFillEnabled : options.thumbFillDisabled;
    };
    this.enabledProperty = options.enabledProperty; // @private
    this.enabledProperty.link( this.enabledObserver ); // must be unlinked in dispose
  }

  inherit( Rectangle, ThumbNode, {

    // Ensures that this object is eligible for GC.
    dispose: function() {
      this.enabledProperty.unlink( this.enabledObserver );
    }
  } );

  return HSlider;
} );