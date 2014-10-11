// Copyright 2002-2014, University of Colorado Boulder

/**
 * A single radio button. This class is designed to be part of a RadioButtonGroup and there should be no need to use it
 * outside of RadioButtonGroup. It is called SingleRadioButton to differentiate from RadioButton, which already exists.
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
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  /**
   * @param {Object} value value when this radio button is selected
   * @param {Property} property axon property that can take on a set of values, one for each radio button in the group
   * @param {Object} [options]
   * @constructor
   */
  function SingleRadioButton( value, property, options ) {
    var buttonModel = new RadioButtonModel( value, property );

    // keep a reference to this property to be used in RadioButtonGroup for managing the labels
    this.interactionStateProperty = new StickyToggleButtonInteractionStateProperty( buttonModel );

    RectangularButtonView.call( this, buttonModel, this.interactionStateProperty, options );

    // ensure the buttons don't resize when selected vs unselected by adding a rectangle with the max size
    var maxLineWidth = Math.max( options.selectedLineWidth, options.deselectedLineWidth );
    var maxWidth = maxLineWidth + options.content.width + options.xMargin * 2;
    var maxHeight = maxLineWidth + options.content.height + options.yMargin * 2;
    var extraWidth = new Rectangle( 0, 0, maxWidth, maxHeight,
      {
        fill: 'rgba(0,0,0,0)',
        center: this.center
      } );
    this.addChild( extraWidth );
  }

  return inherit( RectangularButtonView, SingleRadioButton );
} );