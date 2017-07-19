// Copyright 2014-2015, University of Colorado Boulder

/**
 * Base class for button models, which describe the behavior of buttons when users interact with them.  Property values
 * are set by an associated listener, see ButtonListener for details.
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var sun = require( 'SUN/sun' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function ButtonModel( options ) {

    options = _.extend( {
      // {function} called on pointer down
      startCallback: function() {},
      // {function} called on pointer up, @param {boolean} over - indicates whether the pointer was released over the button
      endCallback: function( over ) {},
      // {boolean} is the button enabled?
      enabled: true
    }, options );

    var self = this;

    // model properties
    this.overProperty = new Property( false ); // @public - Is the pointer over the button?
    this.downProperty = new Property( false ); // @public - Is the pointer down?
    this.enabledProperty = new Property( options.enabled ); // @public - Is the button enabled?

    // startCallback on pointer down, endCallback on pointer up. lazyLink so they aren't called immediately.
    this.downProperty.lazyLink( function( down ) {
      if ( down ) {
        options.startCallback();
      }
      else {
        options.endCallback( self.overProperty.get() );
      }
    } );
  }

  sun.register( 'ButtonModel', ButtonModel );

  return inherit( Object, ButtonModel, {

    // @public
    dispose: function() {
      //TODO because this is called by subtypes, see https://github.com/phetsims/sun/issues/274#issuecomment-263750638
    }
  } );
} );