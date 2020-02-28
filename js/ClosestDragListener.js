// Copyright 2016-2020, University of Colorado Boulder

/**
 * A Scenery input listener that is able to find the closest in a list of nodes to a "down" event and trigger a drag
 * on the closest (assuming it has a SimpleDragHandler).
 *
 * Handles items of the form:
 * {
 *   startDrag: function( event ),
 *   computeDistance: function( globalPoint ) : number
 * }
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import inherit from '../../phet-core/js/inherit.js';
import Mouse from '../../scenery/js/input/Mouse.js';
import Touch from '../../scenery/js/input/Touch.js';
import sun from './sun.js';

/**
 * @constructor
 *
 * @param {number} touchThreshold - The maximum distance from an item that will cause a touch to start a drag
 * @param {number} mouseThreshold - The maximum distance from an item that will cause a mouse down event to start a drag
 */
function ClosestDragListener( touchThreshold, mouseThreshold ) {
  // @private
  this.touchThreshold = touchThreshold;
  this.mouseThreshold = mouseThreshold;

  // @private
  this.items = [];
}

sun.register( 'ClosestDragListener', ClosestDragListener );

inherit( Object, ClosestDragListener, {
  /**
   * Adds an item that can be dragged.
   * @public
   *
   * @param {item} item
   */
  addDraggableItem: function( item ) {
    assert && assert( !!item.startDrag && !!item.computeDistance, 'Added an invalid item for ClosestDragListener' );
    this.items.push( item );
  },

  /**
   * Removes a previously-added item.
   * @public
   *
   * @param {item} item
   */
  removeDraggableItem: function( item ) {
    const index = _.indexOf( this.items, item );
    assert && assert( index >= 0 );
    this.items.splice( index, 1 );
  },

  down: function( event ) {
    // If there was nothing else in the way
    if ( event.target === event.currentTarget ) {
      let threshold = 0;
      if ( event.pointer instanceof Touch ) {
        threshold = this.touchThreshold;
      }
      if ( event.pointer instanceof Mouse ) {
        threshold = this.mouseThreshold;
      }
      if ( threshold ) {
        // search for the closest item
        let currentItem = null;
        let currentDistance = Number.POSITIVE_INFINITY;
        const globalPoint = event.pointer.point;
        const numItems = this.items.length;
        for ( let i = 0; i < numItems; i++ ) {
          const item = this.items[ i ];

          const distance = item.computeDistance( globalPoint );
          if ( distance < currentDistance ) {
            currentDistance = distance;
            currentItem = item;
          }
        }

        // if we have a closest item under the threshold, attempt to start a drag on it
        if ( currentItem && currentDistance < threshold ) {
          currentItem.startDrag( event );
        }
      }
    }
  }
} );

export default ClosestDragListener;