// Copyright 2002-2014, University of Colorado Boulder

/**
 * BooleanRectangularStickyToggleButton is a sticky toggle button that uses a boolean property to indicate whether it is off/unpressed/false or on/pressed/true.
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

  function BooleanRectangularStickyToggleButton( booleanProperty, options ) {
    this.buttonModel = new StickyToggleButtonModel( false, true, booleanProperty );
    RectangularButtonView.call( this, this.buttonModel, options );
    this.addInputListener( new ButtonListener( this.buttonModel ) );
  }

  return inherit( RectangularButtonView, BooleanRectangularStickyToggleButton );
} );
