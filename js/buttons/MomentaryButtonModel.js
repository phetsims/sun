// Copyright 2002-2015, University of Colorado Boulder

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

  /**
   * @param {Property.<boolean>} onProperty - is the momentary button on or off?
   * @constructor
   */
  function MomentaryButtonModel( onProperty ) {

    var self = this;
    ButtonModel.call( self );

    // sync with the property, do this before wiring up to supertype properties
    var onObserver = function( on ) {
      self.down = on;
    };
    onProperty.link( onObserver );

    var downListener = function( down ) {

      // turn on when pressed (if enabled)
      if ( down ) {
        if ( self.enabled ) {
          self.trigger0( 'startedCallbacksForPressed' );
          onProperty.set( true );
          self.trigger0( 'endedCallbacksForPressed' );
        }
      }
      else {
        // turn off when released
        self.trigger0( 'startedCallbacksForReleased' );
        onProperty.set( false );
        self.trigger0( 'endedCallbacksForReleased' );
      }
    };
    this.downProperty.lazyLink( downListener );

    // turn off when disabled
    var enabledListener = function() {
      self.trigger0( 'startedCallbacksForReleasedDisabled' );
      onProperty.set( false );
      self.trigger0( 'endedCallbacksForReleasedDisabled' );
    };
    this.property( 'enabled' ).onValue( false, enabledListener );

    // @private: just for dispose.  Named based on the type name so it won't have a name collision with parent/child ones
    this.disposeMomentaryButtonModel = function() {
      self.property( 'enabled' ).off( enabledListener );
      self.downProperty.unlink( downListener );
      onProperty.unlink( onObserver );
    };
  }

  return inherit( ButtonModel, MomentaryButtonModel, {

    // Ensures that this model is eligible for GC.
    dispose: function() {
      this.disposeMomentaryButtonModel();
    }
  } );
} );