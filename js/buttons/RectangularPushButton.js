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

    options = _.extend( {
      tandem: Tandem.tandemRequired(), // {Tandem|null}
      phetioType: TPushButton
    }, options );

    // Safe to pass through options to the PushButtonModel like "fireOnDown".  Other scenery options will be safely ignored.
    this.buttonModel = new PushButtonModel( options ); // @public, listen only

    // Call the parent type
    RectangularButtonView.call( this, this.buttonModel, new PushButtonInteractionStateProperty( this.buttonModel ), options );

    // a11y - press the button when 'enter' or 'spacebar' are pressed
    var self = this;
    this.clickListener = this.addAccessibleInputListener( { 
      click: function() {
        self.buttonModel.fire();
      }
    } );
  }

  sun.register( 'RectangularPushButton', RectangularPushButton );

  return inherit( RectangularButtonView, RectangularPushButton, {

      // @public
      dispose: function() {
        this.buttonModel.dispose(); //TODO this fails when assertions are enabled, see sun#212
        this.removeAccessibleInputListener( this.clickListener );
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