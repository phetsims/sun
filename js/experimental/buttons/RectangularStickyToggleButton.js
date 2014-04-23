// Copyright 2002-2014, University of Colorado Boulder

/**
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RectangularButtonView = require( 'SUN/experimental/buttons/RectangularButtonView' );
  var StickyToggleButtonModel = require( 'SUN/experimental/buttons/StickyToggleButtonModel' );
  var ButtonListener = require( 'SUN/experimental/buttons/ButtonListener' );

  function RectangularStickyToggleButton( booleanProperty, options ) {
    this.booleanProperty = booleanProperty;
    options = _.extend( {
      toggleOnDown: true
    }, options );

    this.buttonModel = new StickyToggleButtonModel( booleanProperty );
    RectangularButtonView.call( this, this.buttonModel, options );
    this.addInputListener( new ButtonListener( this.buttonModel ) );
  }

  return inherit( RectangularButtonView, RectangularStickyToggleButton );
} );
