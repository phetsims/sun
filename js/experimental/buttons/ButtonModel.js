// Copyright 2002-2014, University of Colorado Boulder

/**
 * Base class for button models, which describe the behavior of buttons when
 * users interact with them.
 */
define( function( require ) {
  'use strict';

  // Imports
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );

  function ButtonModel() {

    PropertySet.call( this, {

      // Property that tracks whether or not a pointer that could interact
      // with the button is currently over the button.  For detailed semantics
      // please see the descendant classes.
      over: false,

      // Property that tracks whether a pointer is currently down on, a.k.a.
      // pressing, the button.  For detailed semantics please see the
      // descendant classes.
      down: false,

      // Property that tracks whether or not the button is enabled.  For
      // detailed semantics please see the descendant classes.
      enabled: true
    } );
  }

  return inherit( PropertySet, ButtonModel );
} );