// Copyright 2019, University of Colorado Boulder

/**
 * A trait for subtypes of Node. Meant for Nodes with a value that "run" on a NumberProperty and handles formatting,
 * mapping, and aria-valuetext updating.
 *
 * Also implements the listeners that respond to accessible input, such as keydown, keyup, input, and change
 * events, which may come from a keyboard or other assistive device. Bind and add these as input listeners to the
 * node mixing in this trait.
 *
 * Browsers have limitations for the interaction of a slider when the range is not evenly divisible by the step size.
 * Rather than allow the browser to natively change the valueProperty with an input event, this trait implements a
 * totally custom interaction keeping the general slider behavior the same.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Jesse Greenberg
 */

define( require => {
  'use strict';

  // modules
  const Emitter = require( 'AXON/Emitter' );
  const extend = require( 'PHET_CORE/extend' );
  const inheritance = require( 'PHET_CORE/inheritance' );
  const KeyboardUtil = require( 'SCENERY/accessibility/KeyboardUtil' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Property = require( 'AXON/Property' );
  const sun = require( 'SUN/sun' );
  const Util = require( 'DOT/Util' );
  const Utterance = require( 'SCENERY_PHET/accessibility/Utterance' );
  const utteranceQueue = require( 'SCENERY_PHET/accessibility/utteranceQueue' );

  // constants
  const DEFAULT_TAG_NAME = 'input';

  const AccessibleValueHandler = {

    /**
     * Implement functionality for a number spinner.
     * @public
     * @trait {Node}
     *
     * @param {function} type - The type (constructor) whose prototype that is modified.
     */
    mixInto: type => {
      assert && assert( _.includes( inheritance( type ), Node ), 'must be mixed into a Node' );

      const proto = type.prototype;

      extend( proto, {

        /**
         * This should be called in the constructor to initialize the accessible input features for the node.
         *
         * @param {Property.<number>} valueProperty
         * @param {Property.<Range>} rangeProperty - Property whose value constricts the range of valueProperty
         * @param {BooleanProperty} enabledProperty
         * @param {Object} [options] - note, does not mutate the Node
         *
         * @protected
         */
        initializeAccessibleValueHandler( valueProperty, rangeProperty, enabledProperty, options ) {

          // if rounding to keyboard step, keyboardStep must be defined so values aren't skipped and the slider   
          // doesn't get stuck while rounding to the nearest value, see https://github.com/phetsims/sun/issues/410
          if ( assert && options.roundToStepSize ) {
            assert( options.keyboardStep, 'rounding to keyboardStep, define appropriate keyboardStep to round to' );
          }

          const defaults = {

            // other
            startChange: _.noop, // called when a value change sequence starts
            endChange: _.noop, // called when a value change sequence ends
            constrainValue: _.identity, // called before valueProperty is set

            // keyboard steps for various keys/interactions
            keyboardStep: ( rangeProperty.get().max - rangeProperty.get().min ) / 20,
            shiftKeyboardStep: ( rangeProperty.get().max - rangeProperty.get().min ) / 100,
            pageKeyboardStep: ( rangeProperty.get().max - rangeProperty.get().min ) / 10,

            // TODO: this should be an enumeration, https://github.com/phetsims/gravity-force-lab-basics/issues/134
            ariaOrientation: 'horizontal', // specify orientation, read by assistive technology

            a11yDecimalPlaces: 0, // number of decimal places for the value when formatted and read by assistive technology

            // {boolean} - Whether or not to round the value to a multiple of the keyboardStep. This will only round
            // the value on normal key presses, rounding will not occur on large jumps like page up/page down/home/end.
            // see https://github.com/phetsims/gravity-force-lab-basics/issues/72
            roundToStepSize: false,

            /**
             * Map the valueProperty value to another number that will be read by the assistive device on
             * valueProperty changes.
             * @param {number} value
             * @returns {number}
             */
            a11yMapValue: _.identity,

            /**
             * If true, the aria-valuetext will be spoken every value change, even if the aria-valuetext doesn't
             * actually change. By default, screen readers won't speak aria-valuetext if it remains the same for
             * multiple values.
             * @type {boolean}
             */
            a11yRepeatEqualValueText: true,

            /**
             * aria-valuetext creation function, called when the valueProperty changes.
             * This string is read by AT every time the slider value changes.
             * @type {Function}
             * @param {number} formattedValue - mapped value fixed to the provided decimal places
             * @param {number} newValue - the new value, unformatted
             * @param {number} previousValue - just the "oldValue" from the property listener
             * @property {function} reset - if this function needs resetting, include a `reset` field on this function
             *                              to be called when the AccessibleValueHandler is reset.
             * @returns {string} - aria-valuetext to be set to the primarySibling
             */
            a11yCreateAriaValueText: _.identity,

            /**
             * Create content for an alert that will be sent to the utteranceQueue when the user interacts with the
             * input. Is not generated every change, but on every "drag" interaction, this is called with endChange.
             * @type {Function}
             * @param {number} formattedValue - mapped value fixed to the provided decimal places
             * @param {number} newValue - the new value, unformatted
             * @param {number} previousValue - just the "oldValue" from the property listener
             * @returns {string}
             */
            a11yCreateValueChangeAlert: null,

            /**
             * List the dependencies this Node's PDOM descriptions have. This should not include the valueProperty, but
             * should list any Properties who's change should trigger description update for this Node.
             * @type {Property[]}
             */
            a11yDependencies: []
          };

          options = _.extend( {}, defaults, options );

          assert && assert( options.ariaOrientation === 'horizontal' || options.ariaOrientation === 'vertical',
            'invalid ariaOrientation: ' + options.ariaOrientation );

          // Some options were already mutated in the constructor, only apply the accessibility-specific options here
          // so options are not doubled up, see https://github.com/phetsims/sun/issues/330
          const optionsToMutate = _.pick( options, _.keys( defaults ) );

          // cannot be set by client
          assert && assert( options.tagName === undefined, 'AccessibleValueHandler sets tagName' );
          optionsToMutate.tagName = DEFAULT_TAG_NAME;

          assert && assert( options.inputType === undefined, 'AccessibleValueHandler sets inputType' );
          optionsToMutate.inputType = 'range';

          this.mutate( optionsToMutate );

          // @private {Property.<number>}
          this._valueProperty = valueProperty;

          // @private {Property.<Range>}
          this._rangeProperty = rangeProperty;

          // @private{Property.<boolean>}
          this._enabledProperty = enabledProperty;

          // @private {function} - called when value change input is starts
          this._startChange = options.startChange;

          // @private {function} - called when value change input ends
          this._endChange = options.endChange;

          // @private {function} - called before valueProperty is set
          this._constrainValue = options.constrainValue;

          // @private (a11y) - delta for the valueProperty when using keyboard to interact with slider,
          // initialized with setKeyboardStep which does some validating
          this._keyboardStep = null;
          this.setKeyboardStep( options.keyboardStep );

          // @private (a11y) - delta for valueProperty when holding shift and using the keyboard to interact with slider
          this._shiftKeyboardStep = null;
          this.setShiftKeyboardStep( options.shiftKeyboardStep );

          // @private (a11y) - delta for valueProperty when pressing page up/page down
          this._pageKeyboardStep = null;
          this.setPageKeyboardStep( options.pageKeyboardStep );

          // @private (a11y) - whether or not 'shift' key is currently held down
          this._shiftKey = false;

          // initialize slider attributes
          this.ariaOrientation = options.ariaOrientation;

          // @private - track previous values for callbacks outside of Property listeners 
          this.oldValue = null;

          // @public - Emitted whenever there is an attempt to change the value in a particular direction. Note that
          // these will emit whether or not the value will actually change (like when stepSize is 0). These may
          // be used to change the valueProperty, changes from accessible input are handled after these are emitted.
          this.attemptedIncreaseEmitter = new Emitter();
          this.attemptedDecreaseEmitter = new Emitter();

          // @private {null|function} see options for doc
          this.a11yCreateValueChangeAlert = options.a11yCreateValueChangeAlert;

          // @private {number} - number of times the input has changed in value before the utterance made
          // was able to be spoken, only applicable if using a11yCreateValueChangeAlert
          this.timesValueTextChangedBeforeAlerting = 0;

          // @private - The utterance sent to the utteranceQueue when the value changes, alert content generated by
          // optional a11yCreateValueChangeAlert. The alertStableDelay on this utterance will increase if the input
          // receives many interactions before the utterance can be announced so that VoiceOver has time to read the
          // aria-valuetext before the alert.
          this.utterance = new Utterance();

          // @private (a11y) - whether or not an input event has been handled. If handled, we will not respond to the
          // change event. An AT (particularly VoiceOver) may send a change event (and not an input event) to the
          // browser in response to a user gesture. We need to handle that change event, whithout also handling the
          // input event in case a device sends both events to the browser.
          this.a11yInputHandled = false;

          // @private (a11y) - some browsers will receive `input` events when the user tabs away from the slider or
          // on some key presses - if we receive a keydown event, we do not want the value to change twice, so we
          // block input event after handling the keydown event
          this.blockInput = false;

          // @private - entries like { {number}: {boolean} }, key is range key code, value is whether it is down
          this.rangeKeysDown = {};

          // @private - setting to enable/disable rounding to the step size
          this.roundToStepSize = options.roundToStepSize;

          // @public (read-only) - precision for the output value to be read by an assistive device
          this.a11yDecimalPlaces = options.a11yDecimalPlaces;

          // @private {function}
          this.a11yMapValue = options.a11yMapValue;

          // @private {function}
          this.a11yCreateAriaValueText = options.a11yCreateAriaValueText;

          // @private {Multilink}
          this._dependenciesMultilink = null;

          // @private {boolean} see options for doc
          this._a11yRepeatEqualValueText = options.a11yRepeatEqualValueText;

          this.setA11yDependencies( options.a11yDependencies );

          // listeners, must be unlinked in dispose
          const enabledRangeObserver = enabledRange => {

            // a11y - update enabled slider range for AT, required for screen reader events to behave correctly
            this.setAccessibleAttribute( 'min', enabledRange.min );
            this.setAccessibleAttribute( 'max', enabledRange.max );

            // update the step attribute slider element - this attribute is only added because it is required to
            // receive accessibility events on all browsers, and is totally separate from the step values above that
            // will modify the valueProperty. See function for more information.
            this.updateSiblingStepAttribute();
          };
          this._rangeProperty.link( enabledRangeObserver );

          // when the property changes, be sure to update the accessible input value and aria-valuetext which is read
          // by assistive technology when the value changes
          const valuePropertyListener = () => {

            const formattedValue = this.getA11yFormattedValue();

            // set the aria-valuenow attribute in case the AT requires it to read the value correctly, some may
            // fall back on this from aria-valuetext see
            // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_aria-valuetext_attribute#Possible_effects_on_user_agents_and_assistive_technology
            this.setAccessibleAttribute( 'aria-valuenow', formattedValue );

            // update the PDOM input value on Property change
            this.inputValue = formattedValue;
          };
          this._valueProperty.link( valuePropertyListener );

          // @private - called by disposeAccessibleValueHandler to prevent memory leaks
          this._disposeAccessibleValueHandler = () => {
            this._rangeProperty.unlink( enabledRangeObserver );
            this._valueProperty.unlink( valuePropertyListener );
            this._dependenciesMultilink && this._dependenciesMultilink.dispose();
          };
        },

        /**
         * There are some features of AccessibleValueHandler that support updating when more than just the valueProperty
         * changes. Use this method to set the dependency Properties for this value handler. This will blow away the
         * previous list (like Node.children).
         * @public
         * @param {Property[]} dependencies
         */
        setA11yDependencies( dependencies ) {
          assert && assert( Array.isArray( dependencies ) );
          assert && assert( dependencies.indexOf( this._valueProperty ) === -1,
            'The value Property is already a dependency, and does not need to be added to this list' );
          assert && dependencies.forEach( property => {
            assert && assert( property instanceof Property, `${property} is not an instance of Property` );
          } );

          // dispose the previous multilink, there is only one set of dependencies, though they can be overwritten.
          this._dependenciesMultilink && this._dependenciesMultilink.dispose();

          this._dependenciesMultilink = Property.multilink( dependencies.concat( this._valueProperty ), () => {

            this.updateAriaValueText( this.oldValue );
            this.oldValue = this._valueProperty.value;
          } );
        },

        /**
         * @param {*} oldPropertyValue - the old value of the valueProperty, can be null
         * @private
         */
        updateAriaValueText( oldPropertyValue ) {
          const formattedValue = this.getA11yFormattedValue();

          // create the dynamic aria-valuetext from a11yCreateAriaValueText.
          let newAriaValueText = this.a11yCreateAriaValueText( formattedValue, this._valueProperty.value, oldPropertyValue );

          if ( this._a11yRepeatEqualValueText && newAriaValueText === this.ariaValueText ) {

            // use a "hair space" because it won't be spoken by a screen reader when appended to the valuetext string
            newAriaValueText += '\u200A';
          }

          this.ariaValueText = newAriaValueText;
        },

        /**
         * If generating an alert when the user changes the slider value, create the alert content and send it
         * to the utterancQueue. For VoiceOver, it is important that if the value is changed multiple times before
         * the alert can be spoken, we provide more time for the AT to finish speaking aria-valuetext. Otherwise, the
         * alert may be lost. See https://github.com/phetsims/gravity-force-lab-basics/issues/146.
         */
        setUtteranceAndAlert() {
          if ( this.a11yCreateValueChangeAlert ) {

            this.utterance.resetTimingVariables();

            const formattedValue = this.getA11yFormattedValue();
            this.utterance.alert = this.a11yCreateValueChangeAlert( formattedValue, this._valueProperty.value, this.oldValue );

            if ( utteranceQueue.hasUtterance( this.utterance ) ) {
              this.timesChangedBeforeAlerting++;
            }
            else {
              this.timesChangedBeforeAlerting = 1;
            }

            // 700 and 2000 ms are arbitrary values but sound good with limited testing. We want to give enough time
            // for VO to read aria-valuetext but don't want to have too much silence before the alert is spoken.
            this.utterance.alertStableDelay = Math.min( this.timesChangedBeforeAlerting * 700, 2000 );

            utteranceQueue.addToBack( this.utterance );
          }
        },

        /**
         * Should be called after the model dependencies have been reset
         * @public
         */
        reset() {

          // reset the aria-valuetext creator if it supports that
          this.a11yCreateAriaValueText.reset && this.a11yCreateAriaValueText.reset();

          // on reset, make sure that the PDOM descriptions are completely up to date.
          this.updateAriaValueText( null );
        },

        /**
         * @private
         * get the formatted value based on the current value of the Property.
         * @returns {number}
         */
        getA11yFormattedValue() {
          const mappedValue = this.a11yMapValue( this._valueProperty.value );
          assert && assert( typeof mappedValue === 'number', 'a11yMapValue must return a number' );

          // format the value text for reading
          return Util.toFixedNumber( mappedValue, this.a11yDecimalPlaces );
        },

        /**
         * Return the input listener that could be attached to mixed in types of AccessibleValueHandler to support
         * interaction.
         * @public
         *
         * @returns {Object}
         */
        getAccessibleValueHandlerInputListener() {
          return {
            keydown: this.handleKeyDown.bind( this ),
            keyup: this.handleKeyUp.bind( this ),
            input: this.handleInput.bind( this ),
            change: this.handleChange.bind( this ),
            blur: this.handleBlur.bind( this )
          };
        },

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
        handleKeyDown( event ) {
          const domEvent = event.domEvent;
          const code = domEvent.keyCode;
          this._shiftKey = domEvent.shiftKey;

          // if we receive a keydown event, we shouldn't handle any input events (which should only be provided
          // directly by an assistive device)
          this.blockInput = true;

          if ( this._enabledProperty.get() ) {

            // Prevent default so browser doesn't change input value automatically
            if ( KeyboardUtil.isRangeKey( code ) ) {
              domEvent.preventDefault(); // this should do the same thing as this.a11yInputHandled for "change" and "input"

              // if this is the first keydown this is the start of the drag interaction
              if ( !this.anyKeysDown() ) {
                this._startChange( event );
              }

              // track that a new key is being held down
              this.rangeKeysDown[ code ] = true;

              let newValue = this._valueProperty.get();
              if ( code === KeyboardUtil.KEY_END || code === KeyboardUtil.KEY_HOME ) {

                // on 'end' and 'home' snap to max and min of enabled range respectively (this is typical browser
                // behavior for sliders)
                if ( code === KeyboardUtil.KEY_END ) {
                  this.attemptedIncreaseEmitter.emit();
                  newValue = this._rangeProperty.get().max;
                }
                else if ( code === KeyboardUtil.KEY_HOME ) {
                  this.attemptedDecreaseEmitter.emit();
                  newValue = this._rangeProperty.get().min;
                }
              }
              else {
                let stepSize;
                if ( code === KeyboardUtil.KEY_PAGE_UP || code === KeyboardUtil.KEY_PAGE_DOWN ) {
                  // on page up and page down, the default step size is 1/10 of the range (this is typical browser behavior)
                  stepSize = this.pageKeyboardStep;

                  if ( code === KeyboardUtil.KEY_PAGE_UP ) {
                    this.attemptedIncreaseEmitter.emit();
                    newValue = this._valueProperty.get() + stepSize;
                  }
                  else if ( code === KeyboardUtil.KEY_PAGE_DOWN ) {
                    this.attemptedDecreaseEmitter.emit();
                    newValue = this._valueProperty.get() - stepSize;
                  }
                }
                else if ( KeyboardUtil.isArrowKey( code ) ) {

                  // if the shift key is pressed down, modify the step size (this is atypical browser behavior for sliders)
                  stepSize = domEvent.shiftKey ? this.shiftKeyboardStep : this.keyboardStep;

                  if ( code === KeyboardUtil.KEY_RIGHT_ARROW || code === KeyboardUtil.KEY_UP_ARROW ) {
                    this.attemptedIncreaseEmitter.emit();
                    newValue = this._valueProperty.get() + stepSize;
                  }
                  else if ( code === KeyboardUtil.KEY_LEFT_ARROW || code === KeyboardUtil.KEY_DOWN_ARROW ) {
                    this.attemptedDecreaseEmitter.emit();
                    newValue = this._valueProperty.get() - stepSize;
                  }

                  if ( this.roundToStepSize ) {
                    newValue = roundValue( newValue, this._valueProperty.get(), stepSize );
                  }
                }

                // limit the value to the enabled range
                newValue = Util.clamp( newValue, this._rangeProperty.get().min, this._rangeProperty.get().max );
              }

              // optionally constrain the value further
              this._valueProperty.set( this._constrainValue( newValue ) );
            }
          }
        },

        /**
         * Handle key up event on this accessible slider, managing the shift key, and calling an optional endDrag
         * function on release. Add this as an input listener to the node mixing in AccessibleValueHandler.
         * @private
         *
         * @param {Event} event
         */
        handleKeyUp( event ) {
          const domEvent = event.domEvent;

          // handle case where user tabbed to this input while an arrow key might have been held down
          if ( this.allKeysUp() ) {
            return;
          }

          // reset shift key flag when we release it
          if ( domEvent.keyCode === KeyboardUtil.KEY_SHIFT ) {
            this._shiftKey = false;
          }

          if ( this._enabledProperty.get() ) {
            if ( KeyboardUtil.isRangeKey( domEvent.keyCode ) ) {
              this.rangeKeysDown[ domEvent.keyCode ] = false;

              // when all range keys are released, we are done dragging
              if ( this.allKeysUp() ) {
                this.onInteractionEnd( event );
              }
            }
          }
        },

        /**
         * VoiceOver sends a "change" event to the slider (NOT an input event), so we need to handle the case when
         * a change event is sent but an input event ins't handled. Guarded against the case that BOTH change and
         * input are sent to the browser by the AT.
         *
         * Add this as a listener to the 'change' input event on the Node that is mixing in AccessibleValueHandler.
         *
         * @private
         *
         * @param  {Event} event
         */
        handleChange( event ) {

          if ( !this.a11yInputHandled ) {
            this.handleInput( event );
          }

          this.a11yInputHandled = false;
        },

        /**
         * Handle a direct 'input' event that might come from assistive technology. It is possible that the user agent
         * (particularly VoiceOver, or a switch device) will initiate an input event directly without going through
         * keydown. In that case, handle the change depending on which direction the user tried to go.
         *
         * Note that it is important to handle the "input" event, rather than the "change" event. The "input" will
         * fire when the value changes from a gesture, while the "change" will only happen on submission, like as
         * navigating away from the element.
         *
         * Add this as a listener to the `input` event on the Node that is mixing in AccessibleValueHandler.
         *
         * @private
         *
         * @param {Event} event
         */
        handleInput( event ) {
          if ( this._enabledProperty.get() && !this.blockInput ) {

            // don't handle again on "change" event
            this.a11yInputHandled = true;

            let newValue = this._valueProperty.get();

            const inputValue = event.domEvent.target.value;
            const stepSize = this._shiftKey ? this.shiftKeyboardStep : this.keyboardStep;

            // start of change event is start of drag
            this._startChange( event );

            if ( inputValue > this._valueProperty.get() ) {
              this.attemptedIncreaseEmitter.emit();
              newValue = this._valueProperty.get() + stepSize;
            }
            else if ( inputValue < this._valueProperty.get() ) {
              this.attemptedDecreaseEmitter.emit();
              newValue = this._valueProperty.get() - stepSize;
            }

            if ( this.roundToStepSize ) {
              newValue = roundValue( newValue, this._valueProperty.get(), stepSize );
            }

            // limit to enabled range
            newValue = Util.clamp( newValue, this._rangeProperty.get().min, this._rangeProperty.get().max );

            // optionally constrain value
            this._valueProperty.set( this._constrainValue( newValue ) );

            // end of change is the end of a drag
            this.onInteractionEnd( event );
          }
        },

        /**
         * Fires when the accessible slider loses focus.
         *
         * Add this as a listener on the `blur` event to the Node that is mixing in AccessibleValueHandler.
         * @private
         *
         * @param {Event} event
         */
        handleBlur( event ) {

          // if any range keys are currently down, call end drag because user has stopped dragging to do something else
          if ( this.anyKeysDown() ) {
            this.onInteractionEnd( event );
          }

          // reset flag in case we shift-tabbed away from slider
          this._shiftKey = false;

          // reset counter for range keys down
          this.rangeKeysDown = {};
        },

        /**
         * Interaction with this input has completed, generate an utterance describing changes if necessary and call
         * optional "end" function.
         * @private
         *
         * @param   {Event} event
         */
        onInteractionEnd( event ) {
          this.setUtteranceAndAlert();
          this._endChange( event );
        },

        /**
         * Set the delta for the value Property when using arrow keys to interact with the Node.
         * @public
         *
         * @param {number} keyboardStep
         */
        setKeyboardStep( keyboardStep ) {
          assert && assert( keyboardStep >= 0, 'keyboard step must be non-negative' );

          this._keyboardStep = keyboardStep;
        },
        set keyboardStep( keyboardStep ) { this.setKeyboardStep( keyboardStep ); },

        /**
         * Get the delta for value Property when using arrow keys.
         * @public
         *
         * @returns {number}
         */
        getKeyboardStep() {
          return this._keyboardStep;
        },
        get keyboardStep() { return this.getKeyboardStep(); },

        /**
         * Set the delta for value Property when using arrow keys with shift to interact with the Node.
         * @public
         *
         * @param {number} shiftKeyboardStep
         */
        setShiftKeyboardStep( shiftKeyboardStep ) {
          assert && assert( shiftKeyboardStep >= 0, 'shift keyboard step must be non-negative' );

          this._shiftKeyboardStep = shiftKeyboardStep;
        },
        set shiftKeyboardStep( shiftKeyboardStep ) { this.setShiftKeyboardStep( shiftKeyboardStep ); },

        /**
         * Get the delta for value Property when using arrow keys with shift to interact with the Node.
         * @public
         */
        getShiftKeyboardStep() {
          return this._shiftKeyboardStep;
        },
        get shiftKeyboardStep() { return this.getShiftKeyboardStep(); },

        /**
         * Returns whether or not the shift key is currently held down on this slider, changing the size of step.
         * @public
         *
         * @returns {boolean}
         */
        getShiftKeyDown() {
          return this._shiftKey;
        },
        get shiftKeyDown() { return this.getShiftKeyDown(); },

        /**
         * Set the delta for value Property when using page up/page down to interact with the Node.
         * @public
         *
         * @param {number} pageKeyboardStep
         */
        setPageKeyboardStep( pageKeyboardStep ) {
          assert && assert( pageKeyboardStep >= 0, 'page keyboard step must be non-negative' );

          this._pageKeyboardStep = pageKeyboardStep;
        },
        set pageKeyboardStep( pageKeyboardStep ) { this.setPageKeyboardStep( pageKeyboardStep ); },

        /**
         * Get the delta for value Property when using page up/page down to interact with the Node.
         * @public
         */
        getPageKeyboardStep() {
          return this._pageKeyboardStep;
        },
        get pageKeyboardStep() { return this.getPageKeyboardStep(); },

        /**
         * Set the orientation for the slider as specified by https://www.w3.org/TR/wai-aria-1.1/#aria-orientation.
         * Depending on the value of this attribute, a screen reader will give different indications about which
         * arrow keys should be used
         *
         * @param {string} orientation - one of "horizontal" or "vertical"
         */
        setAriaOrientation: function( orientation ) {
          assert && assert( orientation === 'horizontal' || orientation === 'vertical' );

          this._ariaOrientation = orientation;
          this.setAccessibleAttribute( 'aria-orientation', orientation );
        },
        set ariaOrientation( orientation ) { this.setAriaOrientation( orientation ); },

        /**
         * Get the orientation of the accessible slider, see setAriaOrientation for information on the behavior of this
         * attribute.
         *
         * @returns {string}
         */
        getAriaOrientation: function() {
          return this._ariaOrientation;
        },
        get ariaOrientation() { return this._ariaOrientation; },

        /**
         * Call when disposing the type that this trait is mixed into.
         * @public
         */
        disposeAccessibleValueHandler() {
          this._disposeAccessibleValueHandler();
        },

        /**
         * Returns true if all range keys are currently up (not held down).
         * @returns {boolean}
         * @private
         */
        allKeysUp() {
          return _.every( this.rangeKeysDown, function( entry ) { return !entry; } );
        },

        /**
         * Returns true if any range keys are currently down on this slider. Useful for determining when to call
         * startDrag or endDrag based on interaction.
         *
         * @returns {boolean}
         * @private
         */
        anyKeysDown() {
          return !!_.find( this.rangeKeysDown, function( entry ) { return entry; } );
        },

        /**
         * Set the `step` attribute on accessible siblings for this Node. The step attribute must be non zero
         * for the accessible input to receive accessibility events and only certain slider input values are
         * allowed depending on `step`, `min`, and `max` attributes. Only values which are equal to min value plus
         * the basis of step are allowed. If the input value is set to anything else, the result is confusing
         * keyboard behavior and the screen reader will say "Invalid" when the value changes.
         * See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/number#step
         *
         * This limitation is too restrictive for PhET as many sliders span physical ranges with keyboard steps that
         * are design to be convenient or pedagogically useful. For example, a slider that spans 0.01 to 15 requires
         * a step of 1, but DOM specification would only allow values 0.01, 1.01, 2.01, ...
         * This restriction is the main reason we decided to "roll our own" for accessible sliders.
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
         * @private
         */
        updateSiblingStepAttribute() {
          let stepValue = Math.pow( 10, -this.a11yDecimalPlaces );

          const fullRange = this._rangeProperty.get().getLength();

          // step is too small relative to full range for VoiceOver to receive input, fall back to portion of
          // full range
          if ( stepValue / fullRange < 1e-5 ) {
            stepValue = this._rangeProperty.get().max / 100;
          }

          this.setAccessibleAttribute( 'step', stepValue );
        }
      } );
    }
  };

  sun.register( 'AccessibleValueHandler', AccessibleValueHandler );

  /**
   * Round the value to the nearest step size.
   *
   * @param {number} newValue - value to be rounded
   * @param {number} currentValue - current value of the Property associated with this slider
   * @param {number} stepSize - the delta for this manipulation
   *
   * @returns {number}
   */
  var roundValue = function( newValue, currentValue, stepSize ) {
    let roundValue = newValue;
    if ( stepSize !== 0 ) {

      // round the value to the nearest keyboard step
      roundValue = Util.roundSymmetric( roundValue / stepSize ) * stepSize;

      // go back a step if we went too far due to rounding
      roundValue = correctRounding( roundValue, currentValue, stepSize );
    }
    return roundValue;
  };

  /**
   * Helper function, it is possible due to rounding to go up or down a step if we have passed the nearest step during
   * keyboard interaction. This function corrects that.
   *
   * @param {number} newValue - potential value of the Property associated with this slider
   * @param {number} currentValue - current value of the Property associated with this slider
   * @param {number} stepSize - the delta for this manipulation
   *
   * @returns {number}
   */
  var correctRounding = function( newValue, currentValue, stepSize ) {
    let correctedValue = newValue;

    const proposedStep = Math.abs( newValue - currentValue );
    const stepToFar = proposedStep > stepSize;

    // it is possible that proposedStep will be larger than the stepSize but only because of precision
    // constraints with floating point values, don't correct if that is the cases
    const stepsAboutEqual = Util.equalsEpsilon( proposedStep, stepSize, 1e-14 );
    if ( stepToFar && !stepsAboutEqual ) {
      correctedValue += ( newValue > currentValue ) ? ( -1 * stepSize ) : stepSize;
    }
    return correctedValue;
  };

  // @public {string}
  AccessibleValueHandler.DEFAULT_TAG_NAME = DEFAULT_TAG_NAME;

  return AccessibleValueHandler;
} );
