// Copyright 2014-2015, University of Colorado Boulder

/**
 * A rectangular push button.  This is the file in which the appearance and behavior are brought together.
 *
 * This class inherits from RectangularButtonView, which contains all of the code that defines the button's appearance,
 * and adds the button's behavior by hooking up a button model.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PushButtonInteractionStateProperty = require( 'SUN/buttons/PushButtonInteractionStateProperty' );
  var PushButtonModel = require( 'SUN/buttons/PushButtonModel' );
  var RectangularButtonView = require( 'SUN/buttons/RectangularButtonView' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );

  // phet-io modules
  var TPushButton = require( 'ifphetio!PHET_IO/types/sun/buttons/TPushButton' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function RectangularPushButton( options ) {

    options = _.extend( {
      accessibleLabel: '', // {string} invisible label for a11y
      tandem: Tandem.tandemRequired(), // {Tandem|null}
      accessibleContent: {
        createPeer: function( accessibleInstance ) {
          return new RectangularPushButtonAccessiblePeer( accessibleInstance, options.accessibleLabel, options.listener );
        }
      }
    }, options );

    // Safe to pass through options to the PushButtonModel like "fireOnDown".  Other scenery options will be safely ignored.
    this.buttonModel = new PushButtonModel( options ); // @public, listen only
    RectangularButtonView.call( this, this.buttonModel, new PushButtonInteractionStateProperty( this.buttonModel ), options );

    // Tandem support
    options.tandem.addInstance( this, TPushButton );

    this.disposeRectangularPushButton = function() {
      options.tandem.removeInstance( this );
    };
  }

  inherit( RectangularButtonView, RectangularPushButton, {

      // @public
      dispose: function() {
        this.buttonModel.dispose(); //TODO this fails when assertions are enabled, see sun#212
        RectangularButtonView.prototype.dispose.call( this );
        this.disposeRectangularPushButton();
      },

      // @public
      addListener: function( listener ) {
        this.buttonModel.addListener( listener );
      },

      // @public
      removeListener: function( listener ) {
        this.buttonModel.removeListener( listener );
      }
    },

    // statics
    {
      /**
       * Extend the accessible peer of RectangularPushButton to add custom accessibility attributes in subtypes.
       *
       * @param {AccessibleInstance} accessibleInstance
       * @param {string} buttonLabel
       * @param {function} listener
       * @returns {ScreenViewAccessiblePeer}
       * @constructor
       * @public
       */
      RectangularPushButtonAccessiblePeer: function( accessibleInstance, buttonLabel, listener ) {
        return new RectangularPushButtonAccessiblePeer( accessibleInstance, buttonLabel, listener );
      }
    }
  );

  sun.register( 'RectangularPushButton', RectangularPushButton );

  /**
   * Create the accessible peer which represents the RectangularPushButton in the parallel DOM.
   *
   * @param {AccessibleInstance} accessibleInstance
   * @param {string} buttonLabel - invisible label for a11y
   * @param {function} listener - the listener function called on press for this RectangularPushButton
   * @constructor
   * @private
   */
  function RectangularPushButtonAccessiblePeer( accessibleInstance, buttonLabel, listener ) {
    this.initialize( accessibleInstance, buttonLabel, listener );
  }

  inherit( AccessiblePeer, RectangularPushButtonAccessiblePeer, {

    /**
     * Initialized dom elements and its attributes for the screen view in the parallel DOM.
     *
     * @param {AccessibleInstance} accessibleInstance
     * @param {string} [buttonLabel] - invisible label for a11y
     * @param {function} listener - the listener function called on press for this RectangularPushButton
     * @public (a11y)
     */
    initialize: function( accessibleInstance, buttonLabel, listener ) {

      // will look like <button aria-label="Button Label" type="button">
      var domElement = document.createElement( 'button' );
      domElement.textContent = buttonLabel;

      // fire on click event
      domElement.addEventListener( 'click', function() {
        listener();
      } );

      this.initializeAccessiblePeer( accessibleInstance, domElement );

    }

  } );
  return RectangularPushButton;
} );