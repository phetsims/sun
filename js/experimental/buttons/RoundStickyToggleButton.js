// Copyright 2002-2014, University of Colorado Boulder

/**
 * A round toggle button that switches the value of a property that can take on valueA or valueB.  It
 * sticks in the down position when pressed, popping back up when pressed
 * again.
 *
 * @author John Blanco
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RoundButtonView = require( 'SUN/experimental/buttons/RoundButtonView' );
  var StickyToggleButtonModel = require( 'SUN/experimental/buttons/StickyToggleButtonModel' );

  function RoundStickyToggleButton( valueA, valueB, property, options ) {
    options = _.extend( {
      toggleOnDown: true
    }, options );

    RoundButtonView.call( this, new StickyToggleButtonModel( valueA, valueB, property ), options );
  }

  return inherit( RoundButtonView, RoundStickyToggleButton );
} );