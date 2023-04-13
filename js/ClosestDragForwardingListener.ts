// Copyright 2016-2023, University of Colorado Boulder

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

import Vector2 from '../../dot/js/Vector2.js';
import { Mouse, PressListenerEvent } from '../../scenery/js/imports.js';
import sun from './sun.js';

type DraggableItem = {
  startDrag: ( event: PressListenerEvent ) => void;
  computeDistance: ( globalPoint: Vector2 ) => number;
};

export default class ClosestDragForwardingListener {

  // The maximum distance from an item that will cause a touch-like (includes pen) to start a drag
  private readonly touchThreshold: number;

  // The maximum distance from an item that will cause a mouse down event to start a drag
  private readonly mouseThreshold: number;

  private readonly items: DraggableItem[];

  public constructor( touchThreshold: number, mouseThreshold: number ) {
    this.touchThreshold = touchThreshold;
    this.mouseThreshold = mouseThreshold;
    this.items = [];
  }

  /**
   * Adds an item that can be dragged.
   */
  public addDraggableItem( item: DraggableItem ): void {
    this.items.push( item );
  }

  /**
   * Removes a previously-added item.
   */
  public removeDraggableItem( item: DraggableItem ): void {
    const index = _.indexOf( this.items, item );
    assert && assert( index >= 0 );
    this.items.splice( index, 1 );
  }

  /**
   * Called on pointer down.
   */
  public down( event: PressListenerEvent ): void {

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

sun.register( 'ClosestDragForwardingListener', ClosestDragForwardingListener );