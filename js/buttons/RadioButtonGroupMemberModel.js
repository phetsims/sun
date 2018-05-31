// Copyright 2014-2017, University of Colorado Boulder

/**
 * Model for a RadioButtonGroupMember in RadioButtonGroup. This model is designed to be used inside
 * RadioButtonGroupMember only, so there should be no need to use it outside of RadioButtonGroupMember.
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonModel = require( 'SUN/buttons/ButtonModel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var sun = require( 'SUN/sun' );

  /**
   * @param {Property} selectorProperty - the property for the RadioButtonGroup that determines which button is selected
   * @param {Object} selectedValue - the value that selectorProperty takes when this particular SingleRadioButton is selected
   * @param {PhetioObject} phetioEventSource
   * @constructor
   */
  function RadioButtonGroupMemberModel( selectorProperty, selectedValue, phetioEventSource ) {

    ButtonModel.call( this );

    var self = this;

    this.selectedValue = selectedValue;
    this.selectorProperty = selectorProperty;

    // @public (read-only) - fire on up if the button is enabled, public for use in the accessibility tree
    this.fire = function() {
      if ( self.enabledProperty.get() ) {
        phetioEventSource.startEvent( 'user', 'fired', {
          value: selectorProperty.phetioType && selectorProperty.phetioType.elementType && selectorProperty.phetioType.elementType.toStateObject && selectorProperty.phetioType.elementType.toStateObject( selectedValue )
        } );
        selectorProperty.set( selectedValue );
        phetioEventSource.endEvent();
      }
    };
    this.downProperty.link( function( down ) {
      if ( !down && self.overProperty.get() ) {
        self.fire();
      }
    } );
  }

  sun.register( 'RadioButtonGroupMemberModel', RadioButtonGroupMemberModel );

  return inherit( ButtonModel, RadioButtonGroupMemberModel );
} );