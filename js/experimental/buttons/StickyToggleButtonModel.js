// Copyright 2002-2014, University of Colorado Boulder

/**
 * Model for a toggle button that sticks when pushed down and pops up when
 * pushed a second time.
 *
 * @author Sam Reid
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ButtonModel = require( 'SUN/experimental/buttons/ButtonModel' );

  /**
   * @param {Property<Boolean>} toggledProperty the property that represents the model state of whether the button
   * (and corresponding model domain feature) is toggled or not.
   * @constructor
   */
  function StickyToggleButtonModel( toggledProperty ) {
    var thisModel = this;

    this.toggledProperty = toggledProperty;

    ButtonModel.call( this );

    // When the user releases the toggle button, it should only fire a
    // toggle event if it is not during the same action in which they
    // pressed the button.  Track the state to see if they have already
    // pushed the button.
    // Note: Does this need to be reset when the simulation does "reset
    // all"?  I (sreid) can't find any negative consequences in the user
    // interface of not resetting it, but maybe I missed something. Or maybe
    // it would be safe to reset it anyway.
    this.addProperty( 'readyToToggleUp', false );

    // Create the "interactionState" which is generally used to determine how to render the button
    this.addDerivedProperty( 'interactionState', ['over', 'down', 'enabled', 'toggled'], function( over, down, enabled, toggled ) {
      return !enabled && toggled ? 'disabled-pressed' :
             !enabled ? 'disabled' :
             over && !(down || toggled) ? 'over' :
             over && (down || toggled) ? 'pressed' :
             toggled ? 'pressed' :
             'idle';
    } );

    // If the button is untoggled and the user presses it, show it pressed and
    // toggle the state right away.  When the button is released, untoggle the
    // state (unless it was part of the same action that toggled the button
    // down in the first place).
    this.property( 'down' ).link( function( down ) {
      if ( thisModel.enabled && thisModel.over ) {
        if ( down && !thisModel.toggled ) {
          thisModel.toggledProperty.toggle();
          thisModel.readyToToggleUp = false;
        }
        if ( !down && thisModel.toggled ) {
          if ( thisModel.readyToToggleUp ) {
            thisModel.toggledProperty.toggle();
          }
          else {
            thisModel.readyToToggleUp = true;
          }
        }
      }

      //Handle the case where the pointer moved out then up over a toggle button, so it will respond to the next press
      if ( !down && !thisModel.over ) {
        thisModel.readyToToggleUp = true;
      }
    } );

    //Make the button ready to toggle when enabled
    this.property( 'enabled' ).onValue( true, function() {
      thisModel.readyToToggleUp = true;
    } );
  }

  return inherit( ButtonModel, StickyToggleButtonModel, {
    set toggled( t ) { this.toggledProperty.value = t; },

    get toggled() {return this.toggledProperty.value;}
  } );
} );