// Copyright 2002-2013, University of Colorado Boulder

/**
 * Horizontal slider.
 * Optionally snaps to min when released.
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
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );

  // thumb constants
  var THUMB_SIZE = new Dimension2( 22, 45 );
  var THUMB_FILL_ENABLED = 'rgb(50,145,184)';
  var THUMB_FILL_HIGHLIGHTED = 'rgb(71,207,255)';
  var THUMB_FILL_DISABLED = '#F0F0F0';

  // tick constants
  var MAJOR_TICK_LENGTH = 30;
  var MINOR_TICK_LENGTH = 16;

  /**
   * @param {Range} range
   * @param {Dimension2} trackSize
   * @param {Property<Number>} value
   * @param {Property<Boolean>} enabled
   * @param {*} options
   * @constructor
   */
  function HSlider( range, trackSize, value, enabled, options ) {

    // options
    options = _.extend( {
      snapToMinWhenReleased: true
    }, options );

    var thisSlider = this;
    Node.call( thisSlider );

    // ticks are added to this parent, so they are behind knob
    thisSlider._ticksParent = new Node();
    thisSlider.addChild( thisSlider._ticksParent );

    // track
    thisSlider._track = new Rectangle( 0, 0, trackSize.width, trackSize.height, { fill: 'white', stroke: 'black', lineWidth: 1 } );
    thisSlider.addChild( thisSlider._track );

    // thumb, points up
    var arcWidth = 0.25 * THUMB_SIZE.width;
    var thumb = new Rectangle( -THUMB_SIZE.width / 2, -THUMB_SIZE.height / 2, THUMB_SIZE.width, THUMB_SIZE.height, arcWidth, arcWidth,
      { cursor: 'pointer', fill: THUMB_FILL_ENABLED, stroke: 'black', lineWidth: 1 } );
    var centerLineYMargin = 3;
    thumb.addChild( new Path( Shape.lineSegment( 0, -( THUMB_SIZE.height / 2 ) + centerLineYMargin, 0, ( THUMB_SIZE.height / 2 ) - centerLineYMargin ), { stroke: 'white' } ) );
    thumb.centerY = thisSlider._track.centerY;
    thisSlider.addChild( thumb );

    // thumb touch area
    var dx = 0.5 * thumb.width;
    var dy = 0.25 * thumb.height;
    thumb.touchArea = Shape.rectangle( ( -thumb.width / 2 ) - dx, ( -thumb.height / 2 ) - dy, thumb.width + dx + dx, thumb.height + dy + dy );

    // mapping between value and track position
    thisSlider._valueToPosition = new LinearFunction( range.min, range.max, 0, trackSize.width, true /* clamp */ );

    // highlight on mouse enter
    thumb.addInputListener( new FillHighlightListener( THUMB_FILL_ENABLED, THUMB_FILL_HIGHLIGHTED, enabled ) );

    // update value when thumb is dragged
    var clickXOffset = 0; // x-offset between initial click and thumb's origin
    var dragHandler = new SimpleDragHandler( {
      allowTouchSnag: true,
      start: function( event ) {
        clickXOffset = thumb.globalToParentPoint( event.pointer.point ).x - thumb.x;
      },
      drag: function( event ) {
        if ( enabled.get() ) {
          var x = thumb.globalToParentPoint( event.pointer.point ).x - clickXOffset;
          value.set( thisSlider._valueToPosition.inverse( x ) );
        }
      },
      end: function() {
        if ( options.snapToMinWhenReleased ) {
          value.set( range.min );
        }
      },
      translate: function() {
      }
    } );
    thumb.addInputListener( dragHandler );

    // enable/disable thumb
    enabled.link( function( enabled ) {
      thumb.fill = enabled ? THUMB_FILL_ENABLED : THUMB_FILL_DISABLED;
      thumb.cursor = enabled ? 'pointer' : 'default';
      if ( !enabled && dragHandler.dragging ) {
        dragHandler.endDrag();
      }
    } );

    // update thumb location when value changes
    value.link( function( value ) {
      thumb.centerX = thisSlider._valueToPosition( value );
    } );
  }

  inherit( Node, HSlider, {

    /**
     * Adds a major tick mark.
     * @param {Number} value
     * @param {Node} label optional
     */
    addMajorTick: function( value, label ) {
      this._addTick( MAJOR_TICK_LENGTH, value, label );
    },

    /**
     * Adds a minor tick mark.
     * @param {Number} value
     * @param {Node} label optional
     */
    addMinorTick: function( value, label ) {
      this._addTick( MINOR_TICK_LENGTH, value, label );
    },

    /*
     * Adds a tick mark above the track.
     * @param {Number} tickLength
     * @param {Number} value
     * @param {Node} label optional
     */
    _addTick: function( tickLength, value, label ) {
      var labelX = this._valueToPosition( value );
      // ticks
      var tick = new Path(
        new Shape()
          .moveTo( labelX, this._track.top )
          .lineTo( labelX, this._track.bottom - tickLength ),
        {
          lineWidth: 1,
          stroke: 'black'
        } );
      this._ticksParent.addChild( tick );
      // label
      if ( label ) {
        this._ticksParent.addChild( label );
        label.centerX = tick.centerX;
        label.bottom = tick.top - 6;
      }
    }
  } );

  return HSlider;
} );