// Copyright 2019, University of Colorado Boulder

/**
 * A trait for subtypes of Node. Meant for Nodes with a value that "run" on a NumberProperty and handles formatting,
 * mapping, and aria-valuetext updating.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

define( require => {
  'use strict';

  // modules
  const extend = require( 'PHET_CORE/extend' );
  const inheritance = require( 'PHET_CORE/inheritance' );
  const Node = require( 'SCENERY/nodes/Node' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const sun = require( 'SUN/sun' );
  const SunConstants = require( 'SUN/SunConstants' );
  const timer = require( 'AXON/timer' );
  const Util = require( 'DOT/Util' );

  const AccessibleValueHandler = {

    /**
     * Implement functionality for a number spinner.
     * @public
     * @trait
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
         * @param {Object} [options] - note, does not mutate the Node
         *
         * @protected
         */
        initializeAccessibleValueHandler( valueProperty, options ) {

          // ensure that the client does not set both a custom text pattern and a text creation function
          assert && assert(
            !( options.a11yValuePattern && options.a11yCreateValueChangeAriaValueText ),
            'cannot set both a11yValuePattern and a11yCreateValueChangeAriaValueText in options'
          );

          // verify that a11yValuePattern includes SunConstants.VALUE_NAMED_PLACEHOLDER, and that is the only key in the pattern
          if ( assert && options.a11yValuePattern ) {
            assert( options.a11yValuePattern.match( /\{\{[^\{\}]+\}\}/g ).length === 1,
              'a11yValuePattern only accepts a single \'value\' key'
            );
            assert( options.a11yValuePattern.indexOf( SunConstants.VALUE_NAMED_PLACEHOLDER ) >= 0,
              'a11yValuePattern must contain a key of \'value\''
            );
          }

          options = _.extend( {

            a11yValuePattern: SunConstants.VALUE_NAMED_PLACEHOLDER, // {string} if you want units or additional content, add to pattern
            a11yDecimalPlaces: 0, // number of decimal places for the value when formatted and read by assistive technology

            /**
             * Map the valueProperty value to another number that will be read by the assistive device on
             * valueProperty changes.
             * @param {number} value
             * @returns {number}
             */
            a11yMapValue: _.identity,

            /**
             * Custom aria-valuetext creation function, called when the valueProperty changes. Used in replacement of
             * the simpler/easier option: a11yValuePattern.
             * This string is read by AT every time the slider value changes.
             * @type {Function}
             * @param {number} formattedValue - mapped value fixed to the provided decimal places
             * @param {number} newValue - the new value, unformatted
             * @param {number} previousValue - just the "oldValue" from the property listener
             * @returns {string} - aria-valuetext to be set to the primarySibling
             */
            a11yCreateValueChangeAriaValueText: _.identity,

            /**
             * By default there will be nothing special provided on focus, just the previous value set on Property change.
             * If a specific aria-valuetext is desired when the interactive DOM element is focused, then use this option
             * to provide the proper "on focus" text. If provided, this will be called independently of the "on change"
             * valuetext updates. As a result, you can use either a11yCreateValueChangeAriaValueText or a11yValuePattern
             * with this.
             *
             * The string that this function returns is set as aria-valuetext when the component is focused.
             *
             * @type {null|Function}
             * @param {number} formattedValue - mapped value fixed to the provided decimal places
             * @param {number} value - the current value of the Property, unformatted
             * @returns {string} - aria-valuetext to be set to the primarySibling
             */
            a11yCreateOnFocusAriaValueText: null
          }, options );

          // @private {Property.<number>}
          this._valueProperty = valueProperty;

          // @public (read-only) - precision for the output value to be read by an assistive device
          this.a11yDecimalPlaces = options.a11yDecimalPlaces;

          // @private {function}
          this.a11yMapValue = options.a11yMapValue;

          // @private - {null|function} see options for doc
          this.a11yCreateOnFocusAriaValueText = options.a11yCreateOnFocusAriaValueText;

          // when the property changes, be sure to update the accessible input value and aria-valuetext which is read
          // by assistive technology when the value changes
          const valuePropertyListener = ( value, oldValue ) => {

            const formattedValue = this.getA11yFormattedValue();

            // create the final string from optional parameters. This looks messy, but in reality you can only supply
            // the valuePattern OR the create function, so this works as an "either or" situation.
            this.ariaValueText = StringUtils.fillIn( options.a11yValuePattern, {
              value: options.a11yCreateValueChangeAriaValueText( formattedValue, value, oldValue )
            } );

            // set the aria-valuenow attribute in case the AT requires it to read the value correctly, some may
            // fall back on this from aria-valuetext see
            // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_aria-valuetext_attribute#Possible_effects_on_user_agents_and_assistive_technology
            this.setAccessibleAttribute( 'aria-valuenow', formattedValue );

            // update the PDOM input value on Property change
            this.inputValue = formattedValue;
          };
          this._valueProperty.link( valuePropertyListener );

          const valueHandlerListener = {

            // When not providing a timeout, we would often get this change for the previously focused element even
            // though it wasn't the active element of the screen. Perhaps this is just a bug/problem with how AT monitor
            // for aria-valuetext updating.
            focus: () => { timer.setTimeout( () => this.updateOnFocusAriaValueText(), 0 );}
          };
          this.addInputListener( valueHandlerListener );

          // @private - called by disposeAccessibleValueHandler to prevent memory leaks
          this._disposeAccessibleValueHandler = () => {
            this.removeInputListener( valueHandlerListener );
            this._valueProperty.unlink( valuePropertyListener );
          };
        },

        /**
         * @public
         * Update the aria-valuetext for the next time that this element is focused.
         */
        updateOnFocusAriaValueText() {
          if ( this.a11yCreateOnFocusAriaValueText ) {
            this.ariaValueText = this.a11yCreateOnFocusAriaValueText( this.getA11yFormattedValue(), this._valueProperty.value );
          }
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
         * Call when disposing the type that this trait is mixed into.
         * @public
         */
        disposeAccessibleValueHandler() {
          this._disposeAccessibleValueHandler();
        }
      } );
    }
  };

  sun.register( 'AccessibleValueHandler', AccessibleValueHandler );

  return AccessibleValueHandler;
} );
