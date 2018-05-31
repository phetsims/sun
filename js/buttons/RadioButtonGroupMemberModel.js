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

    // @private
    this.selectedValue = selectedValue;
    this.selectorProperty = selectorProperty;
    this.phetioEventSource = phetioEventSource;

    this.downProperty.link( function( down ) {
      if ( !down && self.overProperty.get() ) {
        self.fire();
      }
    } );
  }

  sun.register( 'RadioButtonGroupMemberModel', RadioButtonGroupMemberModel );

  return inherit( ButtonModel, RadioButtonGroupMemberModel, {

    /**
     * @public (read-only) - fire on up if the button is enabled, public for use in the accessibility tree
     */
    fire: function() {
      if ( this.enabledProperty.get() ) {
        this.phetioEventSource.startEvent( 'user', 'fired', {
          value: this.selectorProperty.phetioType &&
                 this.selectorProperty.phetioType.elementType &&
                 this.selectorProperty.phetioType.elementType.toStateObject &&
                 this.selectorProperty.phetioType.elementType.toStateObject( this.selectedValue )
        } );
        this.selectorProperty.set( this.selectedValue );
        this.phetioEventSource.endEvent();
      }
    }
  } );
} );