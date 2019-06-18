// Copyright 2016-2019, University of Colorado Boulder

/**
 * Shows a track on a slider.  Must be supplied a Node for rendering the track.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Dimension2 = require( 'DOT/Dimension2' );
  const LinearFunction = require( 'DOT/LinearFunction' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Property = require( 'AXON/Property' );
  const Range = require( 'DOT/Range' );
  const SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  const sun = require( 'SUN/sun' );
  const Tandem = require( 'TANDEM/Tandem' );

  class SliderTrack extends Node {

    /**
     * @param {Node} trackNode
     * @param {Property.<number>} valueProperty
     * @param {Range} range
     * @param {Object} [options]
     */
    constructor( trackNode, valueProperty, range, options ) {
      super();

      options = _.extend( {
        size: new Dimension2( 100, 5 ),
        fillEnabled: 'white',
        fillDisabled: 'gray',
        stroke: 'black',
        lineWidth: 1,
        cornerRadius: 0,
        startDrag: _.noop, // called when a drag sequence starts
        endDrag: _.noop, // called when a drag sequence ends
        constrainValue: _.identity, // called before valueProperty is set
        enabledRangeProperty: new Property( new Range( range.min, range.max ) ), // Defaults to a constant range

        // phet-io
        tandem: Tandem.required
      }, options );

      // @public (read-only)
      this.size = options.size;

      // @private - linear function that maps property value to position along the track.  Set after construction and
      // if/when the function changes.
      this.valueToPosition = new LinearFunction( range.min, range.max, 0, this.size.width, true /* clamp */ );

      // click in the track to change the value, continue dragging if desired
      const handleTrackEvent = ( event, trail ) => {
        assert && assert( this.valueToPosition, 'valueToPosition should be defined' );
        const transform = trail.subtrailTo( this ).getTransform();
        const x = transform.inversePosition2( event.pointer.point ).x;
        const value = this.valueToPosition.inverse( x );
        const newValue = options.constrainValue( value );
        valueProperty.set( newValue );
      };

      this.addChild( trackNode );

      const trackInputListener = new SimpleDragHandler( {
        tandem: options.tandem.createTandem( 'trackInputListener' ),

        start: function( event, trail ) {
          options.startDrag( event );
          handleTrackEvent( event, trail );
        },

        drag: function( event, trail ) {

          // Reuse the same handleTrackEvent but make sure the startedCallbacks call is made before the value changes
          handleTrackEvent( event, trail );
        },

        end: function( event ) {
          options.endDrag( event );
        }
      } );
      trackNode.addInputListener( trackInputListener );

      // @protected - maps the full range to the full width
      this.fullRangeValueToPosition = new LinearFunction( range.min, range.max, 0, this.size.width, true /* clamp */ );

      // when the enabled range changes, the value to position linear function must change as well
      const enabledRangeObserver = enabledRange => {
        assert && assert( range.containsRange( enabledRange ), 'enabledRange is out of range' );
        const min = this.fullRangeValueToPosition( enabledRange.min );
        const max = this.fullRangeValueToPosition( enabledRange.max );

        // update the function that maps value to position for the track and the slider
        this.valueToPosition = new LinearFunction( enabledRange.min, enabledRange.max, min, max, true /* clamp */ );
      };
      options.enabledRangeProperty.link( enabledRangeObserver ); // needs to be unlinked in dispose function

      // @private Called by dispose
      this.disposeSliderTrack = () => {
        trackInputListener.dispose();
        options.enabledRangeProperty.unlink( enabledRangeObserver );
      };
    }

    /**
     * Sets the function that converts a model value to a slider and track position.
     * @param {LinearFunction} valueToPosition
     * @public
     */
    setValueToPositionFunction( valueToPosition ) {
      assert && assert( valueToPosition, 'valueToPosition should be defined' );
      this.valueToPosition = valueToPosition;
    }

    // @public - ensures that this object is eligible for GC
    dispose() {
      this.disposeSliderTrack();
      super.dispose();
    }
  }

  return sun.register( 'SliderTrack', SliderTrack );
} );