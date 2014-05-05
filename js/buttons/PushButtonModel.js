// Copyright 2002-2014, University of Colorado Boulder

/**
 * Basic model for a push button, including over/down/enabled properties.
 *
 * @author Sam Reid
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ButtonModel = require( 'SUN/buttons/ButtonModel' );

  /**
   * @param {Object} options
   * @constructor
   */
  function PushButtonModel( options ) {
    var pushButtonModel = this;

    options = _.extend( {
      fireOnDown: false, // true: fire on pointer down; false: fire on pointer up if pointer is over button
      listener: null
    }, options );

    ButtonModel.call( this );

    this.listeners = []; //@private
    if ( options.listener !== null ) {
      this.listeners.push( options.listener );
    }

    // If button was pressed and "fire on down" was set, fire the listeners
    this.property( 'down' ).onValue( true, function() {
      if ( options.fireOnDown && pushButtonModel.enabled ) {
        pushButtonModel.fire();
      }
    } );

    // If button was released and "fire on down" was not set, fire the listeners
    this.property( 'down' ).onValue( false, function() {
      if ( !options.fireOnDown && pushButtonModel.over && pushButtonModel.enabled ) {
        pushButtonModel.fire();
      }
    } );
  }

  return inherit( ButtonModel, PushButtonModel, {

    // Adds a listener. If already a listener, this is a no-op.
    addListener: function( listener ) {
      if ( this.listeners.indexOf( listener ) === -1 ) {
        this.listeners.push( listener );
      }
    },

    // Remove a listener. If not a listener, this is a no-op.
    removeListener: function( listener ) {
      var i = this.listeners.indexOf( listener );
      if ( i !== -1 ) {
        this.listeners.splice( i, 1 );
      }
    },

    // Fires all listeners.
    // @private with the possible exception of hooking up for accessibility.
    fire: function() {
      var copy = this.listeners.slice( 0 );
      copy.forEach( function( listener ) {
        listener();
      } );
    }
  } );
} );