// Copyright 2019-2025, University of Colorado Boulder

/**
 * A trait for subtypes of Node. Meant for Nodes with a value that "run" on a NumberProperty and handles formatting,
 * mapping, and aria-valuetext updating in the PDOM.
 *
 * Also implements the listeners that respond to accessible input, such as keydown, keyup, input, and change
 * events, which may come from a keyboard or other assistive device. Use getAccessibleValueHandlerInputListener() to get
 * these listeners to add to your Node with addInputListener().
 *
 * Browsers have limitations for the interaction of a slider when the range is not evenly divisible by the step size.
 * Rather than allow the browser to natively change the valueProperty with an input event, this trait implements a
 * totally custom interaction keeping the general slider behavior the same.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import DynamicProperty from '../../../axon/js/DynamicProperty.js';
import Multilink, { type UnknownMultilink } from '../../../axon/js/Multilink.js';
import Property from '../../../axon/js/Property.js';
import type TProperty from '../../../axon/js/TProperty.js';
import type TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import type Range from '../../../dot/js/Range.js';
import { clamp } from '../../../dot/js/util/clamp.js';
import assertHasProperties from '../../../phet-core/js/assertHasProperties.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import Orientation from '../../../phet-core/js/Orientation.js';
import platform from '../../../phet-core/js/platform.js';
import type Constructor from '../../../phet-core/js/types/Constructor.js';
import type IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';
import { eventCodeToEnglishString } from '../../../scenery/js/accessibility/EnglishStringToCodeMap.js';
import KeyboardUtils from '../../../scenery/js/accessibility/KeyboardUtils.js';
import { type PDOMValueType } from '../../../scenery/js/accessibility/pdom/ParallelDOM.js';
import PDOMUtils from '../../../scenery/js/accessibility/pdom/PDOMUtils.js';
import Voicing, { type TVoicing, type VoicingOptions } from '../../../scenery/js/accessibility/voicing/Voicing.js';
import HotkeyData from '../../../scenery/js/input/HotkeyData.js';
import type PDOMPointer from '../../../scenery/js/input/PDOMPointer.js';
import type SceneryEvent from '../../../scenery/js/input/SceneryEvent.js';
import { type SceneryListenerFunction } from '../../../scenery/js/input/TInputListener.js';
import type TInputListener from '../../../scenery/js/input/TInputListener.js';
import animatedPanZoomSingleton from '../../../scenery/js/listeners/animatedPanZoomSingleton.js';
import { type NodeOptions } from '../../../scenery/js/nodes/Node.js';
import type Node from '../../../scenery/js/nodes/Node.js';
import DelayedMutate from '../../../scenery/js/util/DelayedMutate.js';
import Utterance from '../../../utterance-queue/js/Utterance.js';
import type UtteranceQueue from '../../../utterance-queue/js/UtteranceQueue.js';
import sun from '../sun.js';
import AccessibleValueHandlerHotkeyDataCollection from './AccessibleValueHandlerHotkeyDataCollection.js';
import { numberOfDecimalPlaces } from '../../../dot/js/util/numberOfDecimalPlaces.js';
import { roundSymmetric } from '../../../dot/js/util/roundSymmetric.js';
import { equalsEpsilon } from '../../../dot/js/util/equalsEpsilon.js';

// constants
const DEFAULT_TAG_NAME = 'input';
const toString = ( v: IntentionalAny ) => `${v}`;

// Options for the Voicing response that happens at the end of
const DEFAULT_VOICING_ON_END_RESPONSE_OPTIONS = {
  withNameResponse: false, // no need to repeat the name every change
  withObjectResponse: true, // response for the new value
  onlyOnValueChange: true // no response if value did not change
};

// Signature for the onInput call. See options for documentation.
type OnInputFunction = ( event: SceneryEvent, oldValue: number ) => void;

type CreateTextFunction<M extends ( number | null ) | ( number )> = {

  /**
   * @param pdomMappedValue - see
   * @param newValue - the new value, unformatted
   * @param valueOnStart - the value at the start of the interaction, the value on keydown for press and hold
   * @returns - text/response/string to be set to the primarySibling, null means nothing will happen
   * */
  ( pdomMappedValue: number, newValue: number, valueOnStart: M ): PDOMValueType | null;

  // if this function needs resetting, include a `reset` field on this function to be called when the
  // AccessibleValueHandler is reset.
  reset?: () => void;
};

export type VoicingOnEndResponseOptions = {

  // Should the Voicing response be spoken if the interaction does not change the value?
  onlyOnValueChange?: boolean;

  // Should the Voicing response include the name response?
  withNameResponse?: boolean;

  // Should the Voicing response include the object response?
  withObjectResponse?: boolean;
};

// Function signature for voicingOnEndResponse.
export type VoicingOnEndResponse = ( valueOnStart: number, providedOptions?: VoicingOnEndResponseOptions ) => void;

const ACCESSIBLE_VALUE_HANDLER_OPTIONS: string[] = [
  'startInput',
  'endInput',
  'onInput',
  'constrainValue',
  'keyboardStep',
  'shiftKeyboardStep',
  'pageKeyboardStep',
  'ariaOrientation',
  'panTargetNode',
  'roundToStepSize',
  'pdomMapPDOMValue',
  'pdomMapValue',
  'pdomRepeatEqualValueText',
  'pdomCreateAriaValueText',
  'pdomCreateContextResponseAlert',
  'contextResponsePerValueChangeDelay',
  'contextResponseMaxDelay',
  'pdomDependencies',
  'voicingOnEndResponseOptions'
];

type SelfOptions = {
  valueProperty: TProperty<number>;
  enabledRangeProperty: TReadOnlyProperty<Range>;

  // called when input begins from user interaction
  startInput?: ( event: SceneryEvent ) => void;

  // called when input ends from user interaction
  endInput?: ( event: SceneryEvent | null ) => void;

  // Called every input event (like drag), after the valueProperty has been updated. The oldValue is available in the
  // callback so that you can determine if/how the value changed.
  onInput?: OnInputFunction;

  // Constrains the value, returning a new value for the valueProperty instead. Called before the valueProperty is set.
  // Subtypes can use this for other forms of input as well.
  // For keyboard input, this is only called when the shift key is NOT down because it is often the case that
  // shiftKeyboardStep is a smaller step size then what is allowed by constrainValue.
  constrainValue?: ( value: number ) => number;

  // delta for the valueProperty for each press of the arrow keys
  keyboardStep?: number;

  // delta for the valueProperty for each press of the arrow keys while the shift modifier is down
  shiftKeyboardStep?: number;

  // delta for the valueProperty for each press of "Page Up" and "Page Down"
  pageKeyboardStep?: number;

  // If true, alternative input will be 'reversed' so that keys that normally increase the value will decrease it,
  // and vice versa. This is useful for cases where the valueProperty has an inverted behavior from typical slider
  // input. For example, a knob that moves to the left to increase the valueProperty.
  reverseAlternativeInput?: boolean;

  // specify orientation, read by assistive technology
  ariaOrientation?: Orientation;

  // Upon accessible input, we will try to keep this Node in view of the animatedPanZoomSingleton.
  // If null, 'this' is used (the Node mixing AccessibleValueHandler)
  panTargetNode?: null | Node;

  // When setting the Property value from the PDOM input, this option controls whether or not to
  // round the value to a multiple of the keyboardStep. This will only round the value on normal key presses,
  // rounding will not occur on large jumps like page up/page down/home/end.
  // see https://github.com/phetsims/gravity-force-lab-basics/issues/72
  roundToStepSize?: boolean;

  /**
   * Map the valueProperty value to another number that will be read by assistive devices on
   * valueProperty changes from the PDOM values. This is used to set the values for aria-valuetext and the on
   * change alert, as well as the following attributes on the PDOM input:
   *    value
   *    aria-valuenow
   *    min
   *    max
   *    step
   *
   * For this reason, it is important that the mapped "min" would not be bigger than the mapped "max" from the
   * enabledRangeProperty.
   *
   * This map is used to control attributes in the PDOM (not the valueProperty).
   */
  pdomMapPDOMValue?: ( value: number ) => number;

  /**
   * Called before constraining and setting the Property. This is useful in rare cases where the value being set
   * by AccessibleValueHandler may change based on outside logic. This is for mapping value changes from input listeners
   * assigned in this type (keyboard/alt-input) to a new value before the value is set.
   *
   * This map is used to control the actual valueProperty.
   */
  pdomMapValue?: ( newValue: number, previousValue: number ) => number;

  /**
   * If true, the aria-valuetext will be spoken every value change, even if the aria-valuetext doesn't
   * actually change. By default, screen readers won't speak aria-valuetext if it remains the same for
   * multiple values.
   */
  pdomRepeatEqualValueText?: boolean;

  /**
   * aria-valuetext creation function, called when the valueProperty changes.
   * This string is read by AT every time the slider value changes. This is often called the "object response"
   * for this interaction.
   */
  pdomCreateAriaValueText?: CreateTextFunction<number | null>;

  /**
   * Create content for an alert that will be sent to the utteranceQueue when the user finishes interacting
   * with the input. Is not generated every change, but on every "drag" interaction, this is called with
   * endInput. With a keyboard, this will be called even with no value change (on the key up event ending the
   * interaction), On a touch system like iOS with Voice Over however, input and change events will only fire
   * when there is a Property value change, so "edge" alerts will not fire, see https://github.com/phetsims/gravity-force-lab-basics/issues/185.
   * This alert is often called the "context response" because it is timed to only alert after an interaction
   * end, instead of each time the value changes.
   *
   * If function returns null, then no alert will be sent to utteranceQueue for alerting.
   *
   * This function can also support a `reset` function on it, to be called when the AccessibleValueHandler is reset
   */
  pdomCreateContextResponseAlert?: CreateTextFunction<number> | null;

  // This coefficient is multiplied by the number of times the value has been changed without the context response
  // alerting. This number is meant to give the screen reader enough chance to finish reading the aria-valuetext,
  // which could take longer the more time the value changes. We want to give enough time for VO to read
  // aria-valuetext but don't want to have too much silence before the alert is spoken.
  contextResponsePerValueChangeDelay?: number;

  // in ms, When the valueProperty changes repeatedly, what is the maximum time to set the
  // alertStableDelay for the context response to. This value should be small enough that it feels like you are
  // aiting for this alert after an interaction. This should be altered depending on how quickly you expect the
  // value to change. We want to give enough time for VO to read aria-valuetext but don't want to have too much
  // silence before the alert is spoken.
  contextResponseMaxDelay?: number;

  /**
   * List the dependencies this Node's PDOM descriptions have. This should not include the valueProperty, but
   * should list any Properties whose change should trigger a description update for this Node.
   */
  pdomDependencies?: TReadOnlyProperty<IntentionalAny>[];

  // Only provide tagName to AccessibleValueHandler to remove it from the PDOM, otherwise, AccessibleValueHandler
  // sets its own tagName.
  tagName?: null;

  // Customizations for the voicingOnEndResponse function, which is used to voice content at the end
  // of an interaction.
  voicingOnEndResponseOptions?: VoicingOnEndResponseOptions;
};

type ParentOptions = VoicingOptions & NodeOptions;

export type AccessibleValueHandlerOptions = SelfOptions & VoicingOptions; // do not use ParentOptions here!

export type TAccessibleValueHandler = {
  startInput: SceneryListenerFunction;
  onInput: OnInputFunction;
  endInput: ( event: SceneryEvent | null ) => void;
  constrainValue: ( ( value: number ) => number );
  panTargetNode: Node | null;
  roundToStepSize: boolean;
  pdomMapPDOMValue: ( ( value: number ) => number );
  pdomMapValue: ( ( newValue: number, previousValue: number ) => number );
  pdomRepeatEqualValueText: boolean;
  pdomCreateAriaValueText: CreateTextFunction<number | null>;
  pdomCreateContextResponseAlert: CreateTextFunction<number> | null;
  contextResponsePerValueChangeDelay: number;
  contextResponseMaxDelay: number;
  voicingOnEndResponseOptions: VoicingOnEndResponseOptions;
  setPDOMDependencies( dependencies: TReadOnlyProperty<IntentionalAny>[] ): void;
  getPDOMDependencies(): TReadOnlyProperty<IntentionalAny>[];
  pdomDependencies: TReadOnlyProperty<IntentionalAny>[];
  alertContextResponse(): void;
  reset(): void;
  getAccessibleValueHandlerInputListener(): TInputListener;
  handleKeyDown( event: SceneryEvent<KeyboardEvent> ): void;

  // @mixin-protected - made public for use in the mixin only
  handleKeyUp( event: SceneryEvent<KeyboardEvent> ): void;
  // @mixin-protected - made public for use in the mixin only
  handleChange( event: SceneryEvent ): void;
  // @mixin-protected - made public for use in the mixin only
  handleInput( event: SceneryEvent ): void;
  // @mixin-protected - made public for use in the mixin only
  handleBlur( event: SceneryEvent<FocusEvent> ): void;
  setKeyboardStep( keyboardStep: number ): void;
  keyboardStep: number;
  getKeyboardStep(): number;
  setShiftKeyboardStep( shiftKeyboardStep: number ): void;
  shiftKeyboardStep: number;
  getShiftKeyboardStep(): number;
  getShiftKeyDown(): boolean;
  get shiftKeyDown(): boolean;
  setPageKeyboardStep( pageKeyboardStep: number ): void;
  pageKeyboardStep: number;
  getPageKeyboardStep(): number;
  setAriaOrientation( orientation: Orientation ): void;
  ariaOrientation: Orientation;
  getAriaOrientation(): Orientation;
  voicingOnEndResponse( valueOnStart: number, providedOptions?: VoicingOnEndResponseOptions ): void;
} & TVoicing;


/**
 * @param Type
 * @param optionsArgPosition - zero-indexed number that the options argument is provided at
 */
const AccessibleValueHandler = <SuperType extends Constructor<Node>>( Type: SuperType, optionsArgPosition: number ): SuperType & Constructor<TAccessibleValueHandler> => {
  const AccessibleValueHandlerClass = DelayedMutate( 'AccessibleValueHandler', ACCESSIBLE_VALUE_HANDLER_OPTIONS,
    class AccessibleValueHandler extends Voicing( Type ) implements TAccessibleValueHandler {
      private readonly _valueProperty: TProperty<number>;
      private _enabledRangeProperty: TReadOnlyProperty<Range>;
      private _startInput: SceneryListenerFunction = _.noop;
      private _onInput: OnInputFunction = _.noop;
      private _endInput: ( ( event: SceneryEvent | null ) => void ) = _.noop;
      private _constrainValue: ( ( value: number ) => number ) = _.identity;
      private _pdomMapValue: ( ( newValue: number, previousValue: number ) => number ) = _.identity;
      private _panTargetNode: Node | null = null;
      private _keyboardStep!: number; // will be initialized based on the enabled range
      private _shiftKeyboardStep!: number; // will be initialized based on the enabled range
      private _pageKeyboardStep!: number; // will be initialized based on the enabled range
      private _ariaOrientation: Orientation = Orientation.HORIZONTAL;
      private _shiftKey = false;

      private _pdomDependencies: TReadOnlyProperty<IntentionalAny>[] = [];

      // track previous values for callbacks outside of Property listeners
      private _oldValue: number | null = null;

      private _pdomCreateContextResponseAlert: CreateTextFunction<number> | null = null;

      // The Property value when an interaction starts, so it can be used as the "old" value
      // when generating a context response at the end of an interaction with pdomCreateContextResponseAlert.
      private _valueOnStart: number;

      // The utterance sent to the utteranceQueue when the value changes, alert content generated by
      // optional pdomCreateContextResponseAlert. The alertStableDelay on this utterance will increase if the input
      // receives many interactions before the utterance can be announced so that VoiceOver has time to read the
      // aria-valuetext (object response) before the alert (context response).
      private readonly _contextResponseUtterance: Utterance = new Utterance();

      // Number of times the input has changed in value before the utterance made was able to be spoken, only applicable
      // if using pdomCreateContextResponseAlert
      private _timesValueTextChangedBeforeAlerting = 0;

      // in ms, see options for documentation.
      private _contextResponsePerValueChangeDelay = 700;
      private _contextResponseMaxDelay = 1500;

      // Whether an input event has been handled. If handled, we will not respond to the
      // change event. An AT (particularly VoiceOver) may send a change event (and not an input event) to the
      // browser in response to a user gesture. We need to handle that change event, without also handling the
      // input event in case a device sends both events to the browser.
      private _pdomInputHandled = false;

      // Some browsers will receive `input` events when the user tabs away from the slider or
      // on some key presses - if we receive a keydown event for a tab key, do not allow input or change events
      private _blockInput = false;

      // setting to enable/disable rounding to the step size
      private _roundToStepSize = false;

      // key is the event.code for the range key, value is whether it is down
      private _rangeKeysDown: Record<string, boolean> = {};
      private _pdomMapPDOMValue: ( ( value: number ) => number ) = _.identity;
      private _pdomCreateAriaValueText: CreateTextFunction<number | null> = toString; // by default make sure it returns a string
      private _dependenciesMultilink: UnknownMultilink | null = null;
      private _pdomRepeatEqualValueText = true;

      // When context responses are supported, this counter is used to determine a mutable delay between hearing the
      // same response.
      private _timesChangedBeforeAlerting = 0;

      // Options for the Voicing response at the end of interaction with this component.
      private _voicingOnEndResponseOptions: VoicingOnEndResponseOptions = DEFAULT_VOICING_ON_END_RESPONSE_OPTIONS;

      // At the start of input, a listener is attached to the PDOMPointer to prevent listeners closer to the
      // scene graph root from firing. A reference to the pointer is saved to support interrupt because
      // there is no SceneryEvent.
      private _pdomPointer: PDOMPointer | null = null;
      private _pdomPointerListener: TInputListener;

      private readonly _pdomValueTextUpdateListener: () => void;
      private readonly _disposeAccessibleValueHandler: () => void;

      public constructor( ...args: IntentionalAny[] ) {

        const providedOptions = args[ optionsArgPosition ] as AccessibleValueHandlerOptions;

        assert && assert( providedOptions, 'providedOptions has required options' );
        assert && assert( providedOptions.enabledRangeProperty, 'enabledRangeProperty is a required option' );
        assert && assert( providedOptions.valueProperty, 'valueProperty is a required option' );

        assert && providedOptions && assert( !providedOptions.hasOwnProperty( 'tagName' ) || providedOptions.tagName === null,
          'AccessibleValueHandler sets its own tagName. Only provide tagName to clear accessible content from the PDOM' );

        // cannot be set by client
        assert && providedOptions && assert( !providedOptions.hasOwnProperty( 'inputType' ), 'AccessibleValueHandler sets its own inputType.' );

        // if rounding to keyboard step, keyboardStep must be defined so values aren't skipped and the slider
        // doesn't get stuck while rounding to the nearest value, see https://github.com/phetsims/sun/issues/410
        if ( assert && providedOptions && providedOptions.roundToStepSize ) {
          assert( providedOptions.keyboardStep, 'rounding to keyboardStep, define appropriate keyboardStep to round to' );
        }

        // Override options
        args[ optionsArgPosition ] = optionize<AccessibleValueHandlerOptions, SelfOptions, ParentOptions>()( {
          // @ts-expect-error - TODO: we should be able to have the public API be just null, and internally set to string, Limitation (IV), see https://github.com/phetsims/phet-core/issues/128
          tagName: DEFAULT_TAG_NAME,

          // parent options that we must provide a default to use
          inputType: 'range',

          // By default, the accessible value handler voicingHintResponse uses the same content as the accessibleHelpText.
          accessibleNameBehavior: Voicing.BASIC_ACCESSIBLE_NAME_BEHAVIOR,
          accessibleHelpTextBehavior: Voicing.BASIC_HELP_TEXT_BEHAVIOR
        }, providedOptions );
        super( ...args );

        // members of the Node API that are used by this trait
        assertHasProperties( this, [ 'inputValue', 'setPDOMAttribute' ] );

        const valueProperty = providedOptions.valueProperty;
        const enabledRangeProperty = providedOptions.enabledRangeProperty;

        if ( providedOptions.reverseAlternativeInput ) {

          // A DynamicProperty will invert the value before setting it to the actual valueProperty, and similarly
          // invert if the valueProperty changes externally.
          this._valueProperty = new DynamicProperty( new Property( valueProperty ), {
            bidirectional: true,
            map: ( propertyValue: number ) => enabledRangeProperty.value.max - propertyValue,
            inverseMap: ( propertyValue: number ) => enabledRangeProperty.value.max - propertyValue
          } );
        }
        else {
          this._valueProperty = valueProperty;
        }

        this._enabledRangeProperty = enabledRangeProperty;

        this._pdomValueTextUpdateListener = this.invalidateAriaValueText.bind( this );

        // initialized with setters that validate
        this.keyboardStep = ( enabledRangeProperty.get().max - enabledRangeProperty.get().min ) / 20;
        this.shiftKeyboardStep = ( enabledRangeProperty.get().max - enabledRangeProperty.get().min ) / 100;
        this.pageKeyboardStep = ( enabledRangeProperty.get().max - enabledRangeProperty.get().min ) / 10;

        this._valueOnStart = valueProperty.value;

        // be called last, after options have been set to `this`.
        this.invalidatePDOMDependencies();

        // listeners, must be unlinked in dispose
        const enabledRangeObserver = this.invalidateEnabledRange.bind( this );
        this._enabledRangeProperty.link( enabledRangeObserver );

        // when the property changes, be sure to update the accessible input value and aria-valuetext which is read
        // by assistive technology when the value changes
        const valuePropertyListener = this.invalidateValueProperty.bind( this );
        this._valueProperty.link( valuePropertyListener );

        // A listener that will be attached to the pointer to prevent other listeners from attaching.
        this._pdomPointerListener = {
          interrupt: (): void => {
            this._interruptAccessibleValueHandler( null );
          },
          cancel: (): void => {
            this._interruptAccessibleValueHandler( null );
          }
        };

        this._disposeAccessibleValueHandler = () => {
          this._enabledRangeProperty.unlink( enabledRangeObserver );
          this._valueProperty.unlink( valuePropertyListener );

          if ( providedOptions.reverseAlternativeInput ) {
            assert && assert(
              this._valueProperty instanceof DynamicProperty,
              'Only a DynamicProperty can be disposed, otherwise this is disposing a Property that AccessibleValueHandler does not have ownership over.'
            );
            this._valueProperty.dispose();
          }

          this._dependenciesMultilink && this._dependenciesMultilink.dispose();
          this._panTargetNode = null;
          this._pdomDependencies = [];
        };
      }

      public set startInput( value: SceneryListenerFunction ) {
        this._startInput = value;
      }

      public get startInput(): SceneryListenerFunction {
        return this._startInput;
      }

      public set onInput( value: OnInputFunction ) {
        this._onInput = value;
      }

      public get onInput(): OnInputFunction {
        return this._onInput;
      }

      public set endInput( value: ( ( event: SceneryEvent | null ) => void ) ) {
        this._endInput = value;
      }

      public get endInput(): ( event: SceneryEvent | null ) => void {
        return this._endInput;
      }

      public set constrainValue( value: ( ( value: number ) => number ) ) {
        // NOTE: Not currently re-constraining the value on set, since hopefully other things are doing this action.
        // If that's not done, we should do something about it here.
        this._constrainValue = value;
      }

      public get constrainValue(): ( ( value: number ) => number ) {
        return this._constrainValue;
      }

      public set panTargetNode( value: Node | null ) {
        this._panTargetNode = value;
      }

      public get panTargetNode(): Node | null {
        return this._panTargetNode;
      }

      public set roundToStepSize( value: boolean ) {
        this._roundToStepSize = value;
      }

      public get roundToStepSize(): boolean {
        return this._roundToStepSize;
      }

      public set pdomMapPDOMValue( value: ( ( value: number ) => number ) ) {
        this._pdomMapPDOMValue = value;

        this.invalidateEnabledRange( this._enabledRangeProperty.value );
        this.invalidateValueProperty();
        this.invalidateAriaValueText();
      }

      public get pdomMapPDOMValue(): ( ( value: number ) => number ) {
        return this._pdomMapPDOMValue;
      }

      public set pdomMapValue( value: ( ( newValue: number, previousValue: number ) => number ) ) {
        this._pdomMapValue = value;
      }

      public get pdomMapValue(): ( ( newValue: number, previousValue: number ) => number ) {
        return this._pdomMapValue;
      }

      public set pdomRepeatEqualValueText( value: boolean ) {
        this._pdomRepeatEqualValueText = value;

        this.invalidateAriaValueText();
      }

      public get pdomRepeatEqualValueText(): boolean {
        return this._pdomRepeatEqualValueText;
      }

      public set pdomCreateAriaValueText( value: CreateTextFunction<number | null> ) {
        this._pdomCreateAriaValueText = value;

        this.invalidateAriaValueText();
      }

      public get pdomCreateAriaValueText(): CreateTextFunction<number | null> {
        return this._pdomCreateAriaValueText;
      }

      public set pdomCreateContextResponseAlert( value: CreateTextFunction<number> | null ) {
        this._pdomCreateContextResponseAlert = value;
      }

      public get pdomCreateContextResponseAlert(): CreateTextFunction<number> | null {
        return this._pdomCreateContextResponseAlert;
      }

      public set contextResponsePerValueChangeDelay( value: number ) {
        this._contextResponsePerValueChangeDelay = value;
      }

      public get contextResponsePerValueChangeDelay(): number {
        return this._contextResponsePerValueChangeDelay;
      }

      public set contextResponseMaxDelay( value: number ) {
        this._contextResponseMaxDelay = value;
      }

      public get contextResponseMaxDelay(): number {
        return this._contextResponseMaxDelay;
      }

      public set voicingOnEndResponseOptions( value: VoicingOnEndResponseOptions ) {
        this._voicingOnEndResponseOptions = value;
      }

      public get voicingOnEndResponseOptions(): VoicingOnEndResponseOptions {
        return this._voicingOnEndResponseOptions;
      }

      private invalidateAriaValueText(): void {
        this._updateAriaValueText( this._oldValue );

        this._oldValue = this._valueProperty.value;
      }

      private invalidateEnabledRange( enabledRange: Range ): void {
        const mappedMin = this._getMappedValue( enabledRange.min );
        const mappedMax = this._getMappedValue( enabledRange.max );

        // pdom - update enabled slider range for AT, required for screen reader events to behave correctly
        this.setPDOMAttribute( 'min', mappedMin );
        this.setPDOMAttribute( 'max', mappedMax );

        // update the step attribute slider element - this attribute is only added because it is required to
        // receive accessibility events on all browsers, and is totally separate from the step values above that
        // will modify the valueProperty. See function for more information.
        this._updateSiblingStepAttribute();
      }

      private invalidateValueProperty(): void {
        const mappedValue = this._getMappedValue();

        // set the aria-valuenow attribute in case the AT requires it to read the value correctly, some may
        // fall back on this from aria-valuetext see
        // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_aria-valuetext_attribute#Possible_effects_on_user_agents_and_assistive_technology
        this.setPDOMAttribute( 'aria-valuenow', mappedValue );

        // update the PDOM input value on Property change
        this.inputValue = mappedValue;
      }

      private invalidatePDOMDependencies(): void {

        // dispose the previous multilink, there is only one set of dependencies, though they can be overwritten.
        this._dependenciesMultilink && this._dependenciesMultilink.dispose();

        this._dependenciesMultilink = Multilink.multilinkAny( this._pdomDependencies.concat( [ this._valueProperty ] ), this._pdomValueTextUpdateListener );
      }

      /**
       * There are some features of AccessibleValueHandler that support updating when more than just the valueProperty
       * changes. Use this method to set the dependency Properties for this value handler. This will blow away the
       * previous list (like Node.children).
       */
      public setPDOMDependencies( dependencies: TReadOnlyProperty<IntentionalAny>[] ): void {
        assert && assert( !dependencies.includes( this._valueProperty ),
          'The value Property is already a dependency, and does not need to be added to this list' );

        this._pdomDependencies = dependencies;

        this.invalidatePDOMDependencies();
      }

      public getPDOMDependencies(): TReadOnlyProperty<IntentionalAny>[] {
        return this._pdomDependencies;
      }

      public set pdomDependencies( value: TReadOnlyProperty<IntentionalAny>[] ) {
        this.setPDOMDependencies( value );
      }

      public get pdomDependencies(): TReadOnlyProperty<IntentionalAny>[] {
        return this.getPDOMDependencies();
      }

      private _updateAriaValueText( oldPropertyValue: number | null ): void {
        const mappedValue = this._getMappedValue();

        // create the dynamic aria-valuetext from pdomCreateAriaValueText.
        const newAriaValueTextValueType = this._pdomCreateAriaValueText( mappedValue, this._valueProperty.value, oldPropertyValue );
        let newAriaValueText = PDOMUtils.unwrapStringProperty( newAriaValueTextValueType )!;

        // eslint-disable-next-line phet/no-simple-type-checking-assertions
        assert && assert( typeof newAriaValueText === 'string' );

        // Make sure that the new aria-valuetext is different from the previous one, so that if they are the same
        // the screen reader will still read the new text - adding a hairSpace registers as a new string, but the
        // screen reader won't read that character.
        const hairSpace = '\u200A';
        if ( this._pdomRepeatEqualValueText && this.ariaValueText && newAriaValueText === this.ariaValueText.replace( new RegExp( hairSpace, 'g' ), '' ) ) {
          newAriaValueText = this.ariaValueText + hairSpace;
        }

        this.ariaValueText = newAriaValueText;
      }

      /**
       * If generating an alert when the user changes the slider value, create the alert content and send it
       * to the utteranceQueue. For VoiceOver, it is important that if the value is changed multiple times before
       * the alert can be spoken, we provide more time for the AT to finish speaking aria-valuetext. Otherwise, the
       * alert may be lost. See https://github.com/phetsims/gravity-force-lab-basics/issues/146.
       */
      public alertContextResponse(): void {

        // Alerting will occur to each connected display's UtteranceQueue, but we should only increment delay once per
        // time this function is called.
        let timesChangedBeforeAlertingIncremented = false;
        if ( this._pdomCreateContextResponseAlert ) {

          const mappedValue = this._getMappedValue();
          const endInteractionAlert = this._pdomCreateContextResponseAlert( mappedValue, this._valueProperty.value, this._valueOnStart );

          // only if it returned an alert
          if ( endInteractionAlert ) {
            this._contextResponseUtterance.alert = endInteractionAlert;
            this.forEachUtteranceQueue( ( utteranceQueue: UtteranceQueue ) => {

              // Only increment a single time, this has the constraint that if different utteranceQueues move this
              // alert through at a different time, the delay could be inconsistent, but in general it should work well.
              if ( timesChangedBeforeAlertingIncremented ) {
                // use the current value for this._timesChangedBeforeAlerting
              }
              else if ( utteranceQueue.hasUtterance( this._contextResponseUtterance ) ) {
                timesChangedBeforeAlertingIncremented = true;
                this._timesChangedBeforeAlerting++;
              }
              else {
                this._timesChangedBeforeAlerting = 1;
              }

              // Adjust the delay of the utterance based on number of times it has been re-added to the queue. Each
              // time the aria-valuetext changes, this method is called, we want to make sure to give enough time for the
              // aria-valuetext to fully complete before alerting this context response.
              this._contextResponseUtterance.alertStableDelay = Math.min( this._contextResponseMaxDelay,
                this._timesChangedBeforeAlerting * this._contextResponsePerValueChangeDelay );

              utteranceQueue.addToBack( this._contextResponseUtterance );
            } );
          }
        }
      }

      /**
       * Should be called after the model dependencies have been reset
       */
      public reset(): void {

        // reset the aria-valuetext creator if it supports that
        this._pdomCreateAriaValueText.reset && this._pdomCreateAriaValueText.reset();
        this._pdomCreateContextResponseAlert && this._pdomCreateContextResponseAlert.reset && this._pdomCreateContextResponseAlert.reset();

        this._timesChangedBeforeAlerting = 0;
        // on reset, make sure that the PDOM descriptions are completely up to date.
        this._updateAriaValueText( null );
      }

      /**
       * get the formatted value based on the current value of the Property.
       * @param [value] - if not provided, will use the current value of the valueProperty
       */
      private _getMappedValue( value: number = this._valueProperty.value ): number {
        return this._pdomMapPDOMValue( value );
      }

      /**
       * Return the input listener that could be attached to mixed in types of AccessibleValueHandler to support
       * interaction.
       */
      public getAccessibleValueHandlerInputListener(): TInputListener {
        return {
          keydown: this.handleKeyDown.bind( this ),
          keyup: this.handleKeyUp.bind( this ),
          input: this.handleInput.bind( this ),
          change: this.handleChange.bind( this ),
          blur: this.handleBlur.bind( this ),
          interrupt: this.handleInterrupt.bind( this )
        };
      }

      /**
       * Handle a keydown event so that the value handler behaves like a traditional input that modifies
       * a number. We expect the following:
       *   - Up Arrow/Right Arrow increments value by keyboardStep
       *   - Down Arrow/Left Arrow decrements value by step size
       *   - Page up/Page down will increment/decrement value pageKeyboardStep
       *   - Home/End will set value to min/max value for the range
       *   - Pressing shift with an arrow key will increment/decrement value by shiftKeyboardStep
       *
       * Add this as an input listener to the `keydown` event to the Node mixing in AccessibleValueHandler.
       */
      public handleKeyDown( event: SceneryEvent<KeyboardEvent> ): void {

        const domEvent = event.domEvent!;

        const key = KeyboardUtils.getEventCode( domEvent );

        if ( !key ) {
          return;
        }

        this._shiftKey = domEvent.shiftKey;

        // if we receive a 'tab' keydown event, do not allow the browser to react to this like a submission and
        // prevent responding to the `input` event
        if ( KeyboardUtils.isKeyEvent( domEvent, KeyboardUtils.KEY_TAB ) ) {
          this._blockInput = true;
        }

        if ( this.enabledProperty.get() ) {

          const englishKeyString = eventCodeToEnglishString( key )!;

          // Prevent default so browser doesn't change input value automatically
          if ( AccessibleValueHandlerHotkeyDataCollection.isRangeKey( englishKeyString ) ) {

            // This should prevent any "change" and "input" events so we don't change the value twice, but it also
            // prevents a VoiceOver issue where pressing arrow keys both changes the slider value AND moves the
            // virtual cursor. This needs to be done every range key event so that we don't change the value with
            // an 'input' or 'change' event, even when the meta key is down.
            domEvent.preventDefault();

            // On Mac, we don't get a keyup event when the meta key is down so don't change the value or do
            // anything that assumes we will get a corresponding keyup event, see
            // https://stackoverflow.com/questions/11818637/why-does-javascript-drop-keyup-events-when-the-metakey-is-pressed-on-mac-browser
            if ( !domEvent.metaKey ) {

              // signify that this listener is reserved for dragging so that other listeners can change
              // their behavior during scenery event dispatch
              event.pointer.reserveForKeyboardDrag();

              // whether we will use constrainValue to modify the proposed value, see usages below
              let useConstrainValue = true;

              // if this is the first keydown this is the start of the drag interaction
              if ( !this._anyKeysDown() ) {
                this._onInteractionStart( event );
              }

              // track that a new key is being held down
              this._rangeKeysDown[ key ] = true;

              let newValue = this._valueProperty.get();
              if ( HotkeyData.anyHaveKeyStroke( [ AccessibleValueHandlerHotkeyDataCollection.HOME_HOTKEY_DATA, AccessibleValueHandlerHotkeyDataCollection.END_HOTKEY_DATA ], englishKeyString ) ) {

                // on 'end' and 'home' snap to max and min of enabled range respectively (this is typical browser
                // behavior for sliders)
                if ( AccessibleValueHandlerHotkeyDataCollection.END_HOTKEY_DATA.hasKeyStroke( englishKeyString ) ) {
                  newValue = this._enabledRangeProperty.get().max;
                }
                else if ( AccessibleValueHandlerHotkeyDataCollection.HOME_HOTKEY_DATA.hasKeyStroke( englishKeyString ) ) {
                  newValue = this._enabledRangeProperty.get().min;
                }
              }
              else {
                let stepSize;
                if ( HotkeyData.anyHaveKeyStroke( [ AccessibleValueHandlerHotkeyDataCollection.PAGE_DOWN_HOTKEY_DATA, AccessibleValueHandlerHotkeyDataCollection.PAGE_UP_HOTKEY_DATA ], englishKeyString ) ) {

                  // on page up and page down, the default step size is 1/10 of the range (this is typical browser behavior)
                  stepSize = this.pageKeyboardStep;

                  if ( AccessibleValueHandlerHotkeyDataCollection.PAGE_UP_HOTKEY_DATA.hasKeyStroke( englishKeyString ) ) {
                    newValue = this._valueProperty.get() + stepSize;
                  }
                  else if ( AccessibleValueHandlerHotkeyDataCollection.PAGE_DOWN_HOTKEY_DATA.hasKeyStroke( englishKeyString ) ) {
                    newValue = this._valueProperty.get() - stepSize;
                  }
                }
                else if ( HotkeyData.anyHaveKeyStroke( [
                  AccessibleValueHandlerHotkeyDataCollection.LEFT_ARROW_HOTKEY_DATA, AccessibleValueHandlerHotkeyDataCollection.RIGHT_ARROW_HOTKEY_DATA,
                  AccessibleValueHandlerHotkeyDataCollection.UP_ARROW_HOTKEY_DATA, AccessibleValueHandlerHotkeyDataCollection.DOWN_ARROW_HOTKEY_DATA ], englishKeyString ) ) {

                  // if the shift key is pressed down, modify the step size (this is atypical browser behavior for sliders)
                  stepSize = domEvent.shiftKey ? this.shiftKeyboardStep : this.keyboardStep;

                  // Temporary workaround, if using shift key with arrow keys to use the shiftKeyboardStep, don't
                  // use constrainValue because the constrainValue is often smaller than the values allowed by
                  // constrainValue. See https://github.com/phetsims/sun/issues/698.
                  useConstrainValue = !domEvent.shiftKey;

                  if ( HotkeyData.anyHaveKeyStroke( [ AccessibleValueHandlerHotkeyDataCollection.UP_ARROW_HOTKEY_DATA, AccessibleValueHandlerHotkeyDataCollection.RIGHT_ARROW_HOTKEY_DATA ], englishKeyString ) ) {
                    newValue = this._valueProperty.get() + stepSize;
                  }
                  else if ( HotkeyData.anyHaveKeyStroke( [ AccessibleValueHandlerHotkeyDataCollection.DOWN_ARROW_HOTKEY_DATA, AccessibleValueHandlerHotkeyDataCollection.LEFT_ARROW_HOTKEY_DATA ], englishKeyString ) ) {
                    newValue = this._valueProperty.get() - stepSize;
                  }

                  if ( this._roundToStepSize ) {
                    newValue = roundValue( newValue, this._valueProperty.get(), stepSize );
                  }
                }
              }

              // Map the value.
              const mappedValue = this._pdomMapValue( newValue, this._valueProperty.get() );

              // Optionally constrain the value. Only constrain if modifying by shiftKeyboardStep because that step size
              // may allow finer precision than constrainValue. This is a workaround for
              // https://github.com/phetsims/sun/issues/698, and is actually a problem for all keyboard steps if they
              // are smaller than values allowed by constrainValue. In https://github.com/phetsims/sun/issues/703 we
              // will work to resolve this more generally.
              let constrainedValue = mappedValue;
              if ( useConstrainValue ) {
                constrainedValue = this._constrainValue( mappedValue );
              }

              // limit the value to the enabled range
              this._valueProperty.set( clamp( constrainedValue, this._enabledRangeProperty.get().min, this._enabledRangeProperty.get().max ) );

              // optional callback after the valueProperty is set (even if set to the same value) so that the listener
              // can use the new value.
              this._onInput( event, this._valueOnStart );

              // after any keyboard input, make sure that the Node stays in view
              const panTargetNode = this._panTargetNode || this;
              animatedPanZoomSingleton.initialized && animatedPanZoomSingleton.listener.panToNode( panTargetNode, true, panTargetNode.limitPanDirection );
            }
          }
        }
      }

      /**
       * Handle key up event on this accessible slider, managing the shift key, and calling an optional endDrag
       * function on release. Add this as an input listener to the node mixing in AccessibleValueHandler.
       * @mixin-protected - made public for use in the mixin only
       */
      public handleKeyUp( event: SceneryEvent<KeyboardEvent> ): void {
        const code = KeyboardUtils.getEventCode( event.domEvent )!;
        const englishKeyString = eventCodeToEnglishString( code )!;

        // handle case where user tabbed to this input while an arrow key might have been held down
        if ( this._allKeysUp() ) {
          return;
        }

        // reset shift key flag when we release it
        if ( AccessibleValueHandlerHotkeyDataCollection.SHIFT_HOTKEY_DATA.hasKeyStroke( englishKeyString ) ) {
          this._shiftKey = false;
        }

        if ( this.enabledProperty.get() ) {
          if ( AccessibleValueHandlerHotkeyDataCollection.isRangeKey( englishKeyString ) ) {
            this._rangeKeysDown[ code ] = false;

            // when all range keys are released, we are done dragging
            if ( this._allKeysUp() ) {
              this._onInteractionEnd( event );
            }
          }
        }
      }

      /**
       * VoiceOver sends a "change" event to the slider (NOT an input event), so we need to handle the case when
       * a change event is sent but an input event ins't handled. Guarded against the case that BOTH change and
       * input are sent to the browser by the AT.
       *
       * Add this as a listener to the 'change' input event on the Node that is mixing in AccessibleValueHandler.
       * @mixin-protected - made public for use in the mixin only
       */
      public handleChange( event: SceneryEvent ): void {

        if ( !this._pdomInputHandled ) {
          this.handleInput( event );
        }

        this._pdomInputHandled = false;
      }

      /**
       * Handle a direct 'input' event that might come from assistive technology. It is possible that the user agent
       * (particularly VoiceOver, or a switch device) will initiate an input event directly without going through
       * keydown. In that case, handle the change depending on which direction the user tried to go. We determine
       * this by detecting how the input value changed in response to the `input` event relative to the current
       * value of the valueProperty.
       *
       * Note that it is important to handle the "input" event, rather than the "change" event. The "input" will
       * fire when the value changes from a gesture, while the "change" will only happen on submission, like as
       * navigating away from the element.
       *
       * Add this as a listener to the `input` event on the Node that is mixing in AccessibleValueHandler.
       * @mixin-protected - made public for use in the mixin only
       */
      public handleInput( event: SceneryEvent ): void {
        if ( this.enabledProperty.get() && !this._blockInput ) {

          // don't handle again on "change" event
          this._pdomInputHandled = true;

          let newValue = this._valueProperty.get();

          const inputValue = parseFloat( ( event.domEvent!.target as HTMLInputElement ).value );
          const stepSize = this._shiftKey ? this.shiftKeyboardStep : this.keyboardStep;
          const mappedValue = this._getMappedValue();

          // start of change event is start of drag
          this._onInteractionStart( event );

          if ( inputValue > mappedValue ) {
            newValue = this._valueProperty.get() + stepSize;
          }
          else if ( inputValue < mappedValue ) {
            newValue = this._valueProperty.get() - stepSize;
          }

          if ( this._roundToStepSize ) {
            newValue = roundValue( newValue, this._valueProperty.get(), stepSize );
          }

          // limit to enabled range
          newValue = clamp( newValue, this._enabledRangeProperty.get().min, this._enabledRangeProperty.get().max );

          // optionally constrain value
          this._valueProperty.set( this._constrainValue( this._pdomMapValue( newValue, this._valueProperty.get() ) ) );

          // only one change per input, but still call optional onInput function - after valueProperty is set (even if
          // set to the same value) so listener can use new value.
          this._onInput( event, this._valueOnStart );

          // end of change is the end of a drag
          this._onInteractionEnd( event );
        }

        // don't block the next input after receiving one, some AT may send either `keydown` or `input` events
        // depending on modifier keys so we need to be ready to receive either on next interaction
        this._blockInput = false;
      }

      /**
       * Interrupt this AccessibleValueHandler by clearing flags and pointer listeners.
       */
      private _interruptAccessibleValueHandler( event: SceneryEvent | null ): void {

        // if any range keys are currently down, call end drag because user has stopped dragging to do something else
        if ( this._anyKeysDown() ) {
          this._onInteractionEnd( event );
        }

        assert && assert( this._pdomPointer === null, 'Pointer should have been cleared and detached on end or interrupt.' );

        // reset flag in case we shift-tabbed away from slider
        this._shiftKey = false;

        // when focus leaves this element stop blocking input events
        this._blockInput = false;

        // reset counter for range keys down
        this._rangeKeysDown = {};
      }

      /**
       * Fires when scenery interrupts this listener.
       */
      private handleInterrupt(): void {
        this._interruptAccessibleValueHandler( null );
      }

      /**
       * Fires when the accessible slider loses focus.
       *
       * Add this as a listener on the `blur` event to the Node that is mixing in AccessibleValueHandler.
       * @mixin-protected - made public for use in the mixin only
       */
      public handleBlur( event: SceneryEvent<FocusEvent> ): void {
        this._interruptAccessibleValueHandler( event );
      }

      /**
       * Interaction with this input has started, save the value on start so that it can be used as an "old" value
       * when generating the context response with option pdomCreateContextResponse.
       */
      private _onInteractionStart( event: SceneryEvent ): void {

        assert && assert( !this._pdomPointer, 'Pointer should have been cleared and detached on end or interrupt.' );
        this._pdomPointer = event.pointer as PDOMPointer;

        assert && assert( this._pdomPointer.attachedListener !== this._pdomPointerListener, 'This pointer listener was never removed!' );
        this._pdomPointer.addInputListener( this._pdomPointerListener, true );

        this._valueOnStart = this._valueProperty.value;
        this._startInput( event );
      }

      /**
       * Interaction with this input has completed, generate an utterance describing changes if necessary and call
       * optional "end" function.
       *
       * @param [event] - Event is not guaranteed because we need to support interruption
       */
      private _onInteractionEnd( event: SceneryEvent | null ): void {

        // It is possible that interaction already ended. This can happen if the pointer is interrupted just before
        // receiving a keyup event. This is a rare case and should only be possible while fuzzing.
        if ( this._pdomPointer ) {

          this.alertContextResponse();
          this.voicingOnEndResponse( this._valueOnStart );
          this._endInput( event );

          // detach the pointer listener that was attached on keydown
          assert && assert( this._pdomPointer.attachedListener === this._pdomPointerListener, 'pointer listener should be attached' );
          this._pdomPointer.removeInputListener( this._pdomPointerListener );
          this._pdomPointer = null;
        }
      }

      /**
       * Set the delta for the value Property when using arrow keys to interact with the Node.
       */
      public setKeyboardStep( keyboardStep: number ): void {
        assert && assert( keyboardStep >= 0, 'keyboard step must be non-negative' );

        this._keyboardStep = keyboardStep;
      }

      public set keyboardStep( keyboardStep: number ) { this.setKeyboardStep( keyboardStep ); }

      public get keyboardStep(): number { return this.getKeyboardStep(); }

      /**
       * Get the delta for value Property when using arrow keys.
       */
      public getKeyboardStep(): number {
        return this._keyboardStep;
      }

      /**
       * Set the delta for value Property when using arrow keys with shift to interact with the Node.
       */
      public setShiftKeyboardStep( shiftKeyboardStep: number ): void {
        assert && assert( shiftKeyboardStep >= 0, 'shift keyboard step must be non-negative' );

        this._shiftKeyboardStep = shiftKeyboardStep;
      }

      public set shiftKeyboardStep( shiftKeyboardStep: number ) { this.setShiftKeyboardStep( shiftKeyboardStep ); }

      public get shiftKeyboardStep(): number { return this.getShiftKeyboardStep(); }

      /**
       * Get the delta for value Property when using arrow keys with shift to interact with the Node.
       */
      public getShiftKeyboardStep(): number {
        return this._shiftKeyboardStep;
      }

      /**
       * Returns whether the shift key is currently held down on this slider, changing the size of step.
       */
      public getShiftKeyDown(): boolean {
        return this._shiftKey;
      }

      public get shiftKeyDown(): boolean { return this.getShiftKeyDown(); }

      /**
       * Set the delta for value Property when using page up/page down to interact with the Node.
       */
      public setPageKeyboardStep( pageKeyboardStep: number ): void {
        assert && assert( pageKeyboardStep >= 0, 'page keyboard step must be non-negative' );

        this._pageKeyboardStep = pageKeyboardStep;
      }

      public set pageKeyboardStep( pageKeyboardStep: number ) { this.setPageKeyboardStep( pageKeyboardStep ); }

      public get pageKeyboardStep(): number { return this.getPageKeyboardStep(); }

      /**
       * Get the delta for value Property when using page up/page down to interact with the Node.
       */
      public getPageKeyboardStep(): number {
        return this._pageKeyboardStep;
      }

      /**
       * Set the orientation for the slider as specified by https://www.w3.org/TR/wai-aria-1.1/#aria-orientation.
       * Depending on the value of this attribute, a screen reader will give different indications about which
       * arrow keys should be used
       */
      public setAriaOrientation( orientation: Orientation ): void {

        this._ariaOrientation = orientation;
        this.setPDOMAttribute( 'aria-orientation', orientation.ariaOrientation );
      }

      public set ariaOrientation( orientation: Orientation ) { this.setAriaOrientation( orientation ); }

      public get ariaOrientation(): Orientation { return this._ariaOrientation; }

      /**
       * Get the orientation of the accessible slider, see setAriaOrientation for information on the behavior of this
       * attribute.
       */
      public getAriaOrientation(): Orientation {
        return this._ariaOrientation;
      }

      /**
       * Returns true if all range keys are currently up (not held down).
       */
      private _allKeysUp(): boolean {
        return _.every( this._rangeKeysDown, entry => !entry );
      }

      /**
       * Returns true if any range keys are currently down on this slider. Useful for determining when to call
       * startDrag or endDrag based on interaction.
       */
      private _anyKeysDown(): boolean {
        return !!_.find( this._rangeKeysDown, entry => entry );
      }

      /**
       * Set the `step` attribute on accessible siblings for this Node. Usually, we can use the 'any' value,
       * which means that any value within the range is allowed. However, iOS VoiceOver does not support 'any'
       * so we have to calculate a valid step value for mobile Safari.
       *
       * The step attribute must be non-zero. Only values which are equal to min value plus
       * the basis of step are allowed. In other words, the following must always be true:
       * value = min + n * step where value <= max and n is an integer.
       *
       * If the input value is set to anything else, the result is confusing
       * keyboard behavior and the screen reader will say "Invalid" when the value changes.
       * See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/number#step
       *
       * This limitation is too restrictive for PhET as many sliders span physical ranges with keyboard steps that
       * are design to be convenient or pedagogically useful. For example, a slider that spans 0.01 to 15 requires
       * a step of 1, but DOM specification would only allow values 0.01, 1.01, 2.01, ...
       *
       * This restriction is why `step` attribute cannot equal keyboardStep of this trait.
       *
       * Also, if the step attribute is too small relative to the entire range of the slider VoiceOver doesn't allow
       * any input events because...VoiceOver is just interesting like that.
       *
       * Current workaround for all of this is to set the step size to support the precision of the value required
       * by the client so that all values are allowed. If we encounter the VoiceOver case described above we fall
       * back to setting the step size at 1/100th of the max value since the keyboard step generally evenly divides
       * the max value rather than the full range.
       *
       * See the following issues for history:
       * https://github.com/phetsims/sun/issues/413
       * https://github.com/phetsims/sun/issues/873
       */
      private _updateSiblingStepAttribute(): void {
        let stepValue: number | string = 'any';

        // TODO: Remove when iOS Safari supports the 'any', see https://github.com/phetsims/a11y-research/issues/191
        if ( platform.mobileSafari ) {

          const smallestStep = Math.min( this.keyboardStep, this.shiftKeyboardStep, this.pageKeyboardStep );
          stepValue = Math.pow( 10, -numberOfDecimalPlaces( smallestStep ) );

          const mappedMin = this._getMappedValue( this._enabledRangeProperty.get().min );
          const mappedMax = this._getMappedValue( this._enabledRangeProperty.get().max );
          const mappedLength = mappedMax - mappedMin;

          // If the step is too small relative to full range for VoiceOver to receive input, fall back to a portion of
          // the max value as a workaround.
          if ( stepValue / mappedLength < 1e-5 ) {
            stepValue = mappedMax / 100;

            // Limit the precision of the calculated value.  This is necessary because otherwise floating point
            // inaccuracies can lead to problematic behaviors with screen readers,
            // see https://github.com/phetsims/greenhouse-effect/issues/388. The number of significant digits was chosen
            // somewhat arbitrarily.
            stepValue = Number( stepValue.toPrecision( 8 ) );
          }
        }

        this.setPDOMAttribute( 'step', stepValue );
      }

      /**
       * Call this to trigger the voicing response spoken when an interaction ends. Will speak the current
       * name and object responses (according to options). Set those responses of Voicing.ts to hear up-to-date
       * Voicing responses at the end of an interaction.
       *
       * @param valueOnStart - Property value at the start of the interaction.
       * @param providedOptions
       */
      public voicingOnEndResponse( valueOnStart: number, providedOptions?: VoicingOnEndResponseOptions ): void {
        const options = combineOptions<VoicingOnEndResponseOptions>( {}, this._voicingOnEndResponseOptions, providedOptions );

        const valueChanged = valueOnStart !== this._valueProperty.value;
        const valueAtMinMax = this._valueProperty.value === this._enabledRangeProperty.value.min ||
                              this._valueProperty.value === this._enabledRangeProperty.value.max;

        // content required to speak a response and add to back of UtteranceQueue.
        const responseContentExists = !!( options.withNameResponse && this.voicingNameResponse ) ||
                                      !!( options.withObjectResponse && this.voicingObjectResponse );
        const shouldSpeak = ( !options.onlyOnValueChange || // speak each time if onlyOnValueChange is false.
                              valueAtMinMax || // always speak at edges, for "go beyond" responses
                              valueChanged ) && // If the value changed
                            responseContentExists;

        shouldSpeak && this.voicingSpeakFullResponse( {
          nameResponse: options.withNameResponse ? this.voicingNameResponse : null,
          objectResponse: options.withObjectResponse ? this.voicingObjectResponse : null,
          hintResponse: null // no hint, there was just a successful interaction
        } );
      }

      public override dispose(): void {
        this._disposeAccessibleValueHandler();

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
  AccessibleValueHandlerClass.prototype._mutatorKeys = ACCESSIBLE_VALUE_HANDLER_OPTIONS.concat( AccessibleValueHandlerClass.prototype._mutatorKeys );

  assert && assert( AccessibleValueHandlerClass.prototype._mutatorKeys.length === _.uniq( AccessibleValueHandlerClass.prototype._mutatorKeys ).length, 'duplicate mutator keys in AccessibleValueHandler' );

  return AccessibleValueHandlerClass;
};

sun.register( 'AccessibleValueHandler', AccessibleValueHandler );

/**
 * Round the value to the nearest step size.
 *
 * @param newValue - value to be rounded
 * @param currentValue - current value of the Property associated with this slider
 * @param stepSize - the delta for this manipulation
 */
const roundValue = function( newValue: number, currentValue: number, stepSize: number ): number {
  let roundValue = newValue;
  if ( stepSize !== 0 ) {

    // round the value to the nearest keyboard step
    roundValue = roundSymmetric( roundValue / stepSize ) * stepSize;

    // go back a step if we went too far due to rounding
    roundValue = correctRounding( roundValue, currentValue, stepSize );
  }
  return roundValue;
};

/**
 * Helper function, it is possible due to rounding to go up or down a step if we have passed the nearest step during
 * keyboard interaction. This function corrects that.
 *
 */
const correctRounding = function( newValue: number, currentValue: number, stepSize: number ): number {
  let correctedValue = newValue;

  const proposedStep = Math.abs( newValue - currentValue );
  const stepToFar = proposedStep > stepSize;

  // it is possible that proposedStep will be larger than the stepSize but only because of precision
  // constraints with floating point values, don't correct if that is the cases
  const stepsAboutEqual = equalsEpsilon( proposedStep, stepSize, 1e-14 );
  if ( stepToFar && !stepsAboutEqual ) {
    correctedValue += ( newValue > currentValue ) ? ( -stepSize ) : stepSize;
  }
  return correctedValue;
};

AccessibleValueHandler.DEFAULT_TAG_NAME = DEFAULT_TAG_NAME;

export default AccessibleValueHandler;