// Copyright 2017, University of Colorado Boulder

/**
 * A trait for subtypes of Node, used to make the node behave like a 'slider' with assistive technology. This could be
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

  var Emitter = require( 'AXON/Emitter' );
  var extend = require( 'PHET_CORE/extend' );
  var inheritance = require( 'PHET_CORE/inheritance' );
  var KeyboardUtil = require( 'SCENERY/accessibility/KeyboardUtil' );
  var Node = require( 'SCENERY/nodes/Node' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var sun = require( 'SUN/sun' );
  var Util = require( 'DOT/Util' );

  var AccessibleSlider = {

    /**
     * Implement functionality for a slider.
     * @public
     * @trait
     *
     * @param {function} type - The type (constructor) whose prototype we'll modify.
     */
    mixInto: function( type ) {
      assert && assert( _.includes( inheritance( type ), Node ) );

      var proto = type.prototype;

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

          var defaults = {

            // other
            startDrag: function() {}, // called when a drag sequence starts
            endDrag: function() {}, // called when a drag sequence ends
            constrainValue: function( value ) { return value; }, // called before valueProperty is set

            // a11y
            tagName: 'input',
            inputType: 'range',
            ariaRole: 'slider', // required for NVDA to read the value text correctly, see https://github.com/phetsims/a11y-research/issues/51
            accessibleValuePattern: '{{value}}', // {string} if you want units or additional content, add to pattern
            accessibleDecimalPlaces: 0, // number of decimal places for the value read by assistive technology
            ariaOrientation: 'horizontal', // specify orientation, read by assistive technology
            keyboardStep: ( enabledRangeProperty.get().max - enabledRangeProperty.get().min ) / 20,
            shiftKeyboardStep: ( enabledRangeProperty.get().max - enabledRangeProperty.get().min ) / 100,
            pageKeyboardStep: ( enabledRangeProperty.get().max - enabledRangeProperty.get().min ) / 10
          };
          options = _.extend( {}, defaults, options );

          // Some options were already mutated in the constructor, only apply the accessibility-specific options here
          // so options are not doubled up, see https://github.com/phetsims/sun/issues/330
          var optionsToMutate = _.pick( options, _.keys( defaults ) );
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

          // @private (a11y) - delta for the valueProperty when using keyboard to interact with slider
          this._keyboardStep = options.keyboardStep;

          // @private (a11y) - delta for valueProperty when holding shift and using the keyboard to interact with slider
          this._shiftKeyboardStep = options.shiftKeyboardStep;

          // @private (a11y) - delta for valueProperty when pressing page up/page down
          this._pageKeyboardStep = options.pageKeyboardStep;

          // @private (a11y) - orientation as specified by https://www.w3.org/TR/wai-aria-1.1/#aria-orientation
          this._ariaOrientation = options.ariaOrientation;

          // @private (a11y) - whether or not 'shift' key is currently held down
          this._shiftKey = false;

          // initialize slider attributes
          this.ariaOrientation = options.ariaOrientation;

          // @public - emitted whenever the slider changes in the specific direction
          this.increasedEmitter = new Emitter();
          this.decreasedEmitter = new Emitter();

          // a11y - arbitrary value, but attribute is required for assistive technology to send change event
          this.setAccessibleAttribute( 'step', 0.1 );

          // listeners, must be unlinked in dispose
          var enabledRangeObserver = function( enabledRange ) {

            // a11y - update enabled slider range for AT, required for screen reader events to behave correctly
            self.setAccessibleAttribute( 'min', enabledRange.min );
            self.setAccessibleAttribute( 'max', enabledRange.max );
          };
          this._enabledRangeProperty.link( enabledRangeObserver );

          // @private {boolean} - is this the first key down event before keyup? drag is only started on first keydown
          this._firstKeyDown = true;

          // @public (a11y) - handle all accessible event input
          var accessibleInputListener = this.addAccessibleInputListener( {
            keydown: this.handleKeyDown.bind( this ),
            keyup: this.handleKeyUp.bind( this ),
            change: this.handleChange.bind( this ),
            blur: this.handleBlur.bind( this )
          } );

          // when the property changes, be sure to update the accessible input value and aria-valuetext which is read
          // by assistive technology when the value changes
          var accessiblePropertyListener = function( value ) {
            self.inputValue = value;

            // format the value text for reading
            var formattedValue = Util.toFixed( value, options.accessibleDecimalPlaces );
            var valueText = StringUtils.fillIn( options.accessibleValuePattern, {
              value: formattedValue
            } );
            self.setAccessibleAttribute( 'aria-valuetext', valueText );
          };
          self._valueProperty.link( accessiblePropertyListener );

          // @private - called by disposeAccessibleSlider to prevent memory leaks
          this._disposeAccessibleSlider = function() {
            self._valueProperty.unlink( accessiblePropertyListener );
            self._enabledRangeProperty.unlink( enabledRangeObserver );
            self.removeAccessibleInputListener( accessibleInputListener );
          };
        },

        /**
         * Set the delta for the value Property when using arrow keys to interact with the Node.
         * @public
         *
         * @param {number} keyboardStep
         */
        setKeyboardStep: function( keyboardStep ) {
          this._keyboardStep = keyboardStep;
        },
        set keyboardStep( keyboardStep ) { this.setKeyboardStep( keyboardStep ); },

        /**
         * Get the delta for value Property when using arrow keys.
         * @public
         *
         * @return {number}
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
         * @return {boolean}
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
          assert &&  assert( orientation === 'horizontal' || orientation === 'vertical' );

          this._ariaOrientation = orientation;
          this.setAccessibleAttribute( 'aria-orientation', orientation );
        },
        set ariaOrientation( orientation ) { this.setAriaOrientation( orientation ); },

        /**
         * Get the orientation of the accessible slider, see setAriaOrientation for information on the behavior of this
         * attribute.
         *
         * @return {string}
         */
        getAriaOrientation: function() {
          return this._ariaOrientation;
        },
        get ariaOrientation() { return this._ariaOrientation; },

        /**
         * Handle the keydown event so that this node behaves like a traditional HTML slider (input of type range).
         * @public
         *
         * @param {DOMEvent} event
         */
        handleKeyDown: function( event ) {
          var code = event.keyCode;
          this._shiftKey = event.shiftKey;

          if ( this._enabledProperty.get() ) {

            // Prevent default so browser doesn't change input value automatically
            if ( KeyboardUtil.isRangeKey( code ) ) {
              event.preventDefault();

              // keydown is the start of the drag
              this._firstKeyDown && this._startDrag();
              this._firstKeyDown = false;
            

              var newValue = this._valueProperty.get();
              if ( code === KeyboardUtil.KEY_END || code === KeyboardUtil.KEY_HOME ) {

                // on 'end' and 'home' snap to max and min of enabled range respectively (this is typical browser
                // behavior for sliders)
                if ( code === KeyboardUtil.KEY_END ) {
                  newValue = this._enabledRangeProperty.get().max;
                  this.increasedEmitter.emit();
                }
                else if ( code === KeyboardUtil.KEY_HOME ) {
                  newValue = this._enabledRangeProperty.get().min;
                  this.decreasedEmitter.emit();
                }
              }
              else {
                var stepSize;
                if ( code === KeyboardUtil.KEY_PAGE_UP || code === KeyboardUtil.KEY_PAGE_DOWN ) {

                  // on page up and page down, the default step size is 1/10 of the range (this is typical browser behavior)
                  stepSize = this.pageKeyboardStep;

                  if ( code === KeyboardUtil.KEY_PAGE_UP ) {
                    newValue = this._valueProperty.get() + stepSize;
                    this.increasedEmitter.emit();
                  }
                  else if ( code === KeyboardUtil.KEY_PAGE_DOWN ) {
                    newValue = this._valueProperty.get() - stepSize;
                    this.decreasedEmitter.emit();
                  }
                }
                else if ( KeyboardUtil.isArrowKey( code ) ) {

                  // if the shift key is pressed down, modify the step size (this is atypical browser behavior for sliders)
                  stepSize = event.shiftKey ? this.shiftKeyboardStep : this.keyboardStep;

                  if ( code === KeyboardUtil.KEY_RIGHT_ARROW || code === KeyboardUtil.KEY_UP_ARROW ) {
                    newValue = this._valueProperty.get() + stepSize;
                    this.increasedEmitter.emit();
                  }
                  else if ( code === KeyboardUtil.KEY_LEFT_ARROW || code === KeyboardUtil.KEY_DOWN_ARROW ) {
                    newValue = this._valueProperty.get() - stepSize;
                    this.decreasedEmitter.emit();
                  }

                  newValue = roundValue( newValue, this._valueProperty.get(), stepSize );
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
         * @public
         *
         * @param {DOMEvent} event
         */
        handleKeyUp: function( event ) {

          // reset shift key flag when we release it
          if ( event.keyCode === KeyboardUtil.KEY_SHIFT ) {
            this._shiftKey = false;
          }

          if ( this._enabledProperty.get() ) {

            // when range key is released, we are done dragging
            if ( KeyboardUtil.isRangeKey( event.keyCode ) ) {
              this._endDrag();
              this._firstKeyDown = true;
            }
          }
        },

        /**
         * Handle a direct 'change' event that might come from assistive technology. It is possible that the user agent
         * (particularly VoiceOver, or a switch device) will initiate a change event directly without going through
         * keydown. In that case, handle the change depending on which direction the user tried to go.
         * @public
         *
         * @param {DOMEvent} event
         */
        handleChange: function( event ) {
          if ( this._enabledProperty.get() ) {

            var inputValue = event.target.value;
            var stepSize = this._shiftKey ? this.shiftKeyboardStep : this.keyboardStep;

            // start of change event is start of drag
            this._startDrag();

            var newValue = this._valueProperty.get();
            if ( inputValue > this._valueProperty.get() ) {
              newValue = this._valueProperty.get() + stepSize;
              this.increasedEmitter.emit();
            }
            else if ( inputValue < this._valueProperty.get() ) {
              newValue = this._valueProperty.get() - stepSize;
              this.decreasedEmitter.emit();
            }

            newValue = roundValue( newValue, this._valueProperty.get(), stepSize );

            // limit to enabled range
            newValue = Util.clamp( newValue, this._enabledRangeProperty.get().min, this._enabledRangeProperty.get().max );

            // optionally constrain value
            this._valueProperty.set( this._constrainValue( newValue ) );

            // end of change is the end of a drag
            this._endDrag();
          }
        },

        /**
         * Fires when the accessible slider loses focus. Reset the flag tracking if the shift key is held down.
         * @public
         *
         * @param {DOMEvent} event
         */
        handleBlur: function( event ) {

          // reset flag in case we shift-tabbed away from slider
          this._shiftKey = false;
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
   * @return {number}
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
   * @return {number}
   */
  var correctRounding = function( newValue, currentValue, stepSize ) {
    var correctedValue = newValue;
    if ( Util.toFixedNumber( Math.abs( newValue - currentValue ), 5 ) > stepSize ) {
      correctedValue += ( newValue > currentValue ) ? ( -1 * stepSize ) : stepSize;
    }
    return correctedValue;
  };

  return AccessibleSlider;
} );
