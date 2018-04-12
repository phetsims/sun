// Copyright 2015, University of Colorado Boulder

/**
 * Behavior that allows sliding between two full-screenview sized panels based on a Property.
 *
 * NOTE: Needs twixt as a dependency (modify package.json and regenerate dev files)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var Easing = require( 'TWIXT/Easing' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var sun = require( 'SUN/sun' );

  /**
   * @constructor
   * @extends {Node}
   *
   * @param {Node} leftNode - The node shown as the "left" screen.
   * @param {Node} rightNode - The node shown as the "right" screen.
   * @param {Property.<Bounds2>} visibleBoundsProperty - ScreenView's visibleBoundsProperty
   * @param {Property.<boolean>} showingLeftProperty - Whether the left-hand side should be in the view. When
   *                                                   false, the right-hand side should be in view.
   */
  function SlidingScreen( leftNode, rightNode, visibleBoundsProperty, showingLeftProperty ) {

    Node.call( this );

    // @private {Node}
    this.leftNode = leftNode;
    this.rightNode = rightNode;

    // @private {Property.<Bounds2>}
    this.visibleBoundsProperty = visibleBoundsProperty;

    // @private {Property.<boolean>}
    this.showingLeftProperty = showingLeftProperty;

    this.addChild( leftNode );
    this.addChild( rightNode );

    showingLeftProperty.link( this.onPropertyChange.bind( this ) );
    visibleBoundsProperty.link( this.onVisibleBoundsChange.bind( this ) );

    // @private {boolean}
    this.animating = false;

    // @private {number} - Where the animation is taking us
    this.targetX = 0;

    // @private {number} - Where the animation started
    this.sourceX = 0;

    // @private {number} - How close to completing is the animation, from 0 to 1
    this.ratio = 0;
  }

  sun.register( 'SlidingScreen', SlidingScreen );

  return inherit( Node, SlidingScreen, {
    /**
     * Steps forward in time, possibly animating from side to side.
     * @public
     *
     * @param {number} dt
     */
    step: function( dt ) {
      if ( this.animating ) {
        this.ratio = Math.min( 1, this.ratio + 2 * dt );
        var easedRatio = Easing.QUADRATIC_IN_OUT.value( this.ratio );
        this.x = easedRatio * this.targetX + ( 1 - easedRatio ) * this.sourceX;

        if ( this.ratio === 1 ) {
          this.setMoving( false );
        }
      }
    },

    /**
     * Sets options that depend on whether our view is moving (switching from level selection to challenges or back).
     * @public
     */
    setMoving: function( isMoving ) {
      this.leftNode.pickable = !isMoving;
      this.rightNode.pickable = !isMoving;

      this.leftNode.visible = isMoving ? true : this.showingLeftProperty.value;
      this.rightNode.visible = isMoving ? true : !this.showingLeftProperty.value;
    },

    /**
     * The x offset that should be applied to this when we are in a particular game state.
     * @private
     *
     * @returns {number}
     */
    getIdealSlideOffset: function( showingLeft ) {
      var mainOffset = this.visibleBoundsProperty.value.left - this.visibleBoundsProperty.value.right;
      return showingLeft ? 0 : mainOffset;
    },

    /**
     * Called when the visible bounds change
     * @private
     */
    onVisibleBoundsChange: function() {
      this.rightNode.x = -this.getIdealSlideOffset( false );

      // move immediately, instead of sliding
      this.animating = false;
      this.x = this.getIdealSlideOffset( this.showingLeftProperty.value );
      this.setMoving( false );
    },

    /**
     * Called when our showingLeftProperty changes.
     * @private
     */
    onPropertyChange: function() {
      var idealOffset = this.getIdealSlideOffset( this.showingLeftProperty.value );

      if ( this.x !== idealOffset ) {
        this.targetX = idealOffset;
        this.sourceX = this.x;
        this.ratio = 0;
        this.animating = true;
        this.setMoving( true );
      }
    },
  } );
} );
