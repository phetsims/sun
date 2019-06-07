// Copyright 2016-2019, University of Colorado Boulder

/**
 * A default slider track, currently intended for use only in Slider.
 *
 * SliderTrack is composed of two rectangles, one for the enabled section of the track and one for the disabled
 * section.  The enabled track rectangle sits on top of the disabled track so that the enabled range can be any
 * desired sub range of the full slider range.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Dimension2 = require( 'DOT/Dimension2' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  const sun = require( 'SUN/sun' );
  const Tandem = require( 'TANDEM/Tandem' );

  class SliderTrack extends Node {

    /**
     * @param {Property.<number>} valueProperty
     * @param {Object} [options]
     */
    constructor( valueProperty, options ) {
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

        // phet-io
        tandem: Tandem.required
      }, options );

      // @public (read-only)
      this.size = options.size;

      // @private - linear function that maps property value to position along the track.  Set after construction and
      // if/when the function changes.
      this.valueToPosition = null;

      // @private - Represents the disabled range of the slider, always visible and always the full range
      // of the slider so that when the enabled range changes we see the enabled sub-range on top of the
      // full range of the slider.
      this.disabledTrack = new Rectangle( 0, 0, this.size.width, this.size.height, {
        fill: options.fillDisabled,
        stroke: options.stroke,
        lineWidth: options.lineWidth,
        cornerRadius: options.cornerRadius,
        cursor: 'default'
      } );
      this.addChild( this.disabledTrack );

      // @private - Will change size depending on the enabled range of the slider.  On top so that we can see
      // the enabled sub-range of the slider.
      this.enabledTrack = new Rectangle( 0, 0, this.size.width, this.size.height, {
        fill: options.fillEnabled,
        stroke: options.stroke,
        lineWidth: options.lineWidth,
        cornerRadius: options.cornerRadius
      } );
      this.addChild( this.enabledTrack );

      // click in the track to change the value, continue dragging if desired
      const handleTrackEvent = ( event, trail ) => {
        assert && assert( this.valueToPosition, 'valueToPosition should be defined' );
        const transform = trail.subtrailTo( this ).getTransform();
        const x = transform.inversePosition2( event.pointer.point ).x;
        const value = this.valueToPosition.inverse( x );
        const newValue = options.constrainValue( value );
        valueProperty.set( newValue );
      };

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
      this.enabledTrack.addInputListener( trackInputListener );

      // @private Called by dispose
      this.disposeSliderTrack = () => trackInputListener.dispose();
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

    /**
     * Update the dimensions of the enabled track.
     *
     * @param  {number} minX - x value for the min position of the enabled range of the track
     * @param  {number} maxX - x value for the max position of the enabled range of the track
     */
    updateEnabledTrackWidth( minX, maxX ) {
      const enabledWidth = maxX - minX;
      this.enabledTrack.setRect( minX, 0, enabledWidth, this.size.height );
    }
  }

  return sun.register( 'SliderTrack', SliderTrack );
} );