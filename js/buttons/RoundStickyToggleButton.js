// Copyright 2002-2014, University of Colorado Boulder

/**
 * A round toggle button that switches the value of a property that can take on valueUp or valueDown.  It
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
  var RoundButtonView = require( 'SUN/buttons/RoundButtonView' );
  var StickyToggleButtonInteractionStateProperty = require( 'SUN/buttons/StickyToggleButtonInteractionStateProperty' );
  var StickyToggleButtonModel = require( 'SUN/buttons/StickyToggleButtonModel' );

  /**
   * @param valueUp {Object} value when the toggle is in the 'up' position
   * @param valueDown {Object} value when the toggle is in the 'down' position
   * @param property {Property<Object>} axon property that can be either valueUp or valueDown.
   * @param {Object} options
   * @constructor
   */
  function RoundStickyToggleButton( valueUp, valueDown, property, options ) {
    var buttonModel = new StickyToggleButtonModel( valueUp, valueDown, property );
    RoundButtonView.call( this, buttonModel, new StickyToggleButtonInteractionStateProperty( buttonModel ), options );
  }

  return inherit( RoundButtonView, RoundStickyToggleButton );
} );