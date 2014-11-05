// Copyright 2002-2014, University of Colorado Boulder

/**
 * Model for a RadioButtonGroupMember in RadioButtonGroup.
 *
 * @author Aaron Davis
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ButtonModel = require( 'SUN/buttons/ButtonModel' );

  /**
   * @param {Property} selectorProperty the property for the RadioButtonGroup that determines which button is selected
   * @param {Object} selectedValue the value that selectorProperty takes when this particular SingleRadioButton is selected
   * @constructor
   */
  function RadioButtonGroupMemberModel( selectorProperty, selectedValue ) {
    ButtonModel.call( this );
    var thisModel = this;

    this.selectedValue = selectedValue;
    this.selectorProperty = selectorProperty;

    // fire on up
    this.property( 'down' ).onValue( false, function() {
      if ( thisModel.over && thisModel.enabled ) {
        selectorProperty.set( selectedValue );
      }
    } );
  }

  return inherit( ButtonModel, RadioButtonGroupMemberModel );
} );