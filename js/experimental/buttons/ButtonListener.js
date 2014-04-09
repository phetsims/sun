// Copyright 2002-2014, University of Colorado Boulder

/**
 * The ButtonListener is a scenery Input Listener that translates input events (down, up, enter, exit) into states in a ButtonModel.
 */
define( function( require ) {
  'use strict';

  var DownUpListener = require( 'SCENERY/input/DownUpListener' );
  var Property = require( 'AXON/Property' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {Object} options
   * @constructor
   */
  function ButtonListener( buttonModel, options ) {
    this.buttonModel = buttonModel;
    var self = this;
    options = _.extend( {
      fireOnDown: false
    }, options );

    // Track the pointer the is currently interacting with this button, ignore others.
    this.overPointer = null;
    this.downPointer = null;

    DownUpListener.call( this, {
        down: function( event, trail ) {
          if ( self.downPointer === null ) {
            self.downPointer = event.pointer;
          }
          if ( buttonModel.enabled && event.pointer === self.downPointer ) {
            buttonModel.down = true;
          }
        },

        up: function( event, trail ) {
          if ( buttonModel.enabled ) {
            buttonModel.down = false;
          }
          if ( event.pointer === self.downPointer ) {
            self.downPointer = null;
          }
        }
      }
    );

  }

  return inherit( DownUpListener, ButtonListener, {
    enter: function( event, trail ) {
      if ( this.overPointer === null ) {
        this.overPointer = event.pointer;
      }
      if ( this.buttonModel.enabled ) {
        if ( this.overPointer === event.pointer ) {
          this.buttonModel.over = true;
        }
      }
    },

    exit: function( event, trail ) {
      if ( event.pointer === this.overPointer ) {
        this.overPointer = null;
        if ( this.buttonModel.enabled ) {
          this.buttonModel.over = false;
        }
      }
    }} );
} );