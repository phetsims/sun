// Copyright 2002-2014, University of Colorado Boulder

/**
 * Model for a toggle button that sticks when pushed down and pops up when pushed a second time.
 * Unlike other general sun models, 'sticky' implies a specific type of user-interface component,
 * a button that is either popped up or pressed down.
 *
 * @author Sam Reid
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ButtonModel = require( 'SUN/buttons/ButtonModel' );

  /**
   * @param {Object} valueUp value when the toggle is in the 'up' position
   * @param {Object} valueDown value when the toggle is in the 'down' position
   * @param {Property} valueProperty axon property that can be either valueUp or valueDown.  Would have preferred to call this `property` but it would clash with the property function name.
   * @param {object} [options]
   * @constructor
   */
  function StickyToggleButtonModel( valueUp, valueDown, valueProperty, options ) {
    var thisModel = this;

    options = _.extend( { componentID: null }, options );
    this.componentID = options.componentID;

    this.valueUp = valueUp;
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
        if ( down && valueProperty.value === valueUp ) {
          thisModel.toggle();
          thisModel.pressedWhileDown = false;
        }
        if ( !down && valueProperty.value === valueDown ) {
          if ( thisModel.pressedWhileDown ) {
            thisModel.toggle();
          }
          else {
            thisModel.pressedWhileDown = true;
          }
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

  return inherit( ButtonModel, StickyToggleButtonModel, {
    toggle: function() {
      assert && assert( this.valueProperty.value === this.valueUp || this.valueProperty.value === this.valueDown );
      var archID = arch && arch.start( 'user', this.componentID, 'fire' );
      if ( this.valueProperty.value === this.valueUp ) {
        this.valueProperty.value = this.valueDown;
      }
      else {
        this.valueProperty.value = this.valueUp;
      }
      arch && arch.end( archID );
    }
  } );
} );