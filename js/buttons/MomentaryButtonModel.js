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

    // @private sync with the property, do this before wiring up to supertype properties
    this.onObserver = function( on ) {
      self.down = on;
    };
    this.onProperty = onProperty; // @private
    this.onProperty.link( this.onObserver );

    this.downProperty.lazyLink( function( down ) {

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
    } );

    // turn off when disabled
    this.property( 'enabled' ).onValue( false, function() {
      self.trigger0( 'startedCallbacksForReleasedDisabled' );
      onProperty.set( false );
      self.trigger0( 'endedCallbacksForReleasedDisabled' );
    } );
  }

  return inherit( ButtonModel, MomentaryButtonModel, {

    // Ensures that this model is eligible for GC.
    dispose: function() {
      this.onProperty.unlink( this.onObserver );
    }
  } );
} );