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
      tandem: Tandem.tandemRequired() // {Tandem|null}
    }, options );

    // Safe to pass through options to the PushButtonModel like "fireOnDown".  Other scenery options will be safely ignored.
    this.buttonModel = new PushButtonModel( options ); // @public, listen only

    // Store a reference to the true tandem which will be used to register the instance
    var tandem = options.tandem;

    // Supply a supertype tandem before Node is called, since we register our own instance
    options.tandem = options.tandem.createSupertypeTandem();

    // Call the parent type
    RectangularButtonView.call( this, this.buttonModel, new PushButtonInteractionStateProperty( this.buttonModel ), options );

    // Tandem support
    tandem.addInstance( this, TPushButton );

    this.disposeRectangularPushButton = function() {
      tandem.removeInstance( this );
    };
  }

  sun.register( 'RectangularPushButton', RectangularPushButton );

  return inherit( RectangularButtonView, RectangularPushButton, {

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
    }
  );
} );