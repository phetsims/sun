// Copyright 2002-2014, University of Colorado Boulder

/**
 * A circular toggle button that switches the value of a boolean property.  It
 * sticks in the down position when pressed, popping back up when pressed
 * again.
 *
 * This class inherits from RoundButtonView instead of using composition to
 * simplify the logic for the options (and potentially performance improvements
 * since there will be fewer nodes in the scene graph).
 *
 * @author John Blanco
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var RoundButtonView = require( 'SUN/experimental/buttons/RoundButtonView' );
  var ToggleButtonModel = require( 'SUN/experimental/buttons/ToggleButtonModel' );
  var ButtonListener = require( 'SUN/experimental/buttons/ButtonListener' );

  function RoundToggleButton( booleanProperty, options ) {
    this.booleanProperty = booleanProperty;
    options = _.extend( {
      toggleOnDown: true
    }, options );

    this.buttonModel = new ToggleButtonModel( booleanProperty );
    RoundButtonView.call( this, this.buttonModel, options );
    this.addInputListener( new ButtonListener( this.buttonModel ) );
  }

  return inherit( RoundButtonView, RoundToggleButton );
} );
