// Copyright 2014-2015, University of Colorado Boulder

/**
 * Model for a toggle button that sticks when pushed down and pops up when pushed a second time. Unlike other general
 * sun models, 'sticky' implies a specific type of user-interface component, a button that is either popped up or
 * pressed down.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonModel = require( 'SUN/buttons/ButtonModel' );
  var Emitter = require( 'AXON/Emitter' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var sun = require( 'SUN/sun' );

  /**
   * @param {Object} valueUp value when the toggle is in the 'up' position
   * @param {Object} valueDown value when the toggle is in the 'down' position
   * @param {Property} valueProperty axon property that can be either valueUp or valueDown.  Would have preferred to call this `property` but it would clash with the property function name.
   * @constructor
   */
  function StickyToggleButtonModel( valueUp, valueDown, valueProperty ) {
    var self = this;

    // @private
    this.valueUp = valueUp;
    this.valueDown = valueDown;
    this.valueProperty = valueProperty;

    ButtonModel.call( this );

    // phet-io support
    this.startedCallbacksForToggledEmitter = new Emitter( { indicateCallbacks: false } );
    this.endedCallbacksForToggledEmitter = new Emitter( { indicateCallbacks: false } );

    // When the user releases the toggle button, it should only fire an event if it is not during the same action in
    // which they pressed the button.  Track the state to see if they have already pushed the button.
    //
    // Note: Does this need to be reset when the simulation does "reset all"?  I (Sam Reid) can't find any negative
    // consequences in the user interface of not resetting it, but maybe I missed something. Or maybe it would be safe
    // to reset it anyway.
    this.pressedWhileDownProperty = new Property( false ); // @private

    // If the button is up and the user presses it, show it pressed and toggle the state right away.  When the button is
    // released, pop up the button (unless it was part of the same action that pressed the button down in the first
    // place).
    this.downProperty.link( function( down ) {
      if ( self.enabledProperty.get() && self.overProperty.get() ) {
        if ( down && valueProperty.value === valueUp ) {
          self.toggle();
          self.pressedWhileDownProperty.set( false );
        }
        if ( !down && valueProperty.value === valueDown ) {
          if ( self.pressedWhileDownProperty.get() ) {
            self.toggle();
          }
          else {
            self.pressedWhileDownProperty.set( true );
          }
        }
      }

      //Handle the case where the pointer moved out then up over a toggle button, so it will respond to the next press
      if ( !down && !self.overProperty.get() ) {
        self.pressedWhileDownProperty.set( true );
      }
    } );

    // make the button ready to toggle when enabled
    this.enabledProperty.onValue( true, function() {
      self.pressedWhileDownProperty.set( true );
    } );
  }

  sun.register( 'StickyToggleButtonModel', StickyToggleButtonModel );

  return inherit( ButtonModel, StickyToggleButtonModel, {

    // @public
    toggle: function() {
      assert && assert( this.valueProperty.value === this.valueUp || this.valueProperty.value === this.valueDown );
      var newValue = this.valueProperty.value === this.valueUp ? this.valueDown : this.valueUp;
      this.startedCallbacksForToggledEmitter.emit2( this.valueProperty.value, newValue );
      this.valueProperty.value = newValue;
      this.endedCallbacksForToggledEmitter.emit();
    }
  } );
} );