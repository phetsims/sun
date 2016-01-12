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

  /**
   * @param {Object} [options]
   * @constructor
   */
  function RectangularPushButton( options ) {

    options = _.extend( {
      accessibleDescription: '', // invisible description for a11y
      accessibleLabel: '', // invisible label for a11y
      tandem: null,
      accessibleContent: {
        createPeer: function( accessibleInstance ) {
          return new RectangularPushButtonAccessiblePeer( accessibleInstance, options.accessibleDescription, options.accessibleLabel, options.listener );
        }
      }
    }, options );

    // Safe to pass through options to the PushButtonModel like "fireOnDown".  Other scenery options will be safely ignored.
    this.buttonModel = new PushButtonModel( options ); // @public, listen only
    RectangularButtonView.call( this, this.buttonModel, new PushButtonInteractionStateProperty( this.buttonModel ), options );

    // Tandem support
    // Give it a novel name to reduce the risk of parent or child collisions
    // @public (tandem)
    this.rectangularPushButtonTandem = options.tandem;
    this.rectangularPushButtonTandem && this.rectangularPushButtonTandem.addInstance( this );
  }

  inherit( RectangularButtonView, RectangularPushButton, {

    // @public
    dispose: function() {
      this.buttonModel.dispose(); //TODO this fails when assertions are enabled, see sun#212
      RectangularButtonView.prototype.dispose.call( this );
      this.rectangularPushButtonTandem && this.rectangularPushButtonTandem.removeInstance( this );
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
     * @param {string} buttonDescription
     * @param {string} buttonLabel
     * @param {function} listener
     * @returns {ScreenViewAccessiblePeer}
     * @constructor
     * @public
     */
    RectangularPushButtonAccessiblePeer: function( accessibleInstance, buttonDescription, buttonLabel, listener ) {
      return new RectangularPushButtonAccessiblePeer( accessibleInstance, buttonDescription, buttonLabel, listener );
    }
  } 
  );

  sun.register( 'RectangularPushButton', RectangularPushButton );

  /**
   * Create the accessible peer which represents the RectangularPushButton in the parallel DOM.
   *
   * @param {AccessibleInstance} accessibleInstance
   * @param {string} buttonDescription - invisible auditory description for a11y
   * @param {string} buttonLabel - invisible label for a11y
   * @param {function} listener - the listener function called on press for this RectangularPushButton
   * @constructor
   * @private
   */
  function RectangularPushButtonAccessiblePeer( accessibleInstance, buttonDescription, buttonLabel, listener ) {
    this.initialize( accessibleInstance, buttonDescription, buttonLabel, listener );
  }

  inherit( AccessiblePeer, RectangularPushButtonAccessiblePeer, {

    /**
     * Initialized dom elements and its attributes for the screen view in the parallel DOM.
     *
     * @param {AccessibleInstance} accessibleInstance
     * @param {string} buttonDescription - invisible auditory description for a11y
     * @param {string} buttonLabel - invisible label for a11y
     * @param {function} listener - the listener function called on press for this RectangularPushButton
     * @public (a11y)
     */
    initialize: function( accessibleInstance, buttonDescription, buttonLabel, listener ) {
      var trail = accessibleInstance.trail;
      var uniqueId = trail.getUniqueId();
                    
      // will look like <input value="Reset All" type="reset" tabindex="0">
      var domElement = document.createElement( 'input' );
      domElement.setAttribute( 'type', 'button' );
      domElement.value = buttonLabel;

      // @private - create an element that describes the button with aria-describedby
      this.descriptionElement = document.createElement( 'p' );
      this.descriptionElement.textContent = buttonDescription;
      this.descriptionElement.id = 'reset-all-description-' + uniqueId;
      domElement.appendChild( this.descriptionElement );
      domElement.setAttribute( 'aria-describedby', this.descriptionElement.id );

      // fire on click event
      domElement.addEventListener( 'click', function() {
        listener();
      } );

      this.initializeAccessiblePeer( accessibleInstance, domElement );

    },

    /**
     * Update the accessible description for the push button.
     * 
     * @param {string} newDescription
     * @public (a11y)
     */
    updateDescription: function( newDescription ) {
      this.descriptionElement.textContent = newDescription;
    }
  } );
  return RectangularPushButton;
} );