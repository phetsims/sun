// Copyright 2015, University of Colorado Boulder

/**
 * Model for a momentary button: on when pressed, off when released.
 *
 * @author Chris Malley
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ButtonModel = require( 'SUN/buttons/ButtonModel' );
  var sun = require( 'SUN/sun' );

  /**
   * @param {Object} valueOff - value when the button is in the off state
   * @param {Object} valueOn - value when the button is in the on state
   * @param {Property} property
   * @constructor
   */
  function MomentaryButtonModel( valueOff, valueOn, property ) {

    var self = this;
    ButtonModel.call( self );

    // sync with the property, do this before wiring up to supertype properties
    var onObserver = function( on ) {
      self.down = on;
    };
    property.link( onObserver );

    var downListener = function( down ) {

      // turn on when pressed (if enabled)
      if ( down ) {
        if ( self.enabled ) {
          self.trigger0( 'startedCallbacksForPressed' );
          property.set( valueOn );
          self.trigger0( 'endedCallbacksForPressed' );
        }
      }
      else {
        // turn off when released
        self.trigger0( 'startedCallbacksForReleased' );
        property.set( valueOff );
        self.trigger0( 'endedCallbacksForReleased' );
      }
    };
    this.downProperty.lazyLink( downListener );

    // turn off when disabled
    var enabledListener = function() {
      self.trigger0( 'startedCallbacksForReleasedByDisable' );
      property.set( valueOff );
      self.trigger0( 'endedCallbacksForReleasedByDisable' );
    };
    this.property( 'enabled' ).onValue( false, enabledListener );

    // @private: just for dispose.  Named based on the type name so it won't have a name collision with parent/child ones
    this.disposeMomentaryButtonModel = function() {
      self.property( 'enabled' ).off( enabledListener );
      self.downProperty.unlink( downListener );
      property.unlink( onObserver );
    };
  }

  sun.register( 'MomentaryButtonModel', MomentaryButtonModel );

  return inherit( ButtonModel, MomentaryButtonModel, {

    // @public - Ensures that this model is eligible for GC.
    dispose: function() {
      ButtonModel.prototype.dispose.call( this );
      this.disposeMomentaryButtonModel();
    }
  } );
} );