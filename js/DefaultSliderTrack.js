// Copyright 2019-2020, University of Colorado Boulder

/**
 * DefaultSliderTrack is composed of two rectangles, one for the enabled section of the track and one for the disabled
 * section.  The enabled track rectangle sits on top of the disabled track so that the enabled range can be any
 * desired sub range of the full slider range.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Dimension2 from '../../dot/js/Dimension2.js';
import merge from '../../phet-core/js/merge.js';
import Node from '../../scenery/js/nodes/Node.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import Tandem from '../../tandem/js/Tandem.js';
import SliderTrack from './SliderTrack.js';
import sun from './sun.js';

class DefaultSliderTrack extends SliderTrack {

  /**
   * @param {Property.<number>} valueProperty
   * @param {Range} range
   * @param {Object} [options]
   */
  constructor( valueProperty, range, options ) {

    options = merge( {
      size: new Dimension2( 100, 5 ),
      fillEnabled: 'white',
      fillDisabled: 'gray',
      stroke: 'black',
      lineWidth: 1,
      cornerRadius: 0,
      startDrag: _.noop, // called when a drag sequence starts
      drag: _.noop, // called at the beginning of a drag event, before any other drag work happens
      endDrag: _.noop, // called when a drag sequence ends
      constrainValue: _.identity, // called before valueProperty is set
      enabledRangeProperty: null,

      // phet-io
      tandem: Tandem.REQUIRED
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
      const minViewCoordinate = this.valueToPosition( enabledRange.min );
      const maxViewCoordinate = this.valueToPosition( enabledRange.max );

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

sun.register( 'DefaultSliderTrack', DefaultSliderTrack );
export default DefaultSliderTrack;