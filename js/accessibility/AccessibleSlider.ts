// Copyright 2017-2022, University of Colorado Boulder

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

import assertHasProperties from '../../../phet-core/js/assertHasProperties.js';
import Constructor from '../../../phet-core/js/types/Constructor.js';
import IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';
import optionize from '../../../phet-core/js/optionize.js';
import { Node, SceneryEvent } from '../../../scenery/js/imports.js';
import sun from '../sun.js';
import AccessibleValueHandler, { AccessibleValueHandlerOptions } from './AccessibleValueHandler.js';

type SelfOptions = {

  // called when a drag sequence starts
  startDrag?: ( event: SceneryEvent ) => void;

  // called at the end of a drag event, after the valueProperty changes
  drag?: ( event: SceneryEvent ) => void;

  // called when a drag sequence ends
  endDrag?: ( event: SceneryEvent | null ) => void;
};

type AccessibleSliderOptions = SelfOptions & AccessibleValueHandlerOptions;

/**
 * @param Type
 * @param optionsArgPosition - zero-indexed number that the options argument is provided at
 */
const AccessibleSlider = <SuperType extends Constructor<Node>>( Type: SuperType, optionsArgPosition: number ) => { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
  return class AccessibleSlider extends AccessibleValueHandler( Type, optionsArgPosition ) {

    private readonly _disposeAccessibleSlider: () => void;

    public constructor( ...args: IntentionalAny[] ) {

      const providedOptions = args[ optionsArgPosition ] as AccessibleSliderOptions;

      assert && providedOptions && assert( Object.getPrototypeOf( providedOptions ) === Object.prototype,
        'Extra prototype on AccessibleSlider options object is a code smell (or probably a bug)' );

      const options = optionize<AccessibleSliderOptions, SelfOptions, AccessibleValueHandlerOptions>()( {
        startDrag: _.noop,
        endDrag: _.noop,
        drag: _.noop
      }, providedOptions );

      // AccessibleSlider uses 'drag' terminology rather than 'change' for consistency with Slider
      assert && assert( options.startInput === undefined, 'AccessibleSlider sets startInput through options.startDrag' );
      options.startInput = options.startDrag;

      assert && assert( options.endInput === undefined, 'AccessibleSlider sets endInput through options.endDrag' );
      options.endInput = options.endDrag;

      assert && assert( options.onInput === undefined, 'AccessibleSlider sets onInput through options.drag' );
      options.onInput = options.drag;

      args[ optionsArgPosition ] = options;

      super( ...args );

      // members of the Node API that are used by this trait
      assertHasProperties( this, [ 'addInputListener', 'removeInputListener' ] );

      // handle all accessible event input
      const accessibleInputListener = this.getAccessibleValueHandlerInputListener();
      this.addInputListener( accessibleInputListener );

      // called by disposeAccessibleSlider to prevent memory leaks
      this._disposeAccessibleSlider = () => {
        this.removeInputListener( accessibleInputListener );
      };
    }

    /**
     * Make the accessible slider portions of this node eligible for garbage collection. Call when disposing
     * the type that this trait is mixed into.
     */
    public override dispose(): void {
      this._disposeAccessibleSlider();

      super.dispose();
    }
  };
};

sun.register( 'AccessibleSlider', AccessibleSlider );

export default AccessibleSlider;
export type { AccessibleSliderOptions };