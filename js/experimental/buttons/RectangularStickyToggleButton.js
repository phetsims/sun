// Copyright 2002-2014, University of Colorado Boulder

/**
 * RectangularStickyToggleButton is a sticky toggle button that takes one of two values: valueA or valueB and a Property that takes one of the two values.
 * Pressing the button toggles between valueA and valueB.
 *
 * @author John Blanco
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var BooleanRectangularStickyToggleButton = require( 'SUN/experimental/buttons/BooleanRectangularStickyToggleButton' );
  var ToggleProperty = require( 'AXON/ToggleProperty' );

  function RectangularStickyToggleButton( valueA, valueB, property, options ) {
    options = _.extend( {
      toggleOnDown: true
    }, options );

    BooleanRectangularStickyToggleButton.call( this, new ToggleProperty( valueA, valueB, property ), options );
  }

  return inherit( BooleanRectangularStickyToggleButton, RectangularStickyToggleButton );
} );
