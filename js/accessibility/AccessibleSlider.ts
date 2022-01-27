// Copyright 2017-2021, University of Colorado Boulder

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

import Property from '../../../axon/js/Property.js';
import Range from '../../../dot/js/Range.js';
import assertHasProperties from '../../../phet-core/js/assertHasProperties.js';
import inheritance from '../../../phet-core/js/inheritance.js';
import optionize from '../../../phet-core/js/optionize.js';
import { Node, SceneryEvent } from '../../../scenery/js/imports.js';
import sun from '../sun.js';
import AccessibleValueHandler, { AccessibleValueHandlerOptions } from './AccessibleValueHandler.js';

type SceneryListenerFunction = ( event?: SceneryEvent ) => void;
type Constructor<T = {}> = new ( ...args: any[] ) => T;

type AccessibleSliderSelfOptions = {
  startDrag?: SceneryListenerFunction;
  endDrag?: SceneryListenerFunction;
  drag?: SceneryListenerFunction;
}

type AccessibleSliderOptions = AccessibleSliderSelfOptions & AccessibleValueHandlerOptions;

// This pattern follows Paintable, and has the downside that typescript doesn't know that Type is a Node, but we can't
// get that type safety because anonymous classes can't have private or protected members. See https://github.com/phetsims/scenery/issues/1340#issuecomment-1020692592
const AccessibleSlider = <SuperType extends Constructor>( Type: SuperType ) => {

  assert && assert( _.includes( inheritance( Type ), Node ), 'Only Node subtypes should compose Voicing' );

  const AccessibleValueHandlerClass = AccessibleValueHandler( Type );

  // Unfortunately, nothing can be private or protected in this class, see https://github.com/phetsims/scenery/issues/1340#issuecomment-1020692592
  return class extends AccessibleValueHandlerClass {
    _disposeAccessibleSlider: () => void;

    constructor( valueProperty: Property<number>, rangeProperty: Property<Range>, enabledProperty: Property<boolean>,
                 providedOptions?: AccessibleSliderOptions, ...args: any[] ) {

      const options = optionize<AccessibleSliderOptions, AccessibleSliderSelfOptions, AccessibleValueHandlerOptions>( {
        startDrag: _.noop, // called when a drag sequence starts
        endDrag: _.noop, // called when a drag sequence ends
        drag: _.noop // called once per drag event, before other modifications to the valueProperty
      }, providedOptions );

      super( valueProperty, rangeProperty, enabledProperty, options, ...args );

      // members of the Node API that are used by this trait
      assertHasProperties( this, [ 'addInputListener', 'removeInputListener' ] );

      // AccessibleSlider uses 'drag' terminology rather than 'change' for consistency with Slider
      assert && assert( options.startChange === undefined, 'AccessibleSlider sets startChange through options.startDrag' );
      options.startChange = options.startDrag;

      assert && assert( options.endChange === undefined, 'AccessibleSlider sets endChange through options.endDrag' );
      options.endChange = options.endDrag;

      assert && assert( options.onChange === undefined, 'AccessibleSlider sets onChange through options.drag' );
      options.onChange = options.drag;

      // handle all accessible event input
      const accessibleInputListener = this.getAccessibleValueHandlerInputListener();
      ( this as unknown as Node ).addInputListener( accessibleInputListener );

      // @private - called by disposeAccessibleSlider to prevent memory leaks
      this._disposeAccessibleSlider = () => {
        ( this as unknown as Node ).removeInputListener( accessibleInputListener );
      };
    }

    /**
     * Make the accessible slider portions of this node eligible for garbage collection. Call when disposing
     * the type that this trait is mixed into.
     * @public
     */
    dispose() {
      this._disposeAccessibleSlider();
      super.dispose();
    }
  };
};

sun.register( 'AccessibleSlider', AccessibleSlider );

export default AccessibleSlider;