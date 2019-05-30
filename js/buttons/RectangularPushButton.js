// Copyright 2014-2018, University of Colorado Boulder

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
  var InstanceRegistry = require( 'PHET_CORE/documentation/InstanceRegistry' );
  var PushButtonInteractionStateProperty = require( 'SUN/buttons/PushButtonInteractionStateProperty' );
  var PushButtonModel = require( 'SUN/buttons/PushButtonModel' );
  var RectangularButtonView = require( 'SUN/buttons/RectangularButtonView' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function RectangularPushButton( options ) {

    options = _.extend( {
      tandem: Tandem.required
    }, options );

    // If a listener was passed in, save it and add it after creating the button model.  This is done so that
    // the same code path is always used for adding listener, thus guaranteeing a consistent code path if addListener is
    // overridden, see https://github.com/phetsims/sun/issues/284.
    var listener = options.listener;
    options = _.omit( options, [ 'listener' ] );

    // Safe to pass through options to the PushButtonModel like "fireOnDown".  Other scenery options will be safely ignored.
    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    this.buttonModel = new PushButtonModel( options ); // @public, listen only

    // add the listener that was potentially saved above
    listener && this.addListener( listener );

    // Call the parent type
    RectangularButtonView.call( this, this.buttonModel, new PushButtonInteractionStateProperty( this.buttonModel ), options );

    this.disposeRectangularPushButton = function() {
      this.buttonModel.dispose(); //TODO this fails when assertions are enabled, see sun#212
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'AccordionBox', this );
  }

  sun.register( 'RectangularPushButton', RectangularPushButton );

  return inherit( RectangularButtonView, RectangularPushButton, {

    // @public
    dispose: function() {

      // The order of operations here is important - the view needs to be disposed first so that it is unhooked from
      // the model before the model is disposed.  If the model is disposed first, the view ends up trying to change some
      // of its property values when it is disposed.  See https://github.com/phetsims/axon/issues/242.
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
  } );
} );