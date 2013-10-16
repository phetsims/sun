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

  // imports
  var Dimension2 = require( 'DOT/Dimension2' );
  var FillHighlightListener = require( 'SCENERY_PHET/input/FillHighlightListener' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearFunction = require( 'DOT/LinearFunction' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );

  /**
   * @param {Property<Number>} valueProperty
   * @param { {min:Number, max:Number} } range
   * @param {*} options
   * @constructor
   */
  function HSlider( valueProperty, range, options ) {

    var thisSlider = this;
    Node.call( thisSlider );

    // default options, these will not be passed to supertype
    var defaultOptions = {
      // track
      trackSize: new Dimension2( 100, 5 ),
      trackFill: 'white',
      trackStroke: 'black',
      trackLineWidth: 1,
      // thumb
      thumbSize: new Dimension2( 22, 45 ),
      thumbFillEnabled: 'rgb(50,145,184)',
      thumbFillHighlighted: 'rgb(71,207,255)',
      thumbFillDisabled: '#F0F0F0',
      thumbStroke: 'black',
      thumbLineWidth: 1,
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
      endDrag: function() { /* do nothing */ } // called when thumb is released at end of drag sequence
    };

    // fill in options with defaults
    thisSlider._options = _.extend( defaultOptions, options );

    // ticks are added to this parent, so they are behind knob
    thisSlider._ticksParent = new Node();
    thisSlider.addChild( thisSlider._ticksParent );

    // mapping between value and track position
    thisSlider._valueToPosition = new LinearFunction( range.min, range.max, 0, this._options.trackSize.width, true /* clamp */ );

    // track
    thisSlider._track = new Rectangle( 0, 0, thisSlider._options.trackSize.width, thisSlider._options.trackSize.height,
      { fill: thisSlider._options.trackFill, stroke: thisSlider._options.trackStroke, lineWidth: thisSlider._options.trackLineWidth } );
    thisSlider.addChild( thisSlider._track );

    // click in the track to change the value, continue dragging if desired
    var trackHandler = new SimpleDragHandler( {
      handleTrackEvent: function( event ) {
        if ( thisSlider._options.enabledProperty.get() ) {
          var x = thisSlider._track.globalToLocalPoint( event.pointer.point ).x;
          valueProperty.set( thisSlider._valueToPosition.inverse( x ) );
        }
      },
      start: function( event ) {
        this.handleTrackEvent( event );
      },
      drag: function( event ) {
        this.handleTrackEvent( event );
      },
      end: function() {
        if ( thisSlider._options.enabledProperty.get() ) {
          thisSlider._options.endDrag();
        }
      }
    } );
    thisSlider._track.addInputListener( trackHandler );

    // thumb, points up
    var arcWidth = 0.25 * this._options.thumbSize.width;
    var thumbFill = thisSlider._options.enabledProperty.get() ? thisSlider._options.thumbFillEnabled : thisSlider._options.thumbFillDisabled;
    var thumb = new Rectangle( -thisSlider._options.thumbSize.width / 2, -thisSlider._options.thumbSize.height / 2, thisSlider._options.thumbSize.width, thisSlider._options.thumbSize.height, arcWidth, arcWidth,
      { cursor: thisSlider._options.cursor, fill: thumbFill, stroke: thisSlider._options.thumbStroke, lineWidth: thisSlider._options.thumbLineWidth } );
    var centerLineYMargin = 3;
    thumb.addChild( new Path( Shape.lineSegment( 0, -( thisSlider._options.thumbSize.height / 2 ) + centerLineYMargin, 0, ( thisSlider._options.thumbSize.height / 2 ) - centerLineYMargin ), { stroke: 'white' } ) );
    thumb.centerY = thisSlider._track.centerY;
    thisSlider.addChild( thumb );

    // thumb touch area
    var dx = 0.5 * thumb.width;
    var dy = 0.25 * thumb.height;
    thumb.touchArea = Shape.rectangle( ( -thumb.width / 2 ) - dx, ( -thumb.height / 2 ) - dy, thumb.width + dx + dx, thumb.height + dy + dy );

    // highlight on mouse enter
    thumb.addInputListener( new FillHighlightListener( thisSlider._options.thumbFillEnabled, thisSlider._options.thumbFillHighlighted, thisSlider._options.enabledProperty ) );

    // update value when thumb is dragged
    var thumbHandler = new SimpleDragHandler( {
      clickXOffset: 0, // x-offset between initial click and thumb's origin
      allowTouchSnag: true,
      start: function( event ) {
        this.clickXOffset = thumb.globalToParentPoint( event.pointer.point ).x - thumb.x;
      },
      drag: function( event ) {
        if ( thisSlider._options.enabledProperty.get() ) {
          var x = thumb.globalToParentPoint( event.pointer.point ).x - this.clickXOffset;
          valueProperty.set( thisSlider._valueToPosition.inverse( x ) );
        }
      },
      end: function() {
        if ( thisSlider._options.enabledProperty.get() ) {
          thisSlider._options.endDrag();
        }
      }
    } );
    thumb.addInputListener( thumbHandler );

    // enable/disable thumb
    thisSlider._options.enabledProperty.link( function( enabled ) {
      thumb.fill = enabled ? thisSlider._options.thumbFillEnabled : thisSlider._options.thumbFillDisabled;
      thumb.cursor = enabled ? 'pointer' : 'default';
      if ( !enabled ) {
        if ( thumbHandler.dragging ) { thumbHandler.endDrag(); }
        if ( trackHandler.dragging ) { trackHandler.endDrag(); }
      }
    } );

    // update thumb location when value changes
    valueProperty.link( function( value ) {
      thumb.centerX = thisSlider._valueToPosition( value );
    } );

    thisSlider.mutate( _.omit( thisSlider._options, Object.keys( defaultOptions ) ) );
  }

  inherit( Node, HSlider, {

    /**
     * Adds a major tick mark.
     * @param {Number} value
     * @param {Node} label optional
     */
    addMajorTick: function( value, label ) {
      this._addTick( value, label, this._options.majorTickLength, this._options.majorTickStroke, this._options.majorTickLineWidth );
    },

    /**
     * Adds a minor tick mark.
     * @param {Number} value
     * @param {Node} label optional
     */
    addMinorTick: function( value, label ) {
      this._addTick( value, label, this._options.minorTickLength, this._options.minorTickStroke, this._options.minorTickLineWidth );
    },

    /*
     * Adds a tick mark above the track.
     * @param {Number} value
     * @param {Node} label optional
     * @param {Number} length
     * @param {Number} stroke
     * @param {Number} lineWidth
     */
    _addTick: function( value, label, length, stroke, lineWidth ) {
      var labelX = this._valueToPosition( value );
      // ticks
      var tick = new Path( new Shape()
        .moveTo( labelX, this._track.top )
        .lineTo( labelX, this._track.top - length ),
        { stroke: stroke, lineWidth: lineWidth } );
      this._ticksParent.addChild( tick );
      // label
      if ( label ) {
        this._ticksParent.addChild( label );
        label.centerX = tick.centerX;
        label.bottom = tick.top - this._options.tickLabelSpacing;
      }
    }
  } );

  return HSlider;
} );