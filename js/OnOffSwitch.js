// Copyright 2014-2019, University of Colorado Boulder

/**
 * On/off switch, similar to iOS' UISwitch, used in iOS `'Settings' app.
 * Off (false) is to the left, on (true) is to the right.
 *
 * Interaction behavior is as follows:
 * Drag the thumb to change the value, or click anywhere to toggle the value.
 * If you click without dragging, it's a toggle.
 * If you drag but don't cross the midpoint of the track, then it's a toggle.
 * If you drag past the midpoint of the track, releasing the thumb snaps to whichever end the thumb is closest to.
 * If you drag the thumb far enough to the side (outside of the switch), it will immediately toggle the model behavior.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var OnOffSwitchIO = require( 'SUN/OnOffSwitchIO' );
  var PhetioObject = require( 'TANDEM/PhetioObject' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {Property.<boolean>} onProperty
   * @param {Object} [options]
   * @constructor
   */
  function OnOffSwitch( onProperty, options ) {

    options = _.extend( {

      size: new Dimension2( 60, 30 ), // if you want the thumb to be a circle, use width that is 2x height
      cursor: 'pointer',

      // controls the behavior of when model value changes occur during dragging (if any)
      // null (default: triggers model changes when thumb is dragged far enough to the side, similar to iOS)
      // true: triggers model changes whenever the thumb crosses sides
      // false: only trigger model changes until release
      toggleWhileDragging: null,

      // number of view-space units the drag needs to cover to be considered a "drag" instead of a "click/tap"
      dragThreshold: 3,

      // number of thumb-widths outside the normal range past where the model value will change
      toggleThreshold: 1,

      // thumb
      thumbFill: 'white',
      thumbStroke: 'black',
      thumbTouchAreaXDilation: 8,
      thumbTouchAreaYDilation: 8,
      thumbMouseAreaXDilation: 0,
      thumbMouseAreaYDilation: 0,

      // track
      trackOffFill: 'white', // track fill when onProperty is false
      trackOnFill: 'rgb(0,200,0)', // track fill when onProperty is true
      trackStroke: 'black',

      // phet-io
      tandem: Tandem.required,
      phetioType: OnOffSwitchIO,
      phetioEventType: PhetioObject.EventType.USER
    }, options );

    var self = this;
    Node.call( this );

    // track that the thumb slides in
    var cornerRadius = options.size.height / 2;
    var trackNode = this.trackNode = new Rectangle( 0, 0, options.size.width, options.size.height, cornerRadius, cornerRadius, {
      fill: options.trackOffFill,
      stroke: options.trackStroke,
      cachedPaints: [ options.trackOnFill, options.trackOffFill ]
    } );
    this.addChild( trackNode );

    // thumb (aka knob)
    var thumbNode = this.thumbNode = new Rectangle( 0, 0, 0.5 * options.size.width, options.size.height, cornerRadius, cornerRadius, {
      fill: options.thumbFill,
      stroke: options.thumbStroke
    } );
    this.addChild( thumbNode );

    // thumb touchArea
    if ( options.thumbTouchAreaXDilation || options.thumbTouchAreaYDilation ) {
      thumbNode.touchArea = Shape.roundRect(
        -options.thumbTouchAreaXDilation, -options.thumbTouchAreaYDilation,
        ( 0.5 * options.size.width ) + ( 2 * options.thumbTouchAreaXDilation ),
        options.size.height + ( 2 * options.thumbTouchAreaYDilation ), cornerRadius, cornerRadius );
    }

    // thumb mouseArea
    if ( options.thumbMouseAreaXDilation || options.thumbMouseAreaYDilation ) {
      thumbNode.mouseArea = Shape.roundRect(
        -options.thumbMouseAreaXDilation, -options.thumbMouseAreaYDilation,
        ( 0.5 * options.size.width ) + ( 2 * options.thumbMouseAreaXDilation ),
        options.size.height + ( 2 * options.thumbMouseAreaYDilation ), cornerRadius, cornerRadius );
    }

    // move thumb to on or off position
    var updateThumb = function( on ) {
      if ( on ) {
        thumbNode.right = options.size.width;
        trackNode.fill = options.trackOnFill;
      }
      else {
        thumbNode.left = 0;
        trackNode.fill = options.trackOffFill;
      }
    };

    // sync with onProperty
    onProperty.link( updateThumb.bind( this ) );

    // thumb interactivity
    var dragThresholdSquared = options.dragThreshold * options.dragThreshold; // comparing squared magnitudes is a bit faster
    var accumulatedDelta = new Vector2( 0, 0 ); // stores how far we are from where our drag started, in our local coordinate frame
    var passedDragThreshold = false; // whether we have dragged far enough to be considered for "drag" behavior (pick closest side), or "tap" behavior (toggle)

    this.addInputListener( new SimpleDragHandler( {
      tandem: options.tandem.createTandem( 'simpleDragHandler' ),

      // only touch to snag when over the thumb (don't snag on the track itself)
      allowTouchSnag: function( evt ) {
        return _.includes( evt.trail.nodes, thumbNode );
      },

      start: function( evt, trail ) {
        // resets our state
        accumulatedDelta.setXY( 0, 0 ); // reset it mutably (less allocation)
        passedDragThreshold = false;
      },

      drag: function( evt, trail ) {
        // center the thumb on the pointer's x-coordinate if possible (but clamp to left and right ends)
        var viewPoint = evt.currentTarget.globalToLocalPoint( evt.pointer.point );
        var halfThumbWidth = thumbNode.width / 2;
        thumbNode.centerX = Util.clamp( viewPoint.x, halfThumbWidth, options.size.width - halfThumbWidth );

        // whether the thumb is dragged outside of the possible range far enough beyond our threshold to potentially
        // trigger an immediate model change
        var isDraggedOutside = viewPoint.x < ( 1 - 2 * options.toggleThreshold ) * halfThumbWidth ||
                               viewPoint.x > ( -1 + 2 * options.toggleThreshold ) * halfThumbWidth + options.size.width;

        var value = self.thumbPositionToValue(); // value represented by the current thumb position

        // track fill changes based on the thumb positions
        trackNode.fill = value ? options.trackOnFill : options.trackOffFill;

        if ( options.toggleWhileDragging === true || ( isDraggedOutside && options.toggleWhileDragging === null ) ) {

          // TODO: A way to distinguish between drag-to-toggle vs click-to-toggle

          // Only signify a change if the value actually changed to avoid duplicate messages in the PhET-iO Event
          // stream, see https://github.com/phetsims/phet-io/issues/369
          var changed = onProperty.get() !== value;
          if ( changed ) {
            self.phetioStartEvent( 'toggled', {
              oldValue: !value,
              newValue: value
            } );
            onProperty.set( value );
            self.phetioEndEvent();
          }
        }
      },

      end: function( evt, trail ) {
        var oldValue = onProperty.get();

        // if moved past the threshold, choose value based on the side, otherwise just toggle
        var newValue = passedDragThreshold ? self.thumbPositionToValue() : !onProperty.get();

        self.phetioStartEvent( 'toggled', {
          oldValue: oldValue,
          newValue: newValue
        } );

        onProperty.set( newValue );

        // update the thumb location (sanity check that it's here, only needs to be run if passedDragThreshold===true)
        updateThumb( onProperty.get() );

        self.phetioEndEvent();
      },

      translate: function( params ) {
        accumulatedDelta.add( params.delta );
        passedDragThreshold = passedDragThreshold || ( accumulatedDelta.magnitudeSquared > dragThresholdSquared );
      }
    } ) );

    this.mutate( options );
  }

  sun.register( 'OnOffSwitch', OnOffSwitch );

  return inherit( Node, OnOffSwitch, {
    /*
     * Converts the thumb position to a boolean on/off value.
     * Off (false) is to the left, on (true) is to the right.
     */
    thumbPositionToValue: function() {
      return this.thumbNode.centerX > this.trackNode.centerX;
    }
  } );
} );
