// Copyright 2017-2019, University of Colorado Boulder

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
 * Browsers have limitations for the interaction of a slider when the range is not evenly divisible by the step size.
 * Rather than allow the browser to natively change the valueProperty with an input event, this trait implements a
 * totally custom interaction keeping the general slider behavior the same.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

define( function( require ) {
  'use strict';

  var AccessibleValueHandler = require( 'SUN/accessibility/AccessibleValueHandler' );
  var Emitter = require( 'AXON/Emitter' );
  var extend = require( 'PHET_CORE/extend' );
  var inheritance = require( 'PHET_CORE/inheritance' );
  var KeyboardUtil = require( 'SCENERY/accessibility/KeyboardUtil' );
  var Node = require( 'SCENERY/nodes/Node' );
  var sun = require( 'SUN/sun' );
  var Util = require( 'DOT/Util' );

  var AccessibleSlider = {

    /**
     * Implement functionality for a slider.
     * @public
     * @trait
     * @mixes AccessibleValueHandler
     *
     * @param {function} type - The type (constructor) whose prototype we'll modify.
     */
    mixInto: function( type ) {
      assert && assert( _.includes( inheritance( type ), Node ) );

      var proto = type.prototype;

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
          var self = this;

          // if rounding to keyboard step, keyboardStep must be defined so values aren't skipped and the slider
          // doesn't get stuck while rounding to the nearest value, see https://github.com/phetsims/sun/issues/410
          if ( assert && options.roundToStepSize ) {
            assert( options.keyboardStep, 'rounding to keyboardStep, define appropriate keyboardStep to round to' );
          }

          var defaults = {

            // other
            startDrag: _.noop, // called when a drag sequence starts
            endDrag: _.noop, // called when a drag sequence ends
            constrainValue: _.identity, // called before valueProperty is set

            // a11y
            ariaOrientation: 'horizontal', // specify orientation, read by assistive technology
            keyboardStep: ( enabledRangeProperty.get().max - enabledRangeProperty.get().min ) / 20,
            shiftKeyboardStep: ( enabledRangeProperty.get().max - enabledRangeProperty.get().min ) / 100,
            pageKeyboardStep: ( enabledRangeProperty.get().max - enabledRangeProperty.get().min ) / 10,

            // {boolean} - Whether or not to round the value to a multiple of the keyboardStep. This will only round
            // the value on normal key presses, rounding will not occur on large jumps like page up/page down/home/end.
            // see https://github.com/phetsims/gravity-force-lab-basics/issues/72
            roundToStepSize: false,

            // a11y options to pass to AccessibleValueHandler
            a11yProvideValueNow: false // We use inputValue setter in AccessibleSlider instead of aria-valuenow
          };

          options = _.extend( {}, defaults, options );

          // initialize "parent" mixin
          this.initializeAccessibleValueHandler( valueProperty, options );

          assert && assert( options.ariaOrientation === 'horizontal' || options.ariaOrientation === 'vertical',
            'invalid ariaOrientation: ' + options.ariaOrientation );

          // Some options were already mutated in the constructor, only apply the accessibility-specific options here
          // so options are not doubled up, see https://github.com/phetsims/sun/issues/330
          var optionsToMutate = _.pick( options, _.keys( defaults ) );

          // cannot be set by client
          assert && assert( options.tagName === undefined, 'AccessibleSlider sets tagName' );
          optionsToMutate.tagName = 'input';

          assert && assert( options.inputType === undefined, 'AccessibleSlider sets inputType' );
          optionsToMutate.inputType = 'range';

          this.mutate( optionsToMutate );

          // @private {Property.<number>}
          this._valueProperty = valueProperty;

          // @private {Property.<Range>}
          this._enabledRangeProperty = enabledRangeProperty;

          // @private{Property.<boolean>}
          this._enabledProperty = enabledProperty;

          // @private {function} - called when dragging starts
          this._startDrag = options.startDrag;

          // @private {function} - called when dragging is finished
          this._endDrag = options.endDrag;

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

          // @private (a11y) - orientation as specified by https://www.w3.org/TR/wai-aria-1.1/#aria-orientation
          this._ariaOrientation = options.ariaOrientation;

          // @private (a11y) - whether or not 'shift' key is currently held down
          this._shiftKey = false;

          // initialize slider attributes
          this.ariaOrientation = options.ariaOrientation;

          // @public - Emitted whenever there is an attempt to change the value in a particular direction. Note that
          // these will emit whether or not the value will actually change (like when stepSize is 0). These may
          // be used to change the valueProperty, changes from accessible input are handled after these are emitted.
          this.attemptedIncreaseEmitter = new Emitter();
          this.attemptedDecreaseEmitter = new Emitter();

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

          // The step attribute must be non zero for the accessible input to receive all accessibility events, and
          // only certain values are allowed depending on the step size, or else the AT will announce values as
          // "Invalid". If the step size is equal to the precision of the slider readout, all values are allowed.
          this.setAccessibleAttribute( 'step', Math.pow( 10, -this.a11yDecimalPlaces ) );

          // listeners, must be unlinked in dispose
          var enabledRangeObserver = function( enabledRange ) {

            // a11y - update enabled slider range for AT, required for screen reader events to behave correctly
            self.setAccessibleAttribute( 'min', enabledRange.min );
            self.setAccessibleAttribute( 'max', enabledRange.max );
          };
          this._enabledRangeProperty.link( enabledRangeObserver );

          // handle all accessible event input
          var accessibleInputListener = {
            keydown: this.handleKeyDown.bind( this ),
            keyup: this.handleKeyUp.bind( this ),
            input: this.handleInput.bind( this ),
            change: this.handleChange.bind( this ),
            blur: this.handleBlur.bind( this )
          };
          this.addInputListener( accessibleInputListener );

          // @private - called by disposeAccessibleSlider to prevent memory leaks
          this._disposeAccessibleSlider = function() {
            self._enabledRangeProperty.unlink( enabledRangeObserver );
            self.removeInputListener( accessibleInputListener );
            self.disposeAccessibleValueHandler();
          };
        },

        /**
         * Set the delta for the value Property when using arrow keys to interact with the Node.
         * @public
         *
         * @param {number} keyboardStep
         */
        setKeyboardStep: function( keyboardStep ) {
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
        getKeyboardStep: function() {
          return this._keyboardStep;
        },
        get keyboardStep() { return this.getKeyboardStep(); },

        /**
         * Set the delta for value Property when using arrow keys with shift to interact with the Node.
         * @public
         *
         * @param {number} shiftKeyboardStep
         */
        setShiftKeyboardStep: function( shiftKeyboardStep ) {
          assert && assert( shiftKeyboardStep >= 0, 'shift keyboard step must be non-negative' );

          this._shiftKeyboardStep = shiftKeyboardStep;
        },
        set shiftKeyboardStep( shiftKeyboardStep ) { this.setShiftKeyboardStep( shiftKeyboardStep ); },

        /**
         * Get the delta for value Property when using arrow keys with shift to interact with the Node.
         * @public
         */
        getShiftKeyboardStep: function() {
          return this._shiftKeyboardStep;
        },
        get shiftKeyboardStep() { return this.getShiftKeyboardStep(); },

        /**
         * Returns whether or not the shift key is currently held down on this slider, changing the size of step.
         * @public
         *
         * @returns {boolean}
         */
        getShiftKeyDown: function() {
          return this._shiftKey;
        },
        get shiftKeyDown() { return this.getShiftKeyDown(); },

        /**
         * Set the delta for value Property when using page up/page down to interact with the Node.
         * @public
         *
         * @param {number} pageKeyboardStep
         */
        setPageKeyboardStep: function( pageKeyboardStep ) {
          assert && assert( pageKeyboardStep >= 0, 'page keyboard step must be non-negative' );

          this._pageKeyboardStep = pageKeyboardStep;
        },
        set pageKeyboardStep( pageKeyboardStep ) { this.setPageKeyboardStep( pageKeyboardStep ); },

        /**
         * Get the delta for value Property when using page up/page down to interact with the Node.
         * @public
         */
        getPageKeyboardStep: function() {
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
         * Handle the keydown event so that this node behaves like a traditional HTML slider (input of type range).
         * @private
         *
         * @param {Event} event
         */
        handleKeyDown: function( event ) {

          var domEvent = event.domEvent;
          var code = domEvent.keyCode;
          this._shiftKey = domEvent.shiftKey;

          // if we receive a keydown event, we shouldn't handle any input events (which should only be provided
          // directly by an assistive device)
          this.blockInput = true;

          if ( this._enabledProperty.get() ) {

            // Prevent default so browser doesn't change input value automatically
            if ( KeyboardUtil.isRangeKey( code ) ) {
              domEvent.preventDefault();

              // if this is the first keydown this is the start of the drag interaction
              if ( !this.anyKeysDown() ) {
                this._startDrag( event );
              }

              // track that a new key is being held down
              this.rangeKeysDown[ code ] = true;

              var newValue = this._valueProperty.get();
              if ( code === KeyboardUtil.KEY_END || code === KeyboardUtil.KEY_HOME ) {

                // on 'end' and 'home' snap to max and min of enabled range respectively (this is typical browser
                // behavior for sliders)
                if ( code === KeyboardUtil.KEY_END ) {
                  this.attemptedIncreaseEmitter.emit();
                  newValue = this._enabledRangeProperty.get().max;
                }
                else if ( code === KeyboardUtil.KEY_HOME ) {
                  this.attemptedDecreaseEmitter.emit();
                  newValue = this._enabledRangeProperty.get().min;
                }
              }
              else {
                var stepSize;
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
                newValue = Util.clamp( newValue, this._enabledRangeProperty.get().min, this._enabledRangeProperty.get().max );
              }

              // optionally constrain the value further
              this._valueProperty.set( this._constrainValue( newValue ) );
            }
          }
        },

        /**
         * Handle key up event on this accessible slider, managing the shift key, and calling an optional endDrag
         * function on release.
         * @private
         *
         * @param {Event} event
         */
        handleKeyUp: function( event ) {

          var domEvent = event.domEvent;

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
                this._endDrag( event );
              }
            }
          }
        },

        /**
         * VoiceOver sends a "change" event to the slider (NOT an input event), so we need to handle the case when
         * a change event is sent but an input event ins't handled. Guarded against the case that BOTH change and
         * input are sent to the browser by the AT.
         * @private
         *
         * @param  {Event} event
         */
        handleChange: function( event ) {
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
         * @private
         *
         * @param {Event} event
         */
        handleInput: function( event ) {
          if ( this._enabledProperty.get() && !this.blockInput ) {

            // don't handle again on "change" event
            this.a11yInputHandled = true;

            var newValue = this._valueProperty.get();

            var inputValue = event.domEvent.target.value;
            var stepSize = this._shiftKey ? this.shiftKeyboardStep : this.keyboardStep;

            // start of change event is start of drag
            this._startDrag( event );

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
            newValue = Util.clamp( newValue, this._enabledRangeProperty.get().min, this._enabledRangeProperty.get().max );

            // optionally constrain value
            this._valueProperty.set( this._constrainValue( newValue ) );

            // end of change is the end of a drag
            this._endDrag( event );
          }
        },

        /**
         * Fires when the accessible slider loses focus.
         * @private
         */
        handleBlur: function() {

          // if any range keys are currently down, call end drag because user has stopped dragging to do something else
          if ( this.anyKeysDown() ) {
            this._endDrag();
          }

          // reset flag in case we shift-tabbed away from slider
          this._shiftKey = false;

          // reset counter for range keys down
          this.rangeKeysDown = {};
        },

        /**
         * Returns true if all range keys are currently up (not held down).
         * @returns {boolean}
         * @private
         */
        allKeysUp: function() {
          return _.every( this.rangeKeysDown, function( entry ) { return !entry; } );
        },

        /**
         * Returns true if any range keys are currently down on this slider. Useful for determining when to call
         * startDrag or endDrag based on interaction.
         *
         * @returns {boolean}
         * @private
         */
        anyKeysDown: function() {
          return !!_.find( this.rangeKeysDown, function( entry ) { return entry; } );
        },

        /**
         * Make the accessible slider portions of this node eligible for garbage collection. Call when disposing
         * the type that this trait is mixed into.
         * @public
         */
        disposeAccessibleSlider: function() {
          this._disposeAccessibleSlider();
        }
      } );
    }
  };

  sun.register( 'AccessibleSlider', AccessibleSlider );

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
    var roundValue = newValue;
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
    var correctedValue = newValue;

    var proposedStep = Math.abs( newValue - currentValue );
    var stepToFar = proposedStep > stepSize;

    // it is possible that proposedStep will be larger than the stepSize but only because of precision
    // constraints with floating point values, don't correct if that is the cases
    var stepsAboutEqual = Util.equalsEpsilon( proposedStep, stepSize, 1e-14 );
    if ( stepToFar && !stepsAboutEqual ) {
      correctedValue += ( newValue > currentValue ) ? ( -1 * stepSize ) : stepSize;
    }
    return correctedValue;
  };

  return AccessibleSlider;
} );
