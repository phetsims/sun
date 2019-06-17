// Copyright 2016-2019, University of Colorado Boulder

/**
 * DefaultSliderTrack is composed of two rectangles, one for the enabled section of the track and one for the disabled
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
  const LinearFunction = require( 'DOT/LinearFunction' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const SliderTrack = require( 'SUN/SliderTrack' );
  const sun = require( 'SUN/sun' );
  const Tandem = require( 'TANDEM/Tandem' );

  class DefaultSliderTrack extends SliderTrack {

    /**
     * @param {Property.<number>} valueProperty
     * @param {Range} range
     * @param {Object} [options]
     */
    constructor( valueProperty, range, options ) {

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
        enabledRangeProperty: null,

        // phet-io
        tandem: Tandem.required
      }, options );

      // @private - Represents the disabled range of the slider, always visible and always the full range
      // of the slider so that when the enabled range changes we see the enabled sub-range on top of the
      // full range of the slider.
      const disabledTrack = new Rectangle( 0, 0, options.size.width, options.size.height, {
        fill: options.fillDisabled,
        stroke: options.stroke,
        lineWidth: options.lineWidth,
        cornerRadius: options.cornerRadius,
        cursor: 'default',
        pickable: false
      } );

      // @private - Will change size depending on the enabled range of the slider.  On top so that we can see
      // the enabled sub-range of the slider.
      const enabledTrack = new Rectangle( 0, 0, options.size.width, options.size.height, {
        fill: options.fillEnabled,
        stroke: options.stroke,
        lineWidth: options.lineWidth,
        cornerRadius: options.cornerRadius
      } );

      const trackNode = new Node( {
        children: [ disabledTrack, enabledTrack ]
      } );
      super( trackNode, valueProperty, range, options );

      this.enabledTrack = enabledTrack;

      // when the enabled range changes gray out the unusable parts of the slider
      const enabledRangeObserver = enabledRange => {
        const minViewCoordinate = this.fullRangeValueToPosition( enabledRange.min );
        const maxViewCoordinate = this.fullRangeValueToPosition( enabledRange.max );

        // update the geometry of the enabled track
        const enabledWidth = maxViewCoordinate - minViewCoordinate;
        this.enabledTrack.setRect( minViewCoordinate, 0, enabledWidth, this.size.height );
      };
      options.enabledRangeProperty.link( enabledRangeObserver ); // needs to be unlinked in dispose function

      this.disposeDefaultSliderTrack = () => options.enabledRangeProperty.unlink( enabledRangeObserver );
    }

    dispose() {
      this.disposeDefaultSliderTrack();
      super.dispose();
    }
  }

  return sun.register( 'DefaultSliderTrack', DefaultSliderTrack );
} );