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
  const merge = require( 'PHET_CORE/merge' );
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

      options = merge( {
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

      // @public (read-only) - maps the value along the range of the track to the position along the width of the track
      this.valueToPosition = new LinearFunction( range.min, range.max, 0, this.size.width, true /* clamp */ );

      // click in the track to change the value, continue dragging if desired
      const handleTrackEvent = ( event, trail ) => {
        assert && assert( this.valueToPosition, 'valueToPosition should be defined' );
        const transform = trail.subtrailTo( this ).getTransform();
        const x = transform.inversePosition2( event.pointer.point ).x;
        const value = this.valueToPosition.inverse( x );
        const valueInRange = options.enabledRangeProperty.value.constrainValue( value );
        const newValue = options.constrainValue( valueInRange );
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

      // @private Called by dispose
      this.disposeSliderTrack = () => {
        trackInputListener.dispose();
      };
    }

    // @public - ensures that this object is eligible for GC
    dispose() {
      this.disposeSliderTrack();
      super.dispose();
    }
  }

  return sun.register( 'SliderTrack', SliderTrack );
} );