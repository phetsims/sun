// Copyright 2002-2014, University of Colorado Boulder

/**
 * Basic model for a toggle button, intended to be added as an input listener
 * to any Scenery node in order to allow it to behave as a button.
 *
 * IMPORTANT USAGE NOTES:
 * - The node to which this is added should not be made non-pickable when
 *   the disabled state is entered, or subsequent states may not be correct.
 * - Generally speaking, only one of these should be added to a given node.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  var ButtonModel = require( 'SUN/experimental/buttons/ButtonModel' );
  var Property = require( 'AXON/Property' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {Property} booleanProperty
   * @param {Object} options
   * @constructor
   */
  function ToggleButtonModel( booleanProperty, options ) {
    var self = this;
    options = _.extend(
      {
        toggleOnDown: true
      }, options );

    // Property that keeps track of whether the button is up (untoggled) or down (toggled)
    this.toggledProperty = new Property( false );

    ButtonModel.call( this, {

      down: function( event, trail ) {
        if ( self.downPointer === null ) {
          self.downPointer = event.pointer;
        }
        if ( self.buttonEnabled && event.pointer === self.downPointer ) {
          if ( options.toggleOnDown ) {
            self.interactionState.value = 'pressed';
            self.toggledProperty.toggle();
            booleanProperty.toggle();
          }
        }
      },

      up: function( event, trail ) {
        if ( self.buttonEnabled ) {
          if ( self.overPointer === event.pointer ) {
            self.interactionState.value = self.toggledProperty.value ? 'pressed' : 'over';
            if ( !options.toggleOnDown && self.downPointer === event.pointer ) {
              // Toggle the model
              booleanProperty.toggle();
              self.toggledProperty.toggle();
            }
          }
        }
        if ( event.pointer === self.downPointer ) {
          self.downPointer = null;
        }
      }
    } );
  }

  return inherit( ButtonModel, ToggleButtonModel, {

    //Overrides parent implementation
    enter: function( event, trail ) {
      if ( this.overPointer === null ) {
        this.overPointer = event.pointer;
      }
      if ( this.buttonEnabled ) {
        if ( this.overPointer === event.pointer ) {

          if ( !this.toggledProperty.value ) {
            this.interactionState.value = this.downPointer === event.pointer ? 'pressed' : 'over';
          }
        }
      }
    },

    //Overrides parent implementation
    exit: function( event, trail ) {
      if ( event.pointer === this.overPointer ) {
        this.overPointer = null;
        if ( this.buttonEnabled && !this.toggledProperty.value ) {
          this.interactionState.value = 'idle';
        }
      }
    },

    // Overrides parent implementation so that disabled can be handled a little differently
    set enabled( value ) {
      if ( this.buttonEnabled !== value ) {
        this.buttonEnabled = value;

        if ( !value ) {
          this.interactionState.value = this.interactionState.value === 'pressed' ? 'disabled-pressed' : 'disabled';
        }
        else {
          if ( this.overPointer === null ) {
            this.interactionState.value = this.interactionState.value === 'disabled-pressed' ? 'pressed' : 'idle';
          }
          else {
            this.interactionState.value = this.downPointer === null ? 'over' : 'pressed';
          }
        }
      }
    },

    // Have to override getter if setter overridden, else lint complains
    get enabled() { return this.buttonEnabled; }

  } );
} );