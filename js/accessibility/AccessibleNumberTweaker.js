// Copyright 2017, University of Colorado Boulder

/**
 * A trait for subtypes of Node, used to make the node behave like a 'number' input with assistive technology.
 * An accessible number tweaker behaves like:
 *
 * - Arrow keys increment/decrement the value by a specified step size.
 * - Page Up and Page Down increments/decrements value by an alternative step size, usually larger than default.
 * - Home key sets value to its minimum.
 * - End key sets value to its maximum.
 *
 * This number tweaker is different than typical 'number' inputs because it does not support number key control. All
 * changes go through the arrow, page up, page down, home, and end keys. For that reason, the HTML representation should
 * ideally look like: (values removed for readability)
 *
 * <p id="label-element">Accessible Name</p>
 * <div role="spinbutton" min="" max="" aria-valuenow="" aria-valuetext="" aria-labelledby="label-element"></div>
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Michael Barlow (PhET Interactive Simulations)
 */

define( function( require ) {
  'use strict';

  // modules
  var AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );
  var CallbackTimer = require( 'SUN/CallbackTimer' );
  var Emitter = require( 'AXON/Emitter' );
  var extend = require( 'PHET_CORE/extend' );
  var inheritance = require( 'PHET_CORE/inheritance' );
  var KeyboardUtil = require( 'SCENERY/accessibility/KeyboardUtil' );
  var Node = require( 'SCENERY/nodes/Node' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var sun = require( 'SUN/sun' );
  var Util = require( 'DOT/Util' );

  var AccessibleNumberTweaker = {

    /**
     * Implement functionality for a number tweaker.
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
         * This should be called in the constructor to initialize the accessible input features for the node.
         *
         * @param {Property.<number>} valueProperty
         * @param {Property.<Range>} enabledRangeProperty
         * @param {Property.<boolean>} enabledProperty
         * @param {Object} [options]
         *
         * @protected
         */
        initializeAccessibleNumberTweaker: function( valueProperty, enabledRangeProperty, enabledProperty, options ) {
          var self = this;

          var defaults = {
            a11yValueDelta: 1, // {number} - value changes by this quantity when using arrow keys
            a11yPageValueDelta: 2, // {number} - value changes by this quantity when using page up/page down

            a11yUseTimer: true, // if false value will change every native DOM keydown event, following options meaningless
            timerDelay: 400, // start to fire continuously after pressing for this long (milliseconds)
            timerInterval: 100, // fire continuously at this frequency (milliseconds),

            // a11y
            tagName: 'div',
            ariaRole: 'spinbutton',
            focusable: true,
            a11yValuePattern: '{{value}}', // {string} if you want units or additional content, add to pattern
            a11yDecimalPlaces: 0, // number of decimal places for the value read by assistive technology

            // set labelContent to give this AccessibleNumberTweaker an accessible name, required for spinbuttons
            // see https://github.com/phetsims/gravity-force-lab-basics/issues/62
            labelTagName: 'p',

            // Converts a value to a string, for extra formatting for the value read by the screen reader
            a11yFormatValue: function( value ) {
              return Util.toFixed( value, options.a11yDecimalPlaces );
            }
          };
          options = _.extend( {}, defaults, options );

          // Some options were already mutated in the constructor, only apply the accessibility-specific options here
          // so options are not doubled up, see https://github.com/phetsims/sun/issues/330
          var optionsToMutate = _.pick( options, _.keys( defaults ) );
          this.mutate( optionsToMutate );

          // this number tweaker is "aria-labelledby" its own label, meaning that the label element content will be
          // read on focus
          this.addAriaLabelledbyAssociation( {
            thisElementName: AccessiblePeer.PRIMARY_SIBLING,
            otherNode: this,
            otherElementName: AccessiblePeer.LABEL_SIBLING
          } );

          // @private {Property.<number>}
          this._valueProperty = valueProperty;

          // @private {Property.<Range>}
          this._enabledRangeProperty = enabledRangeProperty;

          // @private{Property.<boolean>}
          this._enabledProperty = enabledProperty;

          // @private {number}
          this._a11yValueDelta = options.a11yValueDelta;

          // @private {number}
          this._a11yPageValueDelta = options.a11yPageValueDelta;

          // @private {boolean}
          this._a11yUseTimer = options.a11yUseTimer;

          // @private - manages timing must be disposed
          this._callbackTimer = new CallbackTimer( {
            delay: options.timerDelay,
            interval: options.timerInterval
          } );

          // @private {Emitter} emit events when increment/decrement keys are pressed down/up
          this.incrementDownEmitter = new Emitter();
          this.decrementDownEmitter = new Emitter();

          // @private {Emitter} - emit events when value is incremented/decremented
          this.valueIncrementEmitter = new Emitter();
          this.valueDecrementEmitter = new Emitter();

          // update enabled number range for AT, required for screen reader events to behave correctly, must be disposed
          var enabledRangeObserver = function( enabledRange ) {
            self.setAccessibleAttribute( 'min', enabledRange.min );
            self.setAccessibleAttribute( 'max', enabledRange.max );
          };
          this._enabledRangeProperty.link( enabledRangeObserver );

          // a callback that is added and removed from the timer depending on keystate
          var downCallback = null;

          // handle all accessible event input
          var accessibleInputListener = {
            keydown: function( event ) {
              self.emitKeyState( event, true );

              // if using the timer, handle update at interval
              if ( self._a11yUseTimer ) {
                if ( !self._callbackTimer.isRunning() ) {
                  self.handleKeyDown( event );

                  downCallback = self.handleKeyDown.bind( self, event );
                  self._callbackTimer.addCallback( downCallback );
                  self._callbackTimer.start();
                }
              }
              else {
                self.handleKeyDown( event );
              }
            },
            keyup: function( event ) {
              self.emitKeyState( event, false );

              if ( self._a11yUseTimer ) {
                self._callbackTimer.stop( false );
                self._callbackTimer.removeCallback( downCallback );
              }
            }
          };
          this.addAccessibleInputListener( accessibleInputListener );

          // when the property changes, be sure to update the accessible input value
          var accessiblePropertyListener = function( value ) {

            // format the value to a certain number of decimal places
            var formattedValue = options.a11yFormatValue( value );

            // wrap the value with optional string pattern
            formattedValue = StringUtils.fillIn( options.a11yValuePattern, {
              value: formattedValue
            } );

            self.setAccessibleAttribute( 'aria-valuetext', formattedValue );
            self.setAccessibleAttribute( 'aria-valuenow', value );
          };
          this._valueProperty.link( accessiblePropertyListener );

          // @private - called by disposeAccessibleNumberTweaker to prevent memory leaks
          this._disposeAccessibleNumberTweaker = function() {
            self._valueProperty.unlink( accessiblePropertyListener );
            self._enabledRangeProperty.unlink( enabledRangeObserver );
            self._callbackTimer.dispose();

            // emitters owned by this instance, can be disposed here
            self.incrementDownEmitter.dispose();
            self.decrementDownEmitter.dispose();
            self.valueIncrementEmitter.dispose();
            self.valueDecrementEmitter.dispose();

            self.removeAccessibleInputListener( accessibleInputListener );
          };
        },

        /**
         * Emit events related to the keystate of the tweaker. Typically used to style the tweaker during keyboard
         * interaction.
         * @private
         *
         * @param {UIEvent} event - the DOM event that was triggered
         * @param {boolean} isDown - whether or not event was triggered from down or up keys
         */
        emitKeyState: function( event, isDown ) {
          if ( event.keyCode === KeyboardUtil.KEY_UP_ARROW || event.keyCode === KeyboardUtil.KEY_RIGHT_ARROW ) {
            this.incrementDownEmitter.emit1( isDown );
          }
          else if ( event.keyCode === KeyboardUtil.KEY_DOWN_ARROW || event.keyCode === KeyboardUtil.KEY_LEFT_ARROW ) {
            this.decrementDownEmitter.emit1( isDown );
          }
        },

        /**
         * Handle the keydown event so that this node behaves like an accessible number input.
         * @private
         *
         * @param {DOMEvent} event
         */
        handleKeyDown: function( event ) {
          var code = event.keyCode;

          if ( this._enabledProperty.get() ) {

            // prevent user from changing value with number or the space keys, handle arrow keys on our own
            if ( KeyboardUtil.isArrowKey( code ) || KeyboardUtil.isNumberKey( code ) || code === KeyboardUtil.KEY_SPACE ) {
              event.preventDefault();
            }

            // handle the event
            if ( code === KeyboardUtil.KEY_RIGHT_ARROW || code === KeyboardUtil.KEY_UP_ARROW ) {
              this.valueIncrementEmitter.emit();
              this._valueProperty.set( Math.min( this._valueProperty.get() + this._a11yValueDelta, this._enabledRangeProperty.get().max ) );
            }
            else if ( code === KeyboardUtil.KEY_LEFT_ARROW || code === KeyboardUtil.KEY_DOWN_ARROW ) {
              this.valueDecrementEmitter.emit();
              this._valueProperty.set( Math.max( this._valueProperty.get() - this._a11yValueDelta, this._enabledRangeProperty.get().min ) );
            }
            else if ( code === KeyboardUtil.KEY_PAGE_UP ) {
              this._valueProperty.set( Math.min( this._valueProperty.get() + this._a11yPageValueDelta, this._enabledRangeProperty.get().max ) );
            }
            else if ( code === KeyboardUtil.KEY_PAGE_DOWN ) {
              this._valueProperty.set( Math.max( this._valueProperty.get() - this._a11yPageValueDelta, this._enabledRangeProperty.get().min ) );
            }
            else if ( code === KeyboardUtil.KEY_HOME ) {
              this._valueProperty.set( this._enabledRangeProperty.get().min );
            }
            else if ( code === KeyboardUtil.KEY_END ) {
              this._valueProperty.set( this._enabledRangeProperty.get().max );
            }
          }
        },

        /**
         * Make the accessibility related aspects of this node eligible for garbage collection. Call when disposing
         * the type that this trait is mixed into.
         * @public
         */
        disposeAccessibleNumberTweaker: function() {
          this._disposeAccessibleNumberTweaker();
        }
      } );
    }
  };

  sun.register( 'AccessibleNumberTweaker', AccessibleNumberTweaker );

  return AccessibleNumberTweaker;
} );
