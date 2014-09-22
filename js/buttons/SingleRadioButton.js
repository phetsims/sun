// Copyright 2002-2014, University of Colorado Boulder

/**
 * A single radio button. This class is designed to be part of a RadioButtonGroup and there should be no need to use it
 * outside of RadioButtonGroup. It is called SingleRadioButton to differentiate from RadioButton, which alreaduy exists.
 *
 * @author Aaron Davis
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RectangularButtonView = require( 'SUN/buttons/RectangularButtonView' );
  var StickyToggleButtonInteractionStateProperty = require( 'SUN/buttons/StickyToggleButtonInteractionStateProperty' );
  var RadioButtonModel = require( 'SUN/buttons/RadioButtonModel' );

  /**
   * @param value {Object} value when this radio button is selected
   * @param property {Property<Object>} axon property that can take on a set of values, one for each radio button in the
   * group
   * @param {Object} [options]
   * @constructor
   */
  function SingleRadioButton( value, property, options ) {
    var buttonModel = new RadioButtonModel( value, property );
    RectangularButtonView.call( this, buttonModel, new StickyToggleButtonInteractionStateProperty( buttonModel ), options );
  }

  return inherit( RectangularButtonView, SingleRadioButton );
} );