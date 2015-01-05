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
   * @param {Property.<boolean>} onProperty
   * @constructor
   */
  function MomentaryButtonModel( onProperty ) {

    var thisModel = this;
    ButtonModel.call( thisModel );

     // @private sync with the property, do this before wiring up to supertype properties
    this.onObserver = function( on ) {
      thisModel.down = on;
    };
    this.onProperty = onProperty; // @private
    this.onProperty.link( this.onObserver );

    // turn on when pressed (if enabled)
    this.property( 'down' ).onValue( true, function() {
      if ( thisModel.enabled ) { onProperty.set( true ); }
    } );

    // turn off when released
    this.property( 'down' ).onValue( false, function() {
      onProperty.set( false );
    } );

    // turn off when disabled
    this.property( 'enabled' ).onValue( false, function() {
      onProperty.set( false );
    } );
  }

  return inherit( ButtonModel, MomentaryButtonModel, {

    // Ensures that this model is eligible for GC.
    dispose: function() {
      this.onProperty.unlink( this.onObserver );
    }
  } );
} );