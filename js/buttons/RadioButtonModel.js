// Copyright 2002-2014, University of Colorado Boulder

/**
 * Model for a SingleRadioButton in RadioButtonGroup. This file is very similar to StickyToggleButtonModel
 *
 * @author Aaron Davis
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ButtonModel = require( 'SUN/buttons/ButtonModel' );

  /**
   * @param {Object} valueDown the value that valueProperty takes when this particular SingleRadioButton is selected
   * @param {Property} valueProperty
   * @constructor
   */
  function RadioButtonModel( valueDown, valueProperty ) {
    var thisModel = this;

    // save these references for use in StickyToggleButtonInteractionStateProperty
    this.valueDown = valueDown;
    this.valueProperty = valueProperty;

    ButtonModel.call( this );

    // When the user releases the toggle button, it should only fire an event
    // if it is not during the same action in which they
    // pressed the button.  Track the state to see if they have already
    // pushed the button.
    // Note: Does this need to be reset when the simulation does "reset
    // all"?  I (Sam Reid) can't find any negative consequences in the user
    // interface of not resetting it, but maybe I missed something. Or maybe
    // it would be safe to reset it anyway.
    this.addProperty( 'pressedWhileDown', false );

    // If the button is up and the user presses it, show it pressed and
    // toggle the state right away.  When the button is released, pop up the button
    // (unless it was part of the same action that pressed the button
    // down in the first place).
    this.property( 'down' ).link( function( down ) {
      if ( thisModel.enabled && thisModel.over ) {
        if ( !down && valueProperty.value === valueDown ) {
          if ( thisModel.pressedWhileDown ) {
            valueProperty.set( valueDown );
          }
          else {
            thisModel.pressedWhileDown = true;
          }
        }
        else {
          valueProperty.set( valueDown );
          thisModel.pressedWhileDown = false;
        }
      }

      //Handle the case where the pointer moved out then up over a toggle button, so it will respond to the next press
      if ( !down && !thisModel.over ) {
        thisModel.pressedWhileDown = true;
      }
    } );

    //Make the button ready to toggle when enabled
    this.property( 'enabled' ).onValue( true, function() {
      thisModel.pressedWhileDown = true;
    } );
  }

  return inherit( ButtonModel, RadioButtonModel );
} );