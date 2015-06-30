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
      over: false,  // Is pointer over the button?
      down: false, // Is pointer down?
      enabled: true  // Is the button enabled?
    }, options );

    // Call startCallback on pointer down.
    this.property( 'down' ).onValue( true, function() { options.startCallback(); } );

    // Call endCallback on pointer up.
    this.property( 'down' ).onValue( false, function() { options.endCallback( thisModel.over ); } );
  }

  return inherit( PropertySet, ButtonModel, {
    dispose: function() {
      PropertySet.prototype.dispose.call( this );
    }
  } );
} );