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
define( require => {
  'use strict';

  // modules
  const Dimension2 = require( 'DOT/Dimension2' );
  const EventType = require( 'TANDEM/EventType' );
  const inherit = require( 'PHET_CORE/inherit' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const OnOffSwitchIO = require( 'SUN/OnOffSwitchIO' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Shape = require( 'KITE/Shape' );
  const SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  const sun = require( 'SUN/sun' );
  const Tandem = require( 'TANDEM/Tandem' );
  const Util = require( 'DOT/Util' );
  const Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {Property.<boolean>} onProperty
   * @param {Object} [options]
   * @constructor
   */
  function OnOffSwitch( onProperty, options ) {

    options = merge( {

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
      phetioEventType: EventType.USER
    }, options );

    const self = this;

    Node.call( this );

    const cornerRadius = options.size.height / 2;

    // @private track that the thumb slides in
    this.trackNode = new Rectangle( 0, 0, options.size.width, options.size.height, cornerRadius, cornerRadius, {
      fill: options.trackOffFill,
      stroke: options.trackStroke,
      cachedPaints: [ options.trackOnFill, options.trackOffFill ]
    } );
    this.addChild( this.trackNode );

    // @private thumb (aka knob)
    this.thumbNode = new Rectangle( 0, 0, 0.5 * options.size.width, options.size.height, cornerRadius, cornerRadius, {
      fill: options.thumbFill,
      stroke: options.thumbStroke
    } );
    this.addChild( this.thumbNode );

    // thumb touchArea
    if ( options.thumbTouchAreaXDilation || options.thumbTouchAreaYDilation ) {
      this.thumbNode.touchArea = Shape.roundRect(
        -options.thumbTouchAreaXDilation, -options.thumbTouchAreaYDilation,
        ( 0.5 * options.size.width ) + ( 2 * options.thumbTouchAreaXDilation ),
        options.size.height + ( 2 * options.thumbTouchAreaYDilation ), cornerRadius, cornerRadius );
    }

    // thumb mouseArea
    if ( options.thumbMouseAreaXDilation || options.thumbMouseAreaYDilation ) {
      this.thumbNode.mouseArea = Shape.roundRect(
        -options.thumbMouseAreaXDilation, -options.thumbMouseAreaYDilation,
        ( 0.5 * options.size.width ) + ( 2 * options.thumbMouseAreaXDilation ),
        options.size.height + ( 2 * options.thumbMouseAreaYDilation ), cornerRadius, cornerRadius );
    }

    // move thumb to on or off position
    const updateThumb = function( on ) {
      if ( on ) {
        self.thumbNode.right = options.size.width;
        self.trackNode.fill = options.trackOnFill;
      }
      else {
        self.thumbNode.left = 0;
        self.trackNode.fill = options.trackOffFill;
      }
    };

    // sync with onProperty
    onProperty.link( updateThumb.bind( this ) );

    // thumb interactivity
    const dragThresholdSquared = options.dragThreshold * options.dragThreshold; // comparing squared magnitudes is a bit faster
    const accumulatedDelta = new Vector2( 0, 0 ); // stores how far we are from where our drag started, in our local coordinate frame
    let passedDragThreshold = false; // whether we have dragged far enough to be considered for "drag" behavior (pick closest side), or "tap" behavior (toggle)

    this.addInputListener( new SimpleDragHandler( {
      tandem: options.tandem.createTandem( 'simpleDragHandler' ),

      // only touch to snag when over the thumb (don't snag on the track itself)
      allowTouchSnag: function( evt ) {
        return _.includes( evt.trail.nodes, self.thumbNode );
      },

      start: function( evt, trail ) {
        // resets our state
        accumulatedDelta.setXY( 0, 0 ); // reset it mutably (less allocation)
        passedDragThreshold = false;
      },

      drag: function( evt, trail ) {
        // center the thumb on the pointer's x-coordinate if possible (but clamp to left and right ends)
        const viewPoint = evt.currentTarget.globalToLocalPoint( evt.pointer.point );
        const halfThumbWidth = self.thumbNode.width / 2;
        self.thumbNode.centerX = Util.clamp( viewPoint.x, halfThumbWidth, options.size.width - halfThumbWidth );

        // whether the thumb is dragged outside of the possible range far enough beyond our threshold to potentially
        // trigger an immediate model change
        const isDraggedOutside = viewPoint.x < ( 1 - 2 * options.toggleThreshold ) * halfThumbWidth ||
                               viewPoint.x > ( -1 + 2 * options.toggleThreshold ) * halfThumbWidth + options.size.width;

        const value = self.thumbPositionToValue(); // value represented by the current thumb position

        // track fill changes based on the thumb positions
        self.trackNode.fill = value ? options.trackOnFill : options.trackOffFill;

        if ( options.toggleWhileDragging === true || ( isDraggedOutside && options.toggleWhileDragging === null ) ) {

          // TODO: A way to distinguish between drag-to-toggle vs click-to-toggle

          // Only signify a change if the value actually changed to avoid duplicate messages in the PhET-iO Event
          // stream, see https://github.com/phetsims/phet-io/issues/369
          const changed = onProperty.get() !== value;
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
        const oldValue = onProperty.get();

        // if moved past the threshold, choose value based on the side, otherwise just toggle
        const newValue = passedDragThreshold ? self.thumbPositionToValue() : !onProperty.get();

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
