// Copyright 2017-2020, University of Colorado Boulder

/**
 * A trait for subtypes of Node, used to make the Node behave like a 'slider' with assistive technology. This could be
 * used by anything that moves along a 1-D line. An accessible slider behaves like:
 *
 * - Arrow keys increment/decrement the slider by a specified step size.
 * - Holding shift with arrow keys will increment/decrement by alternative step size, usually smaller than default.
 * - Page Up and Page Down increments/decrements value by an alternative step size, usually larger than default.
 * - Home key sets value to its minimum.
 * - End key sets value to its maximum.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import extend from '../../../phet-core/js/extend.js';
import inheritance from '../../../phet-core/js/inheritance.js';
import merge from '../../../phet-core/js/merge.js';
import Node from '../../../scenery/js/nodes/Node.js';
import sun from '../sun.js';
import AccessibleValueHandler from './AccessibleValueHandler.js';

const AccessibleSlider = {

  /**
   * Implement functionality for a slider.
   * @public
   * @trait {Node}
   * @mixes AccessibleValueHandler
   *
   * @param {function} type - The type (constructor) whose prototype we'll modify.
   */
  mixInto: function( type ) {
    assert && assert( _.includes( inheritance( type ), Node ) );

    const proto = type.prototype;

    // mixin general value handling
    AccessibleValueHandler.mixInto( type );

    extend( proto, {

      /**
       * This should be called in the constructor to initialize the accessible slider features for the node.
       *
       * @param {Property.<number>} valueProperty
       * @param {Property.<Range>} enabledRangeProperty
       * @param {Property.<boolean>} enabledProperty
       * @param {Object} [options]
       *
       * @protected
       */
      initializeAccessibleSlider: function( valueProperty, enabledRangeProperty, enabledProperty, options ) {
        const self = this;

        options = merge( {
          startDrag: _.noop, // called when a drag sequence starts
          endDrag: _.noop, // called when a drag sequence ends
          drag: _.noop, // called once per drag event, before other modifications to the valueProperty
          constrainValue: _.identity // called before valueProperty is set
        }, options );

        // AccessibleSlider uses 'drag' terminology rather than 'change' for consistency with Slider
        assert && assert( options.startChange === undefined, 'AccessibleSlider sets startChange through options.startDrag' );
        options.startChange = options.startDrag;

        assert && assert( options.endChange === undefined, 'AccessibleSlider sets endChange through options.endDrag' );
        options.endChange = options.endDrag;

        assert && assert( options.change === undefined, 'AccessibleSlider sets change through options.drag' );
        options.change = options.drag;

        // initialize "parent" mixin
        this.initializeAccessibleValueHandler( valueProperty, enabledRangeProperty, enabledProperty, options );

        // handle all accessible event input
        const accessibleInputListener = this.getAccessibleValueHandlerInputListener();
        this.addInputListener( accessibleInputListener );

        // @private - called by disposeAccessibleSlider to prevent memory leaks
        this._disposeAccessibleSlider = function() {
          self.removeInputListener( accessibleInputListener );
          self.disposeAccessibleValueHandler();
        };
      },

      /**
       * Make the accessible slider portions of this node eligible for garbage collection. Call when disposing
       * the type that this trait is mixed into.
       * @public
       */
      disposeAccessibleSlider: function() {
        this._disposeAccessibleSlider();
      },

      /**
       * This should be called after the appropriate model dependencies have been reset.
       * @public
       */
      resetAccessibleSlider: function() {
        this.resetAccessibleValueHandler();
      }
    } );
  }
};

sun.register( 'AccessibleSlider', AccessibleSlider );

export default AccessibleSlider;