// Copyright 2002-2014, University of Colorado Boulder

/**
 * A circular toggle button that switches the value of a boolean property.  It
 * sticks in the down position when pressed, popping back up when pressed
 * again.
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var AbstractToggleButton = require( 'SUN/experimental/buttons/AbstractToggleButton' );
  var ToggleNode = require( 'SUN/ToggleNode' );

  function RoundToggleButton( booleanProperty, options ) {
    options = _.extend( {
      content: null, // By default, there is nothing on this button
      padX: 10,
      padY: 10,
      cursor: 'pointer',
      listener: null,
      accessibilityLabel: ''
    }, options );

    this.button = new RoundButtonView( this.buttonModel );
    this.addChild( this.button );

    AbstractToggleButton.call( this, booleanProperty, options );
  }

  return inherit( AbstractToggleButton, RoundToggleButton );
} );
