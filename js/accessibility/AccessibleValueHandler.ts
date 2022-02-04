// Copyright 2019-2022, University of Colorado Boulder

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

import Property from '../../../axon/js/Property.js';
import Utils from '../../../dot/js/Utils.js';
import Range from '../../../dot/js/Range.js';
import assertHasProperties from '../../../phet-core/js/assertHasProperties.js';
import inheritance from '../../../phet-core/js/inheritance.js';
import Orientation from '../../../phet-core/js/Orientation.js';
import { animatedPanZoomSingleton, IInputListener, KeyboardUtils, Node, NodeOptions, SceneryEvent, SceneryListenerFunction, Voicing } from '../../../scenery/js/imports.js';
import Utterance from '../../../utterance-queue/js/Utterance.js';
import sun from '../sun.js';
import optionize, { Defaults } from '../../../phet-core/js/optionize.js';
import Multilink from '../../../axon/js/Multilink.js';
import UtteranceQueue from '../../../utterance-queue/js/UtteranceQueue.js';
import IProperty from '../../../axon/js/IProperty.js';
import Constructor from '../../../phet-core/js/Constructor.js';

// constants
const DEFAULT_TAG_NAME = 'input';
const toString = ( v: any ) => `${v}`;


type CreateTextFunction = {

  /**
   * @param pdomMappedValue - see
   * @param newValue - the new value, unformatted
   * @param previousValue - just the "oldValue" from the Property listener
   * @returns - text/response/string to be set to the primarySibling, null means nothing will happen
   * */
  ( pdomMappedValue: number, newValue: number, previousValue: number | null ): string | null,

  // if this function needs resetting, include a `reset` field on this function to be called when the
  // AccessibleValueHandler is reset.
  reset?: () => void
}

type VoicingOnEndResponseOptions = {
  onlyOnValueChange?: boolean;
  withObjectResponse?: boolean;
};
type VoicingOnChangeResponseOptions = {
  objectResponse?: string | null;
};

type AccessibleValueHandlerSelfOptions = {
  valueProperty: IProperty<number>;
  enabledRangeProperty: IProperty<Range>;

  startChange?: SceneryListenerFunction;
  endChange?: SceneryListenerFunction;
  onChange?: SceneryListenerFunction;
  constrainValue?: ( value: number ) => number;
  keyboardStep?: number;
  shiftKeyboardStep?: number;
  pageKeyboardStep?: number;
  ariaOrientation?: Orientation;
  panTargetNode?: null | Node;
  roundToStepSize?: boolean;
  a11yMapPDOMValue?: ( value: number ) => number;
  a11yMapValue?: ( newValue: number, previousValue: number ) => number;
  a11yRepeatEqualValueText?: boolean;
  a11yCreateAriaValueText?: CreateTextFunction;
  a11yCreateContextResponseAlert?: CreateTextFunction | null;
  contextResponsePerValueChangeDelay?: number;
  contextResponseMaxDelay?: number;
  a11yDependencies?: Property<any>[];
  voicingCreateObjectResponse?: ( () => null | string ) | null;
  voicingCreateContextResponse?: ( () => null | string ) | null;
};

type AccessibleValueHandlerOptions = AccessibleValueHandlerSelfOptions & Omit<NodeOptions, 'tagName' | 'inputType'>;

/**
 * @param Type
 * @param optionsArgPosition - zero-indexed number that the options argument is provided at
 */
const AccessibleValueHandler = <SuperType extends Constructor>( Type: SuperType, optionsArgPosition: number ) => {
  assert && assert( _.includes( inheritance( Type ), Node ), 'Only Node subtypes should compose AccessibleValueHandler' );

  const VoicingClass = Voicing( Type, optionsArgPosition );

  // Unfortunately, nothing can be private or protected in this class, see https://github.com/phetsims/scenery/issues/1340#issuecomment-1020692592
  return class extends VoicingClass {
    _valueProperty: IProperty<number>;
    _enabledRangeProperty: IProperty<Range>;
    _startChange: SceneryListenerFunction;
    _onChange: SceneryListenerFunction;
    _endChange: SceneryListenerFunction;
    _constrainValue: ( ( value: number ) => number );
    _a11yMapValue: ( ( newValue: number, previousValue: number ) => number );
    _panTargetNode: Node | null;
    _keyboardStep: number;
    _shiftKeyboardStep: number;
    _pageKeyboardStep: number;
    _ariaOrientation: Orientation;
    _shiftKey: boolean;
    oldValue: number | null; // TODO: use underscore so that there is a "private" convention. https://github.com/phetsims/scenery/issues/1348
    a11yCreateContextResponseAlert: CreateTextFunction | null; // TODO: use underscore so that there is a "private" convention. https://github.com/phetsims/scenery/issues/1348
    valueOnStart: number; // TODO: use underscore so that there is a "private" convention. https://github.com/phetsims/scenery/issues/1348
    contextResponseUtterance: Utterance; // TODO: use underscore so that there is a "private" convention. https://github.com/phetsims/scenery/issues/1348
    timesValueTextChangedBeforeAlerting: number; // TODO: use underscore so that there is a "private" convention. https://github.com/phetsims/scenery/issues/1348
    contextResponsePerValueChangeDelay: number; // TODO: use underscore so that there is a "private" convention. https://github.com/phetsims/scenery/issues/1348
    contextResponseMaxDelay: number; // TODO: use underscore so that there is a "private" convention. https://github.com/phetsims/scenery/issues/1348
    a11yInputHandled: boolean; // TODO: use underscore so that there is a "private" convention. https://github.com/phetsims/scenery/issues/1348
    blockInput: boolean; // TODO: use underscore so that there is a "private" convention. https://github.com/phetsims/scenery/issues/1348
    roundToStepSize: boolean; // TODO: use underscore so that there is a "private" convention. https://github.com/phetsims/scenery/issues/1348
    rangeKeysDown: { [ key: string ]: boolean }; // TODO: use underscore so that there is a "private" convention. https://github.com/phetsims/scenery/issues/1348
    a11yMapPDOMValue: ( ( value: number ) => number ); // TODO: use underscore so that there is a "private" convention. https://github.com/phetsims/scenery/issues/1348
    a11yCreateAriaValueText: CreateTextFunction; // TODO: use underscore so that there is a "private" convention. https://github.com/phetsims/scenery/issues/1348
    _dependenciesMultilink: Multilink<any[]> | null;
    _a11yRepeatEqualValueText: boolean;
    timesChangedBeforeAlerting: number; // TODO: use underscore so that there is a "private" convention. https://github.com/phetsims/scenery/issues/1348
    _voicingCreateContextResponse: ( () => null | string ) | null;
    _voicingCreateObjectResponse: ( () => null | string ) | null;
    _disposeAccessibleValueHandler: () => void;

    constructor( ...args: any[] ) {

      const providedOptions = args[ optionsArgPosition ] as AccessibleValueHandlerOptions;

      assert && assert( providedOptions, 'providedOptions has required options' );
      assert && assert( providedOptions.enabledRangeProperty, 'enabledRangeProperty is a required option' );
      assert && assert( providedOptions.valueProperty, 'valueProperty is a required option' );
      const enabledRangeProperty = providedOptions.enabledRangeProperty;

      // if rounding to keyboard step, keyboardStep must be defined so values aren't skipped and the slider
      // doesn't get stuck while rounding to the nearest value, see https://github.com/phetsims/sun/issues/410
      if ( assert && providedOptions && providedOptions.roundToStepSize ) {
        assert( providedOptions.keyboardStep, 'rounding to keyboardStep, define appropriate keyboardStep to round to' );
      }


      const defaults: Defaults<AccessibleValueHandlerSelfOptions, NodeOptions> = {

        // other
        startChange: _.noop, // called when a value change sequence starts
        endChange: _.noop, // called when a value change sequence ends

        // Called after any change to valueProperty. Useful for input devices that support "press and hold" input.
        // However, beware that some input devices, such as a switch, have no concept of "press and hold" and will
        // trigger once per input. In those cases, this function will be called once per input.
        onChange: _.noop,

        // Constrains the value, returning a new value for the valueProperty instead.
        // Called before the valueProperty is set. This is only called when the shift key is NOT down because
        // it is often the case that shiftKeyboardStep is a smaller step size then what is allowed by constrainValue.
        constrainValue: _.identity,

        // delta for the valueProperty for each press of the arrow keys
        keyboardStep: ( enabledRangeProperty.get().max - enabledRangeProperty.get().min ) / 20,

        // delta for the valueProperty for each press of the arrow keys while the shift modifier is down
        shiftKeyboardStep: ( enabledRangeProperty.get().max - enabledRangeProperty.get().min ) / 100,

        // delta for the valueProperty for each press of "Page Up" and "Page Down"
        pageKeyboardStep: ( enabledRangeProperty.get().max - enabledRangeProperty.get().min ) / 10,

        ariaOrientation: Orientation.HORIZONTAL, // specify orientation, read by assistive technology

        // Upon accessible input, we will try to keep this Node in view of the animatedPanZoomSingleton.
        // If null, 'this' is used (the Node mixing AccessibleValueHandler)
        panTargetNode: null,

        // When setting the Property value from the PDOM input, this option controls whether or not to
        // round the value to a multiple of the keyboardStep. This will only round the value on normal key presses,
        // rounding will not occur on large jumps like page up/page down/home/end.
        // see https://github.com/phetsims/gravity-force-lab-basics/issues/72
        roundToStepSize: false,

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
         */
        a11yMapPDOMValue: _.identity,

        /**
         * Called before constraining and setting the Property. This is useful in rare cases where the value being set
         * by AccessibleValueHandler may change based on outside logic. This is for mapping value changes from input listeners
         * assigned in this type (keyboard/alt-input) to a new value before the value is set.
         */
        a11yMapValue: _.identity,

        /**
         * If true, the aria-valuetext will be spoken every value change, even if the aria-valuetext doesn't
         * actually change. By default, screen readers won't speak aria-valuetext if it remains the same for
         * multiple values.
         */
        a11yRepeatEqualValueText: true,

        /**
         * aria-valuetext creation function, called when the valueProperty changes.
         * This string is read by AT every time the slider value changes. This is often called the "object response"
         * for this interaction.
         */
        a11yCreateAriaValueText: toString, // by default make sure it returns a string

        /**
         * Create content for an alert that will be sent to the utteranceQueue when the user finishes interacting
         * with the input. Is not generated every change, but on every "drag" interaction, this is called with
         * endChange. With a keyboard, this will be called even with no value change (on the key up event ending the
         * interaction), On a touch system like iOS with Voice Over however, input and change events will only fire
         * when there is a Property value change, so "edge" alerts will not fire, see https://github.com/phetsims/gravity-force-lab-basics/issues/185.
         * This alert is often called the "context response" because it is timed to only alert after an interaction
         * end, instead of each time the value changes.
         *
         * If function returns null, then no alert will be sent to utteranceQueue for alerting.
         *
         * This function can also support a `reset` function on it, to be called when the AccessibleValueHandler is reset
         */
        a11yCreateContextResponseAlert: null,

        // This coefficient is multiplied by the number of times the value has been changed without the context response
        // alerting. This number is meant to give the screen reader enough chance to finish reading the aria-valuetext,
        // which could take longer the more time the value changes. We want to give enough time for VO to read
        // aria-valuetext but don't want to have too much silence before the alert is spoken.
        contextResponsePerValueChangeDelay: 700,

        // in ms, When the valueProperty changes repeatedly, what is the maximum time to set the
        // alertStableDelay for the context response to. This value should be small enough that it feels like you are
        // aiting for this alert after an interaction. This should be altered depending on how quickly you expect the
        // value to change. We want to give enough time for VO to read aria-valuetext but don't want to have too much
        // silence before the alert is spoken.
        contextResponseMaxDelay: 1500,

        /**
         * List the dependencies this Node's PDOM descriptions have. This should not include the valueProperty, but
         * should list any Properties whose change should trigger a description update for this Node.
         */
        a11yDependencies: [],

        // Returning null signifies that there is no response
        voicingCreateObjectResponse: null,
        voicingCreateContextResponse: null,

        // parent options that we must provide a default to use
        tagName: null,
        inputType: null
      };

      // TODO: how to handle voicingOptions, https://github.com/phetsims/scenery/issues/1340
      const options = optionize<AccessibleValueHandlerOptions, AccessibleValueHandlerSelfOptions, NodeOptions>( {}, defaults, providedOptions );

      // cannot be set by client
      assert && providedOptions && assert( !providedOptions.hasOwnProperty( 'tagName' ), 'AccessibleValueHandler sets its own tagName.' );
      assert && providedOptions && assert( !providedOptions.hasOwnProperty( 'inputType' ), 'AccessibleValueHandler sets its own inputType.' );
      options.tagName = DEFAULT_TAG_NAME;
      options.inputType = 'range';

      args[ optionsArgPosition ] = options;
      super( ...args );

      const thisNode = this as unknown as Node;

      // members of the Node API that are used by this trait
      assertHasProperties( this, [ 'inputValue', 'setPDOMAttribute' ] );

      this._valueProperty = options.valueProperty;

      this._enabledRangeProperty = enabledRangeProperty;

      this._startChange = options.startChange;

      this._onChange = options.onChange;

      this._endChange = options.endChange;

      this._constrainValue = options.constrainValue;

      this._a11yMapValue = options.a11yMapValue;

      this._panTargetNode = options.panTargetNode;

      // initialized with setKeyboardStep which does some validating
      this._keyboardStep = defaults.keyboardStep;
      this.setKeyboardStep( options.keyboardStep );

      this._shiftKeyboardStep = defaults.shiftKeyboardStep;
      this.setShiftKeyboardStep( options.shiftKeyboardStep );

      this._pageKeyboardStep = defaults.pageKeyboardStep;
      this.setPageKeyboardStep( options.pageKeyboardStep );

      this._shiftKey = false;

      this._ariaOrientation = defaults.ariaOrientation;
      this.ariaOrientation = options.ariaOrientation;

      // track previous values for callbacks outside of Property listeners
      this.oldValue = null;

      // The Property value when an interaction starts, so it can be used as the "old" value
      // when generating a context response at the end of an interaction with a11yCreateContextResponseAlert.
      this.valueOnStart = this._valueProperty.value;

      this.a11yCreateContextResponseAlert = options.a11yCreateContextResponseAlert;

      // Number of times the input has changed in value before the utterance made
      // was able to be spoken, only applicable if using a11yCreateContextResponseAlert
      this.timesValueTextChangedBeforeAlerting = 0;

      // The utterance sent to the utteranceQueue when the value changes, alert content generated by
      // optional a11yCreateContextResponseAlert. The alertStableDelay on this utterance will increase if the input
      // receives many interactions before the utterance can be announced so that VoiceOver has time to read the
      // aria-valuetext (object response) before the alert (context response).
      this.contextResponseUtterance = new Utterance();

      // in ms, see options for documentation.
      this.contextResponsePerValueChangeDelay = options.contextResponsePerValueChangeDelay;
      this.contextResponseMaxDelay = options.contextResponseMaxDelay;

      // Whether or not an input event has been handled. If handled, we will not respond to the
      // change event. An AT (particularly VoiceOver) may send a change event (and not an input event) to the
      // browser in response to a user gesture. We need to handle that change event, whithout also handling the
      // input event in case a device sends both events to the browser.
      this.a11yInputHandled = false;

      // Some browsers will receive `input` events when the user tabs away from the slider or
      // on some key presses - if we receive a keydown event for a tab key, do not allow input or change events
      this.blockInput = false;

      // key is the event.code for the range key, value is whether it is down
      this.rangeKeysDown = {};

      // setting to enable/disable rounding to the step size
      this.roundToStepSize = options.roundToStepSize;

      this.a11yMapPDOMValue = options.a11yMapPDOMValue;

      this.a11yCreateAriaValueText = options.a11yCreateAriaValueText;

      this._dependenciesMultilink = null;

      this._a11yRepeatEqualValueText = options.a11yRepeatEqualValueText;

      // When context responses are supported, this counter is used to determine a mutable delay between hearing the
      // same response.
      this.timesChangedBeforeAlerting = 0;

      this._voicingCreateObjectResponse = options.voicingCreateObjectResponse;
      this._voicingCreateContextResponse = options.voicingCreateContextResponse;

      // be called last, after options have been set to `this`.
      this.setA11yDependencies( options.a11yDependencies );

      // listeners, must be unlinked in dispose
      const enabledRangeObserver = ( enabledRange: Range ) => {

        const mappedMin = this.getMappedValue( enabledRange.min );
        const mappedMax = this.getMappedValue( enabledRange.max );

        // TODO: should this assert be added back in? Right now area model fails it, see https://github.com/phetsims/sun/issues/530
        // assert && assert( mappedMin <= mappedMax, 'min should be less than max' );

        // pdom - update enabled slider range for AT, required for screen reader events to behave correctly
        thisNode.setPDOMAttribute( 'min', mappedMin );
        thisNode.setPDOMAttribute( 'max', mappedMax );

        // update the step attribute slider element - this attribute is only added because it is required to
        // receive accessibility events on all browsers, and is totally separate from the step values above that
        // will modify the valueProperty. See function for more information.
        this.updateSiblingStepAttribute();
      };
      this._enabledRangeProperty.link( enabledRangeObserver );

      // when the property changes, be sure to update the accessible input value and aria-valuetext which is read
      // by assistive technology when the value changes
      const valuePropertyListener = () => {

        const mappedValue = this.getMappedValue();

        // set the aria-valuenow attribute in case the AT requires it to read the value correctly, some may
        // fall back on this from aria-valuetext see
        // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_aria-valuetext_attribute#Possible_effects_on_user_agents_and_assistive_technology
        thisNode.setPDOMAttribute( 'aria-valuenow', mappedValue );

        // update the PDOM input value on Property change
        thisNode.inputValue = mappedValue;
      };
      this._valueProperty.link( valuePropertyListener );

      this._disposeAccessibleValueHandler = () => {
        this._enabledRangeProperty.unlink( enabledRangeObserver );
        this._valueProperty.unlink( valuePropertyListener );
        this._dependenciesMultilink && this._dependenciesMultilink.dispose();
      };
    }

    /**
     * There are some features of AccessibleValueHandler that support updating when more than just the valueProperty
     * changes. Use this method to set the dependency Properties for this value handler. This will blow away the
     * previous list (like Node.children).
     */
    setA11yDependencies( dependencies: IProperty<any>[] ) {
      assert && assert( Array.isArray( dependencies ) );
      assert && assert( dependencies.indexOf( this._valueProperty ) === -1,
        'The value Property is already a dependency, and does not need to be added to this list' );
      assert && dependencies.forEach( property => {
        assert && assert( property instanceof Property, `${property} is not an instance of Property` );
      } );

      // dispose the previous multilink, there is only one set of dependencies, though they can be overwritten.
      this._dependenciesMultilink && this._dependenciesMultilink.dispose();

      this._dependenciesMultilink = Property.multilink<any[]>( dependencies.concat( [ this._valueProperty ] ), () => {

        this.updateAriaValueText( this.oldValue );

        if ( this._voicingCreateObjectResponse ) {
          this.voicingObjectResponse = this._voicingCreateObjectResponse();
        }
        this.oldValue = this._valueProperty.value;
      } );
    }

    /**
     * TODO: we want this to be @private, https://github.com/phetsims/scenery/issues/1348
     */
    updateAriaValueText( oldPropertyValue: number | null ) {
      const mappedValue = this.getMappedValue();

      const thisNode = this as unknown as Node;

      // create the dynamic aria-valuetext from a11yCreateAriaValueText.
      let newAriaValueText = this.a11yCreateAriaValueText( mappedValue, this._valueProperty.value, oldPropertyValue );
      assert && assert( typeof newAriaValueText === 'string' );

      // Make sure that the new aria-valuetext is different from the previous one, so that if they are the same
      // the screen reader will still read the new text - adding a hairSpace registers as a new string, but the
      // screen reader won't read that character.
      const hairSpace = '\u200A';
      if ( this._a11yRepeatEqualValueText && thisNode.ariaValueText && newAriaValueText === thisNode.ariaValueText.replace( new RegExp( hairSpace, 'g' ), '' ) ) {
        newAriaValueText = thisNode.ariaValueText + hairSpace;
      }

      thisNode.ariaValueText = newAriaValueText;
    }

    /**
     * If generating an alert when the user changes the slider value, create the alert content and send it
     * to the utterancQueue. For VoiceOver, it is important that if the value is changed multiple times before
     * the alert can be spoken, we provide more time for the AT to finish speaking aria-valuetext. Otherwise, the
     * alert may be lost. See https://github.com/phetsims/gravity-force-lab-basics/issues/146.
     */
    alertContextResponse() {

      // Alerting will occur to each connected display's UtteranceQueue, but we should only increment delay once per
      // time this function is called.
      let timesChangedBeforeAlertingIncremented = false;
      if ( this.a11yCreateContextResponseAlert ) {

        const mappedValue = this.getMappedValue();
        const endInteractionAlert = this.a11yCreateContextResponseAlert( mappedValue, this._valueProperty.value, this.valueOnStart );

        // only if it returned an alert
        if ( endInteractionAlert ) {
          this.contextResponseUtterance.alert = endInteractionAlert;
          ( this as unknown as Node ).forEachUtteranceQueue( ( utteranceQueue: UtteranceQueue ) => {

            // Only increment a single time, this has the constraint that if different utteranceQueues move this
            // alert through at a different time, the delay could be inconsistent, but in general it should work well.
            if ( timesChangedBeforeAlertingIncremented ) {
              // use the current value for this.timesChangedBeforeAlerting
            }
            else if ( utteranceQueue.hasUtterance( this.contextResponseUtterance ) ) {
              timesChangedBeforeAlertingIncremented = true;
              this.timesChangedBeforeAlerting++;
            }
            else {
              this.timesChangedBeforeAlerting = 1;
            }

            // Adjust the delay of the utterance based on number of times it has been re-added to the queue. Each
            // time the aria-valuetext changes, this method is called, we want to make sure to give enough time for the
            // aria-valuetext to fully complete before alerting this context response.
            this.contextResponseUtterance.alertStableDelay = Math.min( this.contextResponseMaxDelay,
              this.timesChangedBeforeAlerting * this.contextResponsePerValueChangeDelay );

            utteranceQueue.addToBack( this.contextResponseUtterance );
          } );
        }
      }
    }

    /**
     * Should be called after the model dependencies have been reset
     */
    reset() {

      // reset the aria-valuetext creator if it supports that
      this.a11yCreateAriaValueText.reset && this.a11yCreateAriaValueText.reset();
      this.a11yCreateContextResponseAlert && this.a11yCreateContextResponseAlert.reset && this.a11yCreateContextResponseAlert.reset();

      this.timesChangedBeforeAlerting = 0;
      // on reset, make sure that the PDOM descriptions are completely up to date.
      this.updateAriaValueText( null );

      if ( this._voicingCreateObjectResponse ) {
        this.voicingObjectResponse = this._voicingCreateObjectResponse();
      }
    }

    /**
     * get the formatted value based on the current value of the Property.
     * @param [value] - if not provided, will use the current value of the valueProperty
     * TODO: we want this to be @private, https://github.com/phetsims/scenery/issues/1348
     */
    getMappedValue( value = this._valueProperty.value ): number {
      const mappedValue = this.a11yMapPDOMValue( value );
      assert && assert( typeof mappedValue === 'number', 'a11yMapPDOMValue must return a number' );

      return mappedValue;
    }

    /**
     * Return the input listener that could be attached to mixed in types of AccessibleValueHandler to support
     * interaction.
     */
    getAccessibleValueHandlerInputListener(): IInputListener {
      return {
        keydown: this.handleKeyDown.bind( this ),
        keyup: this.handleKeyUp.bind( this ),
        input: this.handleInput.bind( this ),
        change: this.handleChange.bind( this ),
        blur: this.handleBlur.bind( this )
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
    handleKeyDown( event: SceneryEvent ) {

      // TODO: How to specify subtypes of DOMEvents, https://github.com/phetsims/scenery/issues/1340
      const domEvent = event.domEvent as Event & { shiftKey: boolean, metaKey: boolean };

      // TODO: What if key is null? https://github.com/phetsims/scenery/issues/1340
      const key = KeyboardUtils.getEventCode( domEvent )!;

      this._shiftKey = domEvent.shiftKey;


      // if we receive a 'tab' keydown event, do not allow the browser to react to this like a submission and
      // prevent responding to the `input` event
      if ( KeyboardUtils.isKeyEvent( domEvent, KeyboardUtils.KEY_TAB ) ) {
        this.blockInput = true;
      }

      if ( ( this as unknown as Node ).enabledProperty.get() ) {

        // Prevent default so browser doesn't change input value automatically
        if ( KeyboardUtils.isRangeKey( domEvent ) ) {

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

            // whether or not we will use constrainValue to modify the proposed value, see usages below
            let useConstrainValue = true;

            // if this is the first keydown this is the start of the drag interaction
            if ( !this.anyKeysDown() ) {
              this.onInteractionStart( event );
            }

            // track that a new key is being held down
            this.rangeKeysDown[ key ] = true;

            let newValue = this._valueProperty.get();
            if ( KeyboardUtils.isAnyKeyEvent( domEvent, [ KeyboardUtils.KEY_END, KeyboardUtils.KEY_HOME ] ) ) {

              // on 'end' and 'home' snap to max and min of enabled range respectively (this is typical browser
              // behavior for sliders)
              if ( key === KeyboardUtils.KEY_END ) {
                newValue = this._enabledRangeProperty.get().max;
              }
              else if ( key === KeyboardUtils.KEY_HOME ) {
                newValue = this._enabledRangeProperty.get().min;
              }
            }
            else {
              let stepSize;
              if ( key === KeyboardUtils.KEY_PAGE_UP || key === KeyboardUtils.KEY_PAGE_DOWN ) {
                // on page up and page down, the default step size is 1/10 of the range (this is typical browser behavior)
                stepSize = this.pageKeyboardStep;

                if ( key === KeyboardUtils.KEY_PAGE_UP ) {
                  newValue = this._valueProperty.get() + stepSize;
                }
                else if ( key === KeyboardUtils.KEY_PAGE_DOWN ) {
                  newValue = this._valueProperty.get() - stepSize;
                }
              }
              else if ( KeyboardUtils.isArrowKey( domEvent ) ) {

                // if the shift key is pressed down, modify the step size (this is atypical browser behavior for sliders)
                stepSize = domEvent.shiftKey ? this.shiftKeyboardStep : this.keyboardStep;

                // Temporary workaround, if using shift key with arrow keys to use the shiftKeyboardStep, don't
                // use constrainValue because the constrainValue is often smaller than the values allowed by
                // constrainValue. See https://github.com/phetsims/sun/issues/698.
                useConstrainValue = !domEvent.shiftKey;

                if ( key === KeyboardUtils.KEY_RIGHT_ARROW || key === KeyboardUtils.KEY_UP_ARROW ) {
                  newValue = this._valueProperty.get() + stepSize;
                }
                else if ( key === KeyboardUtils.KEY_LEFT_ARROW || key === KeyboardUtils.KEY_DOWN_ARROW ) {
                  newValue = this._valueProperty.get() - stepSize;
                }

                if ( this.roundToStepSize ) {
                  newValue = roundValue( newValue, this._valueProperty.get(), stepSize );
                }
              }
            }

            // Map the value.
            const mappedValue = this._a11yMapValue( newValue, this._valueProperty.get() );

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
            this._valueProperty.set( Utils.clamp( constrainedValue, this._enabledRangeProperty.get().min, this._enabledRangeProperty.get().max ) );

            // optional change callback after the valueProperty is set so that the listener can use the new value
            this._onChange( event );

            // after any keyboard input, make sure that the Node stays in view
            animatedPanZoomSingleton.initialized && animatedPanZoomSingleton.listener!.keepNodeInView( this._panTargetNode || ( this as unknown as Node ) );
          }
        }
      }
    }

    /**
     * Handle key up event on this accessible slider, managing the shift key, and calling an optional endDrag
     * function on release. Add this as an input listener to the node mixing in AccessibleValueHandler.
     * TODO: we want this to be @private, https://github.com/phetsims/scenery/issues/1348
     */
    handleKeyUp( event: SceneryEvent ) {
      const key = KeyboardUtils.getEventCode( event.domEvent )!;

      // handle case where user tabbed to this input while an arrow key might have been held down
      if ( this.allKeysUp() ) {
        return;
      }

      // reset shift key flag when we release it
      if ( KeyboardUtils.SHIFT_KEYS.includes( key ) ) {
        this._shiftKey = false;
      }

      if ( ( this as unknown as Node ).enabledProperty.get() ) {
        if ( KeyboardUtils.isRangeKey( event.domEvent ) ) {
          this.rangeKeysDown[ key ] = false;

          // when all range keys are released, we are done dragging
          if ( this.allKeysUp() ) {
            this.onInteractionEnd( event );
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
     *
     * TODO: we want this to be @private, https://github.com/phetsims/scenery/issues/1348
     */
    handleChange( event: SceneryEvent ) {

      if ( !this.a11yInputHandled ) {
        this.handleInput( event );
      }

      this.a11yInputHandled = false;
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
     *
     * TODO: we want this to be @private, https://github.com/phetsims/scenery/issues/1348
     */
    handleInput( event: SceneryEvent ) {
      if ( ( this as unknown as Node ).enabledProperty.get() && !this.blockInput ) {

        // don't handle again on "change" event
        this.a11yInputHandled = true;

        let newValue = this._valueProperty.get();

        const inputValue = parseFloat( ( event.domEvent!.target as HTMLInputElement ).value );
        const stepSize = this._shiftKey ? this.shiftKeyboardStep : this.keyboardStep;
        const mappedValue = this.getMappedValue();

        // start of change event is start of drag
        this.onInteractionStart( event );

        if ( inputValue > mappedValue ) {
          newValue = this._valueProperty.get() + stepSize;
        }
        else if ( inputValue < mappedValue ) {
          newValue = this._valueProperty.get() - stepSize;
        }

        if ( this.roundToStepSize ) {
          newValue = roundValue( newValue, this._valueProperty.get(), stepSize );
        }

        // limit to enabled range
        newValue = Utils.clamp( newValue, this._enabledRangeProperty.get().min, this._enabledRangeProperty.get().max );

        // optionally constrain value
        this._valueProperty.set( this._constrainValue( this._a11yMapValue( newValue, this._valueProperty.get() ) ) );

        // only one change per input, but still call optional change function - after valueProperty is set so
        // listener can use new value
        this._onChange( event );

        // after any keyboard input, make sure that the Node stays in view
        animatedPanZoomSingleton.initialized && animatedPanZoomSingleton.listener!.keepNodeInView( this._panTargetNode || ( this as unknown as Node ) );

        // end of change is the end of a drag
        this.onInteractionEnd( event );
      }

      // don't block the next input after receiving one, some AT may send either `keydown` or `input` events
      // depending on modifier keys so we need to be ready to receive either on next interaction
      this.blockInput = false;
    }

    /**
     * Fires when the accessible slider loses focus.
     *
     * Add this as a listener on the `blur` event to the Node that is mixing in AccessibleValueHandler.
     * TODO: we want this to be @private, https://github.com/phetsims/scenery/issues/1348
     */
    handleBlur( event: SceneryEvent ) {

      // if any range keys are currently down, call end drag because user has stopped dragging to do something else
      if ( this.anyKeysDown() ) {
        this.onInteractionEnd( event );
      }

      // reset flag in case we shift-tabbed away from slider
      this._shiftKey = false;

      // when focus leaves this element stop blocking input events
      this.blockInput = false;

      // reset counter for range keys down
      this.rangeKeysDown = {};
    }

    /**
     * Interaction with this input has started, save the value on start so that it can be used as an "old" value
     * when generating the context response with option a11yCreateContextResponse.
     * TODO: we want this to be @private, https://github.com/phetsims/scenery/issues/1348
     */
    onInteractionStart( event: SceneryEvent ) {
      this.valueOnStart = this._valueProperty.value;
      this._startChange( event );
    }

    /**
     * Interaction with this input has completed, generate an utterance describing changes if necessary and call
     * optional "end" function.
     * TODO: we want this to be @private, https://github.com/phetsims/scenery/issues/1348
     */
    onInteractionEnd( event: SceneryEvent ) {
      this.alertContextResponse();
      this.voicingOnEndResponse();
      this._endChange( event );
    }

    /**
     * Set the delta for the value Property when using arrow keys to interact with the Node.
     */
    setKeyboardStep( keyboardStep: number ) {
      assert && assert( keyboardStep >= 0, 'keyboard step must be non-negative' );

      this._keyboardStep = keyboardStep;
    }

    set keyboardStep( keyboardStep ) { this.setKeyboardStep( keyboardStep ); }

    /**
     * Get the delta for value Property when using arrow keys.
     */
    getKeyboardStep() {
      return this._keyboardStep;
    }

    get keyboardStep() { return this.getKeyboardStep(); }

    /**
     * Set the delta for value Property when using arrow keys with shift to interact with the Node.
     */
    setShiftKeyboardStep( shiftKeyboardStep: number ) {
      assert && assert( shiftKeyboardStep >= 0, 'shift keyboard step must be non-negative' );

      this._shiftKeyboardStep = shiftKeyboardStep;
    }

    set shiftKeyboardStep( shiftKeyboardStep ) { this.setShiftKeyboardStep( shiftKeyboardStep ); }

    /**
     * Get the delta for value Property when using arrow keys with shift to interact with the Node.
     */
    getShiftKeyboardStep() {
      return this._shiftKeyboardStep;
    }

    get shiftKeyboardStep() { return this.getShiftKeyboardStep(); }

    /**
     * Returns whether the shift key is currently held down on this slider, changing the size of step.
     *
     */
    getShiftKeyDown() {
      return this._shiftKey;
    }

    get shiftKeyDown() { return this.getShiftKeyDown(); }

    /**
     * Set the delta for value Property when using page up/page down to interact with the Node.
     */
    setPageKeyboardStep( pageKeyboardStep: number ) {
      assert && assert( pageKeyboardStep >= 0, 'page keyboard step must be non-negative' );

      this._pageKeyboardStep = pageKeyboardStep;
    }

    set pageKeyboardStep( pageKeyboardStep ) { this.setPageKeyboardStep( pageKeyboardStep ); }

    /**
     * Get the delta for value Property when using page up/page down to interact with the Node.
     */
    getPageKeyboardStep() {
      return this._pageKeyboardStep;
    }

    get pageKeyboardStep() { return this.getPageKeyboardStep(); }

    /**
     * Set the orientation for the slider as specified by https://www.w3.org/TR/wai-aria-1.1/#aria-orientation.
     * Depending on the value of this attribute, a screen reader will give different indications about which
     * arrow keys should be used
     */
    setAriaOrientation( orientation: Orientation ) {

      this._ariaOrientation = orientation;
      ( this as unknown as Node ).setPDOMAttribute( 'aria-orientation', orientation.ariaOrientation );
    }

    set ariaOrientation( orientation: Orientation ) { this.setAriaOrientation( orientation ); }

    /**
     * Get the orientation of the accessible slider, see setAriaOrientation for information on the behavior of this
     * attribute.
     *
     */
    getAriaOrientation() {
      return this._ariaOrientation;
    }

    get ariaOrientation() { return this._ariaOrientation; }

    /**
     * Returns true if all range keys are currently up (not held down).
     * TODO: we want this to be @private, https://github.com/phetsims/scenery/issues/1348
     */
    allKeysUp() {
      return _.every( this.rangeKeysDown, entry => !entry );
    }

    /**
     * Returns true if any range keys are currently down on this slider. Useful for determining when to call
     * startDrag or endDrag based on interaction.
     *
     * TODO: we want this to be @private, https://github.com/phetsims/scenery/issues/1348
     */
    anyKeysDown() {
      return !!_.find( this.rangeKeysDown, entry => entry );
    }

    /**
     * Set the `step` attribute on accessible siblings for this Node. The step attribute must be non zero
     * for the accessible input to receive accessibility events and only certain slider input values are
     * allowed depending on `step`, `min`, and `max` attributes. Only values which are equal to min value plus
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
     * This restriction is why `step` attribute cannot equal keyboardStep of this trait.
     *
     * We tried to use the `any` attribute which is valid according to DOM specification but screen readers
     * generally don't support it. See https://github.com/phetsims/sun/issues/413.
     *
     * Also, if the step attribute is too small relative to the entire range of the slider VoiceOver doesn't allow
     * any input events because...VoiceOver is just interesting like that.
     *
     * Current workaround for all of this is to set the step size to support the precision of the value required
     * by the client so that all values are allowed. If we encounter the VoiceOver case described above we fall
     * back to setting the step size at 1/100th of the max value since the keyboard step generally evenly divides
     * the max value rather than the full range.
     * TODO: we want this to be @private, https://github.com/phetsims/scenery/issues/1348
     */
    updateSiblingStepAttribute() {
      const smallestStep = Math.min( Math.min( this.keyboardStep, this.shiftKeyboardStep ), this.pageKeyboardStep );
      let stepValue = Math.pow( 10, -Utils.numberOfDecimalPlaces( smallestStep ) );

      const mappedMin = this.getMappedValue( this._enabledRangeProperty.get().min );
      const mappedMax = this.getMappedValue( this._enabledRangeProperty.get().max );
      const mappedLength = mappedMax - mappedMin;

      // step is too small relative to full range for VoiceOver to receive input, fall back to portion of
      // the max value as a workaround
      if ( stepValue / mappedLength < 1e-5 ) {
        stepValue = mappedMax / 100;
      }

      ( this as unknown as Node ).setPDOMAttribute( 'step', stepValue );
    }

    /**
     * Call this to trigger the voicing response spoken when an interaction ends.
     */
    voicingOnEndResponse( providedOptions?: VoicingOnEndResponseOptions ) {

      const options = optionize<VoicingOnEndResponseOptions, VoicingOnEndResponseOptions>( {
        withObjectResponse: true, // speak the object response
        onlyOnValueChange: true // don't speak if the value is the same as valueOnStart
      }, providedOptions );

      if ( !options.onlyOnValueChange || this.valueOnStart !== this._valueProperty.value ) {

        if ( this._voicingCreateObjectResponse && this._voicingCreateContextResponse ) {

          // @ts-ignore
          this.voicingObjectResponse = this._voicingCreateObjectResponse();
          // @ts-ignore
          this.voicingContextResponse = this._voicingCreateContextResponse();

          // @ts-ignore
          this.voicingSpeakResponse( {
            nameResponse: null,
            objectResponse: options.withObjectResponse ? this.voicingObjectResponse : null,
            contextResponse: this.voicingContextResponse,
            hintResponse: null // no hint, there was just a successful interaction
          } );
        }
      }
    }

    /**
     * Most often called from a drag, when speaking many times. Call with an `utterance` option to utilize the Utterance
     * timing variables for proper speaking
     */
    voicingOnChangeResponse( providedOptions?: VoicingOnChangeResponseOptions ) {

      if ( this._voicingCreateObjectResponse ) {
        // @ts-ignore
        this.voicingObjectResponse = this._voicingCreateObjectResponse();

        const options = optionize<VoicingOnChangeResponseOptions, VoicingOnChangeResponseOptions>( {
          objectResponse: this.voicingObjectResponse
        }, providedOptions );

        // no context response because we don't need it during the interaction, just after it
        // TODO: likely we do need some sort of context response support, https://github.com/phetsims/ratio-and-proportion/issues/413
        this.voicingSpeakResponse( options );
      }
    }

    dispose() {
      this._disposeAccessibleValueHandler();

      super.dispose();
    }
  };
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
    roundValue = Utils.roundSymmetric( roundValue / stepSize ) * stepSize;

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
  const stepsAboutEqual = Utils.equalsEpsilon( proposedStep, stepSize, 1e-14 );
  if ( stepToFar && !stepsAboutEqual ) {
    correctedValue += ( newValue > currentValue ) ? ( -1 * stepSize ) : stepSize;
  }
  return correctedValue;
};

// @public {string}
AccessibleValueHandler.DEFAULT_TAG_NAME = DEFAULT_TAG_NAME;

export default AccessibleValueHandler;
export type { AccessibleValueHandlerOptions };