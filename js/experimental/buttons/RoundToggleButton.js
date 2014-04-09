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
  var RoundButtonView = require( 'SUN/experimental/buttons/RoundButtonView' );

  function RoundToggleButton( booleanProperty, options ) {
    this.booleanProperty = booleanProperty;
    options = _.extend( {
      radius: options.content ? undefined : 30,
      listener: null,
      accessibilityLabel: '',
      toggleOnDown: true
    }, options );

    AbstractToggleButton.call( this, booleanProperty, { toggleOnDown: options.toggleOnDown } );

    //TODO: In general cannot pass options through two places because effects may be cumulative (such as translation or rotation)
    //TODO: May be best to extend RoundButtonView and add the listeners here in the subclass
    //TODO: See RoundPushButton for details
    this.button = new RoundButtonView( this.buttonModel, options );
    this.addChild( this.button );

    this.mutate( options );
  }

  return inherit( AbstractToggleButton, RoundToggleButton );
} );
