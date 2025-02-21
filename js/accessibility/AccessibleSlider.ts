// Copyright 2017-2025, University of Colorado Boulder

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
import type Constructor from '../../../phet-core/js/types/Constructor.js';
import type IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';
import type SceneryEvent from '../../../scenery/js/input/SceneryEvent.js';
import type Node from '../../../scenery/js/nodes/Node.js';
import DelayedMutate from '../../../scenery/js/util/DelayedMutate.js';
import sun from '../sun.js';
import AccessibleValueHandler, { type AccessibleValueHandlerOptions, type TAccessibleValueHandler } from './AccessibleValueHandler.js';

const ACCESSIBLE_SLIDER_OPTIONS = [
  'startDrag',
  'drag',
  'endDrag'
];

type SelfOptions = {

  // called when a drag sequence starts
  startDrag?: ( event: SceneryEvent ) => void;

  // called at the end of a drag event, after the valueProperty changes
  drag?: ( event: SceneryEvent ) => void;

  // called when a drag sequence ends
  endDrag?: ( event: SceneryEvent | null ) => void;
};

type AccessibleSliderOptions = SelfOptions & AccessibleValueHandlerOptions;

type TAccessibleSlider = {
  startDrag: ( event: SceneryEvent ) => void;
  drag: ( event: SceneryEvent ) => void;
  endDrag: ( event: SceneryEvent | null ) => void;
} & TAccessibleValueHandler;

/**
 * @param Type
 * @param optionsArgPosition - zero-indexed number that the options argument is provided at in the constructor for Type
 */
const AccessibleSlider = <SuperType extends Constructor<Node>>( Type: SuperType, optionsArgPosition: number ): SuperType & Constructor<TAccessibleSlider> => {
  const AccessibleSliderClass = DelayedMutate( 'AccessibleSlider', ACCESSIBLE_SLIDER_OPTIONS,
    class AccessibleSlider extends AccessibleValueHandler( Type, optionsArgPosition ) implements TAccessibleSlider {

      private readonly _disposeAccessibleSlider: () => void;

      private _startDrag: ( event: SceneryEvent ) => void = _.noop;
      private _drag: ( event: SceneryEvent ) => void = _.noop;
      private _endDrag: ( event: SceneryEvent | null ) => void = _.noop;

      public constructor( ...args: IntentionalAny[] ) {

        const providedOptions = args[ optionsArgPosition ] as AccessibleSliderOptions;

        assert && providedOptions && assert( Object.getPrototypeOf( providedOptions ) === Object.prototype,
          'Extra prototype on AccessibleSlider options object is a code smell (or probably a bug)' );

        // AccessibleSlider uses 'drag' terminology rather than 'change' for consistency with Slider
        assert && assert( providedOptions.startInput === undefined, 'AccessibleSlider sets startInput through options.startDrag' );
        assert && assert( providedOptions.endInput === undefined, 'AccessibleSlider sets endInput through options.endDrag' );
        assert && assert( providedOptions.onInput === undefined, 'AccessibleSlider sets onInput through options.drag' );

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

      public set startDrag( value: ( event: SceneryEvent ) => void ) {
        this._startDrag = value;

        // Also (unfortunately) forwarding to the startInput
        this.startInput = value;
      }

      public get startDrag(): ( event: SceneryEvent ) => void {
        return this._startDrag;
      }

      public set drag( value: ( event: SceneryEvent ) => void ) {
        this._drag = value;

        // Also (unfortunately) forwarding to the onInput
        this.onInput = value;
      }

      public get drag(): ( event: SceneryEvent ) => void {
        return this._drag;
      }

      public set endDrag( value: ( event: SceneryEvent | null ) => void ) {
        this._endDrag = value;

        // Also (unfortunately) forwarding to the endInput
        this.endInput = value;
      }

      public get endDrag(): ( event: SceneryEvent | null ) => void {
        return this._endDrag;
      }

      /**
       * Make the accessible slider portions of this node eligible for garbage collection. Call when disposing
       * the type that this trait is mixed into.
       */
      public override dispose(): void {
        this._disposeAccessibleSlider();

        super.dispose();
      }
    } );

  /**
   * {Array.<string>} - String keys for all the allowed options that will be set by Node.mutate( options ), in
   * the order they will be evaluated.
   *
   * NOTE: See Node's _mutatorKeys documentation for more information on how this operates, and potential special
   *       cases that may apply.
   */
  AccessibleSliderClass.prototype._mutatorKeys = ACCESSIBLE_SLIDER_OPTIONS.concat( AccessibleSliderClass.prototype._mutatorKeys );

  assert && assert( AccessibleSliderClass.prototype._mutatorKeys.length === _.uniq( AccessibleSliderClass.prototype._mutatorKeys ).length, 'duplicate mutator keys in AccessibleSlider' );

  return AccessibleSliderClass;
};

sun.register( 'AccessibleSlider', AccessibleSlider );

export default AccessibleSlider;
export type { AccessibleSliderOptions };