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
      over: false,
      down: false,
      enabled: true
      // Note: All descendant classes should add an 'interactionState' property.
    } );
  }

  return inherit( PropertySet, ButtonModel );
} );