// Copyright 2016-2021, University of Colorado Boulder

/**
 * Shows a track on a slider.  Must be supplied a Node for rendering the track.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Property from '../../axon/js/Property.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import LinearFunction from '../../dot/js/LinearFunction.js';
import Range from '../../dot/js/Range.js';
import merge from '../../phet-core/js/merge.js';
import DragListener from '../../scenery/js/listeners/DragListener.js';
import Node from '../../scenery/js/nodes/Node.js';
import Tandem from '../../tandem/js/Tandem.js';
import sun from './sun.js';

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
      startDrag: _.noop, // called when a drag sequence starts
      drag: _.noop, // called at the beginning of a drag event, before any other drag work happens
      endDrag: _.noop, // called when a drag sequence ends
      constrainValue: _.identity, // called before valueProperty is set
      enabledRangeProperty: new Property( new Range( range.min, range.max ) ), // Defaults to a constant range

      // phet-io
      tandem: Tandem.REQUIRED
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

    // @public (read-only) so that clients can access Properties of the DragListener that tell us about its state
    // See https://github.com/phetsims/sun/issues/680
    this.dragListener = new DragListener( {
      tandem: options.tandem.createTandem( 'dragListener' ),

      start: ( event, listener ) => {
        options.startDrag( event );
        handleTrackEvent( event, listener.pressedTrail );
      },

      drag: ( event, listener ) => {
        options.drag( event );

        // Reuse the same handleTrackEvent but make sure the startedCallbacks call is made before the value changes
        handleTrackEvent( event, listener.pressedTrail );
      },

      end: event => {
        options.endDrag( event );
      }
    } );
    trackNode.addInputListener( this.dragListener );

    this.mutate( options );

    // @private Called by dispose
    this.disposeSliderTrack = () => {
      this.dragListener.dispose();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeSliderTrack();
    super.dispose();
  }
}

sun.register( 'SliderTrack', SliderTrack );
export default SliderTrack;