// Copyright 2018-2025, University of Colorado Boulder

/**
 * A trait for subtypes of Node, used to make the Node behave like a 'number' input with assistive technology.
 * An accessible number spinner behaves like:
 *
 * - Arrow keys increment/decrement the value by a specified step size.
 * - Page Up and Page Down increments/decrements value by an alternative step size, usually larger than default.
 * - Home key sets value to its minimum.
 * - End key sets value to its maximum.
 *
 * This number spinner is different than typical 'number' inputs because it does not support number key control. It
 * was determined that an input of type range is the best match for a PhET Number Spinner, with a custom role
 * description with aria-roledescription. See https://github.com/phetsims/sun/issues/497 for history on this
 * decision.
 *
 * This trait mixes in a "parent" mixin to handle general "value" formatting and aria-valuetext updating, see
 * AccessibleValueHandler.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Michael Barlow (PhET Interactive Simulations)
 */

import CallbackTimer, { type CallbackTimerCallback } from '../../../axon/js/CallbackTimer.js';
import Emitter from '../../../axon/js/Emitter.js';
import type TEmitter from '../../../axon/js/TEmitter.js';
import validate from '../../../axon/js/validate.js';
import assertHasProperties from '../../../phet-core/js/assertHasProperties.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';
import Orientation from '../../../phet-core/js/Orientation.js';
import type Constructor from '../../../phet-core/js/types/Constructor.js';
import type IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';
import KeyboardUtils from '../../../scenery/js/accessibility/KeyboardUtils.js';
import { ParallelDOMOptions } from '../../../scenery/js/accessibility/pdom/ParallelDOM.js';
import type SceneryEvent from '../../../scenery/js/input/SceneryEvent.js';
import type TInputListener from '../../../scenery/js/input/TInputListener.js';
import type Node from '../../../scenery/js/nodes/Node.js';
import DelayedMutate from '../../../scenery/js/util/DelayedMutate.js';
import sun from '../sun.js';
import SunStrings from '../SunStrings.js';
import AccessibleValueHandler, { type AccessibleValueHandlerOptions, type TAccessibleValueHandler } from './AccessibleValueHandler.js';

const ACCESSIBLE_NUMBER_SPINNER_OPTIONS = [
  'pdomTimerDelay',
  'pdomTimerInterval'
];

type SelfOptions = {

  // start to fire continuously after pressing for this long (milliseconds)
  pdomTimerDelay?: number;

  // fire continuously at this frequency (milliseconds),
  pdomTimerInterval?: number;
};

type AccessibleNumberSpinnerOptions = SelfOptions & AccessibleValueHandlerOptions & Pick<ParallelDOMOptions, 'accessibleRoleDescription'>;

type TAccessibleNumberSpinner = {
  // @mixin-protected - made public for use in the mixin only
  readonly pdomIncrementDownEmitter: TEmitter<[ boolean ]>;
  // @mixin-protected - made public for use in the mixin only
  readonly pdomDecrementDownEmitter: TEmitter<[ boolean ]>;
  pdomTimerDelay: number;
  pdomTimerInterval: number;
} & TAccessibleValueHandler;

/**
 * @param Type
 * @param optionsArgPosition - zero-indexed number that the options argument is provided at
 */
const AccessibleNumberSpinner = <SuperType extends Constructor<Node>>( Type: SuperType, optionsArgPosition: number ): SuperType & Constructor<TAccessibleNumberSpinner> => {

  const AccessibleNumberSpinnerClass = DelayedMutate( 'AccessibleNumberSpinner', ACCESSIBLE_NUMBER_SPINNER_OPTIONS,
    class AccessibleNumberSpinner extends AccessibleValueHandler( Type, optionsArgPosition ) implements TAccessibleNumberSpinner {

      // Manages timing must be disposed
      private readonly _callbackTimer: CallbackTimer;

      // Emits events when increment and decrement actions occur, but only for changes of keyboardStep and
      // shiftKeyboardStep (not pageKeyboardStep). Indicates "normal" usage with a keyboard, so that components
      // composed with this trait can style themselves differently when the keyboard is being used.
      // @mixin-protected - made public for use in the mixin only
      public readonly pdomIncrementDownEmitter: TEmitter<[ boolean ]>;
      public readonly pdomDecrementDownEmitter: TEmitter<[ boolean ]>;

      private _pdomTimerDelay = 400;
      private _pdomTimerInterval = 100;

      private readonly _disposeAccessibleNumberSpinner: () => void;

      public constructor( ...args: IntentionalAny[] ) {

        const providedOptions = args[ optionsArgPosition ] as AccessibleValueHandlerOptions;

        assert && providedOptions && assert( Object.getPrototypeOf( providedOptions ) === Object.prototype,
          'Extra prototype on AccessibleSlider options object is a code smell (or probably a bug)' );

        const options = combineOptions<AccessibleNumberSpinnerOptions>( {
          ariaOrientation: Orientation.VERTICAL, // by default, number spinners should be oriented vertically
          accessibleRoleDescription: SunStrings.a11y.numberSpinnerRoleDescriptionStringProperty
        }, providedOptions );

        args[ optionsArgPosition ] = options;

        super( ...args );

        // members of the Node API that are used by this trait
        assertHasProperties( this, [ 'addInputListener' ] );

        this._callbackTimer = new CallbackTimer( {
          delay: this._pdomTimerDelay,
          interval: this._pdomTimerInterval
        } );

        this.pdomIncrementDownEmitter = new Emitter( { parameters: [ { valueType: 'boolean' } ] } );
        this.pdomDecrementDownEmitter = new Emitter( { parameters: [ { valueType: 'boolean' } ] } );

        // a callback that is added and removed from the timer depending on keystate
        let downCallback: CallbackTimerCallback | null = null;
        let runningTimerCallbackEvent: Event | null = null; // {Event|null}

        // handle all accessible event input
        const accessibleInputListener: TInputListener = {
          keydown: event => {
            if ( this.enabledProperty.get() ) {

              // check for relevant keys here
              if ( KeyboardUtils.isRangeKey( event.domEvent ) ) {

                const domEvent = event.domEvent!;

                // If the meta key is down we will not even call the keydown listener of the supertype, so we need
                // to be sure that default behavior is prevented so we don't receive `input` and `change` events.
                // See AccessibleValueHandler.handleInput for information on these events and why we don't want
                // to change in response to them.
                domEvent.preventDefault();

                // When the meta key is down Mac will not send keyup events so do not change values or add timer
                // listeners because they will never be removed since we fail to get a keyup event. See
                if ( !domEvent.metaKey ) {
                  if ( !this._callbackTimer.isRunning() ) {
                    this._accessibleNumberSpinnerHandleKeyDown( event );

                    downCallback = this._accessibleNumberSpinnerHandleKeyDown.bind( this, event );
                    runningTimerCallbackEvent = domEvent;
                    this._callbackTimer.addCallback( downCallback );
                    this._callbackTimer.start();
                  }
                }
              }
            }
          },
          keyup: event => {

            const key = KeyboardUtils.getEventCode( event.domEvent );

            if ( KeyboardUtils.isRangeKey( event.domEvent ) ) {
              if ( runningTimerCallbackEvent && key === KeyboardUtils.getEventCode( runningTimerCallbackEvent ) ) {
                this._emitKeyState( event.domEvent!, false );
                this._callbackTimer.stop( false );
                assert && assert( downCallback );
                this._callbackTimer.removeCallback( downCallback! );
                downCallback = null;
                runningTimerCallbackEvent = null;
              }

              this.handleKeyUp( event );
            }
          },
          blur: event => {

            // if a key is currently down when focus leaves the spinner, stop callbacks and emit that the
            // key is up
            if ( downCallback ) {
              assert && assert( runningTimerCallbackEvent !== null, 'key should be down if running downCallback' );

              this._emitKeyState( runningTimerCallbackEvent!, false );
              this._callbackTimer.stop( false );
              this._callbackTimer.removeCallback( downCallback );
            }

            this.handleBlur( event );
          },
          input: this.handleInput.bind( this ),
          change: this.handleChange.bind( this )
        };
        this.addInputListener( accessibleInputListener );

        this._disposeAccessibleNumberSpinner = () => {
          this._callbackTimer.dispose();

          // emitters owned by this instance, can be disposed here
          this.pdomIncrementDownEmitter.dispose();
          this.pdomDecrementDownEmitter.dispose();

          this.removeInputListener( accessibleInputListener );
        };
      }

      public set pdomTimerDelay( value: number ) {
        this._pdomTimerDelay = value;

        if ( this._callbackTimer ) {
          this._callbackTimer.delay = value;
        }
      }

      public get pdomTimerDelay(): number {
        return this._pdomTimerDelay;
      }

      public set pdomTimerInterval( value: number ) {
        this._pdomTimerInterval = value;

        if ( this._callbackTimer ) {
          this._callbackTimer.interval = value;
        }
      }

      public get pdomTimerInterval(): number {
        return this._pdomTimerInterval;
      }

      /**
       * Handle the keydown event and emit events related to the user interaction. Ideally, this would
       * override AccessibleValueHandler.handleKeyDown, but overriding is not supported with PhET Trait pattern.
       */

      private _accessibleNumberSpinnerHandleKeyDown( event: SceneryEvent<KeyboardEvent> ): void {
        assert && assert( event.domEvent, 'must have a domEvent' );
        this.handleKeyDown( event );
        this._emitKeyState( event.domEvent!, true );
      }

      /**
       * Emit events related to the keystate of the spinner. Typically used to style the spinner during keyboard
       * interaction.
       *
       * @param domEvent - the code of the key changing state
       * @param isDown - whether or not event was triggered from down or up keys
       */

      private _emitKeyState( domEvent: Event, isDown: boolean ): void {
        validate( domEvent, { valueType: Event } );
        if ( KeyboardUtils.isAnyKeyEvent( domEvent, [ KeyboardUtils.KEY_UP_ARROW, KeyboardUtils.KEY_RIGHT_ARROW ] ) ) {
          this.pdomIncrementDownEmitter.emit( isDown );
        }
        else if ( KeyboardUtils.isAnyKeyEvent( domEvent, [ KeyboardUtils.KEY_DOWN_ARROW, KeyboardUtils.KEY_LEFT_ARROW ] ) ) {
          this.pdomDecrementDownEmitter.emit( isDown );
        }
      }

      public override dispose(): void {
        this._disposeAccessibleNumberSpinner();

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
  AccessibleNumberSpinnerClass.prototype._mutatorKeys = ACCESSIBLE_NUMBER_SPINNER_OPTIONS.concat( AccessibleNumberSpinnerClass.prototype._mutatorKeys );

  assert && assert( AccessibleNumberSpinnerClass.prototype._mutatorKeys.length === _.uniq( AccessibleNumberSpinnerClass.prototype._mutatorKeys ).length, 'duplicate mutator keys in AccessibleNumberSpinner' );

  return AccessibleNumberSpinnerClass;
};

sun.register( 'AccessibleNumberSpinner', AccessibleNumberSpinner );

export default AccessibleNumberSpinner;
export type { AccessibleNumberSpinnerOptions };