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

    // To be set by together.js
    this.componentID = null;
    this.componentType = null;

    var self = this;
    ButtonModel.call( self );

    // @private sync with the property, do this before wiring up to supertype properties
    this.onObserver = function( on ) {
      self.down = on;
    };
    this.onProperty = onProperty; // @private
    this.onProperty.link( this.onObserver );

    // turn on when pressed (if enabled)
    this.property( 'down' ).onValue( true, function() {
      if ( self.enabled ) {
        var archID = arch && arch.start( 'user', self.componentID, self.componentType, 'pressed' );
        onProperty.set( true );
        arch && arch.end( archID );
      }
    } );

    // turn off when released
    this.property( 'down' ).onValue( false, function() {
      var archID = arch && arch.start( 'user', self.componentID, self.componentType, 'released' );
      onProperty.set( false );
      arch && arch.end( archID );
    } );

    // turn off when disabled
    this.property( 'enabled' ).onValue( false, function() {
      var archID = arch && arch.start( 'model', self.componentID, self.componentType, 'releasedDisabled' );
      onProperty.set( false );
      arch && arch.end( archID );
    } );
  }

  return inherit( ButtonModel, MomentaryButtonModel, {

    // Ensures that this model is eligible for GC.
    dispose: function() {
      this.onProperty.unlink( this.onObserver );
    }
  } );
} );