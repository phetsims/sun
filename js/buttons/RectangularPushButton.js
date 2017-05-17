// Copyright 2014-2015, University of Colorado Boulder

/**
 * A rectangular push button.  This is the file in which the appearance and behavior are brought together.
 *
 * This class inherits from RectangularButtonView, which contains all of the code that defines the button's appearance,
 * and adds the button's behavior by hooking up a button model.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PushButtonInteractionStateProperty = require( 'SUN/buttons/PushButtonInteractionStateProperty' );
  var PushButtonModel = require( 'SUN/buttons/PushButtonModel' );
  var RectangularButtonView = require( 'SUN/buttons/RectangularButtonView' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );
  var TPushButton = require( 'SUN/buttons/TPushButton' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function RectangularPushButton( options ) {
    var self = this;

    options = _.extend( {
      tandem: Tandem.tandemRequired(), // {Tandem|null}
      phetioType: TPushButton,

      // a11y - listener that will only be called when using the keyboard to interact with the push button
      accessibleFire: function() {}
    }, options );

    // If a listener was passed in, save it and add it after creating the button model.  This is done so that
    // the same code path is always used for adding listener, thus guaranteeing a consistent code path if addListener is
    // overridden, see https://github.com/phetsims/sun/issues/284.
    var listener = options.listener;
    options = _.omit( options, [ 'listener' ] );

    // Safe to pass through options to the PushButtonModel like "fireOnDown".  Other scenery options will be safely ignored.
    this.buttonModel = new PushButtonModel( options ); // @public, listen only

    // add the listener that was potentially saved above
    listener && this.addListener( listener );

    // Call the parent type
    RectangularButtonView.call( this, this.buttonModel, new PushButtonInteractionStateProperty( this.buttonModel ), options );

    // a11y - press the button when 'enter' or 'spacebar' are pressed
    this.clickListener = this.addAccessibleInputListener( {
      click: function() {
        self.buttonModel.fire();
        options.accessibleFire();
      }
    } );

    this.disposeRectangularPushButton = function() {
      this.buttonModel.dispose(); //TODO this fails when assertions are enabled, see sun#212
      this.removeAccessibleInputListener( this.clickListener );
      options.tandem.removeInstance( this );
    };
  }

  sun.register( 'RectangularPushButton', RectangularPushButton );

  return inherit( RectangularButtonView, RectangularPushButton, {

      // @public
      dispose: function() {
        this.disposeRectangularPushButton();
        RectangularButtonView.prototype.dispose.call( this );
      },

      // @public
      addListener: function( listener ) {
        this.buttonModel.addListener( listener );
      },

      // @public
      removeListener: function( listener ) {
        this.buttonModel.removeListener( listener );
      }
    }
  );
} );