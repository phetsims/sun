// Copyright 2002-2014, University of Colorado Boulder

/**
 * Base class for button models, which describe the behavior of buttons when users interact with them.  Property values
 * are set by an associated listener, see ButtonListener for details.
 */
define( function( require ) {
  'use strict';

  // Imports
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function ButtonModel( options ) {

    options = _.extend( {
      // {function} called on pointer down
      startCallback: function() {},
      // {function} called on pointer up, @param {boolean} over - indicates whether the pointer was released over the button
      endCallback: function( over ) {}
    }, options );

    var thisModel = this;

    PropertySet.call( this, {
      over: false,  // Is the pointer over the button?
      down: false, // Is the pointer down?
      enabled: true  // Is the button enabled?
    }, options );

    // startCallback on pointer down, endCallback on pointer up. lazyLink so they aren't called immediately.
    this.property( 'down' ).lazyLink( function( down ) {
      if ( down ) {
        options.startCallback();
      }
      else {
        options.endCallback( thisModel.over );
      }
    } );
  }

  return inherit( PropertySet, ButtonModel, {
    dispose: function() {
      PropertySet.prototype.dispose.call( this );
    }
  } );
} );