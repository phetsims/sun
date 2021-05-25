// Copyright 2016-2021, University of Colorado Boulder

/**
 * A Scenery input listener that is able to find the closest in a list of items to a "down" event and trigger an action
 * (usually a drag) on that item. Usually this will be a drag listener start/press (e.g. SimpleDragHandler/DragListener),
 * but could accommodate other uses. It's similar in use to DragListener.createForwardingListener.
 *
 * Handles items of the form:
 * {
 *   startDrag: function( event ),
 *   computeDistance: function( globalPoint ) : number
 * }
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import Mouse from '../../scenery/js/input/Mouse.js';
import sun from './sun.js';

class ClosestDragListener {

  /**
   * @param {number} touchThreshold - The maximum distance from an item that will cause a touch-like (includes pen) to start a drag
   * @param {number} mouseThreshold - The maximum distance from an item that will cause a mouse down event to start a drag
   */
  constructor( touchThreshold, mouseThreshold ) {

    // @private
    this.touchThreshold = touchThreshold;
    this.mouseThreshold = mouseThreshold;

    // @private
    this.items = [];
  }

  /**
   * Adds an item that can be dragged.
   * @public
   *
   * @param {item} item
   */
  addDraggableItem( item ) {
    assert && assert( !!item.startDrag && !!item.computeDistance, 'Added an invalid item for ClosestDragListener' );
    this.items.push( item );
  }

  /**
   * Removes a previously-added item.
   * @public
   *
   * @param {item} item
   */
  removeDraggableItem( item ) {
    const index = _.indexOf( this.items, item );
    assert && assert( index >= 0 );
    this.items.splice( index, 1 );
  }

  /**
   * @public
   *
   * @param {SceneryEvent} event
   */
  down( event ) {
    // If there was nothing else in the way
    if ( event.target === event.currentTarget ) {
      let threshold = 0;
      if ( event.pointer.isTouchLike() ) {
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
}

sun.register( 'ClosestDragListener', ClosestDragListener );
export default ClosestDragListener;