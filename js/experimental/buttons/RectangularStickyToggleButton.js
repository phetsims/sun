// Copyright 2002-2014, University of Colorado Boulder

/**
 * A rectangular toggle button that switches the value of a property that can take on valueA or valueB.  It
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
  var RectangularButtonView = require( 'SUN/experimental/buttons/RectangularButtonView' );
  var StickyToggleButtonModel = require( 'SUN/experimental/buttons/StickyToggleButtonModel' );
  var ButtonListener = require( 'SUN/experimental/buttons/ButtonListener' );

  function RectangularStickyToggleButton( valueA, valueB, property, options ) {
    this.buttonModel = new StickyToggleButtonModel( valueA, valueB, property );
    RectangularButtonView.call( this, this.buttonModel, options );
    this.addInputListener( new ButtonListener( this.buttonModel ) );
  }

  return inherit( RectangularButtonView, RectangularStickyToggleButton );
} );