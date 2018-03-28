// Copyright 2014-2017, University of Colorado Boulder

/**
 * An interactive round push button.  This is the file in which the appearance and behavior are brought together.
 *
 * This class inherits from RoundButtonView, which contains all of the
 * code that defines the button's appearance, and adds the button's behavior
 * by hooking up a button model.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PushButtonInteractionStateProperty = require( 'SUN/buttons/PushButtonInteractionStateProperty' );
  var PushButtonIO = require( 'SUN/buttons/PushButtonIO' );
  var PushButtonModel = require( 'SUN/buttons/PushButtonModel' );
  var RoundButtonView = require( 'SUN/buttons/RoundButtonView' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function RoundPushButton( options ) {

    options = _.extend( {
      tandem: Tandem.required,
      phetioType: PushButtonIO,

      // a11y
      tagName: 'button',
      accessibleFire: function() {}
    }, options );

    var self = this;

    // If a listener was passed in, save it and add it after creating the button model.  This is done so that
    // the same code path is always used for adding listener, thus guaranteeing a consistent code path if addListener is
    // overridden, see https://github.com/phetsims/sun/issues/284.
    var listener = options.listener;
    options = _.omit( options, [ 'listener' ] );

    // Safe to pass through options to the PushButtonModel like "fireOnDown".  Other scenery options will be safely ignored.
    assert && assert( !options.phetioEventSource, 'phetioEventSource cannot be supplied in options' );
    this.buttonModel = new PushButtonModel( _.extend( { phetioEventSource: this }, options ) ); // @public, listen only
    RoundButtonView.call( this, this.buttonModel, new PushButtonInteractionStateProperty( this.buttonModel ), options );

    // add the listener that was potentially saved above
    listener && this.addListener( listener );

    // a11y - when the button is clicked with assistive technology, fire
    this.clickListener = this.addAccessibleInputListener( {
      click: function() {
        if ( self.enabled ) {
          self.buttonModel.a11yClick( options.accessibleFire );
        }
      },
      focus: function() {
        self.buttonModel.overProperty.value = true;
      },
      blur: function() {
        self.buttonModel.overProperty.value = false;
      }
    } );

    this.disposeRoundPushButton = function() {
      self.removeAccessibleInputListener( this.clickListener );
      self.buttonModel.dispose();
    };
  }

  sun.register( 'RoundPushButton', RoundPushButton );

  return inherit( RoundButtonView, RoundPushButton, {

    // @public
    dispose: function() {
      this.disposeRoundPushButton();
      RoundButtonView.prototype.dispose.call( this );
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