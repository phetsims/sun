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

  function ButtonModel() {

    PropertySet.call( this, {

      // Property that tracks whether or not a pointer that could interact with the button is currently over the button.
      over: false,

      // Property that tracks whether a pointer is currently down on, a.k.a. pressing, the button.
      down: false,

      // Property that tracks whether or not the button is enabled.
      enabled: true
    } );
  }

  return inherit( PropertySet, ButtonModel );
} );