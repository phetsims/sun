// Copyright 2002-2014, University of Colorado Boulder

/**
 * Model for a RadioButtonGroupMember in RadioButtonGroup. This model is designed to be used inside
 * RadioButtonGroupMember only, so there should be no need to use it outside of RadioButtonGroupMember.
 *
 * @author Aaron Davis
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ButtonModel = require( 'SUN/buttons/ButtonModel' );

  /**
   * @param {Property} selectorProperty - the property for the RadioButtonGroup that determines which button is selected
   * @param {object} selectedValue - the value that selectorProperty takes when this particular SingleRadioButton is selected
   * @param {object} [options] - options
   * @constructor
   */
  function RadioButtonGroupMemberModel( selectorProperty, selectedValue, options ) {
    ButtonModel.call( this );

    options = _.extend( {
      togetherID: null
    }, options );
    var thisModel = this;

    this.selectedValue = selectedValue;
    this.selectorProperty = selectorProperty;

    // fire on up
    this.property( 'down' ).onValue( false, function() {
      if ( thisModel.over && thisModel.enabled ) {
        var messageIndex = arch && arch.start( 'user', options && options.togetherID, 'fired' );
        selectorProperty.set( selectedValue );
        arch && arch.end( messageIndex );
      }
    } );
  }

  return inherit( ButtonModel, RadioButtonGroupMemberModel );
} );