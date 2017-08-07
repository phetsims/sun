// Copyright 2015, University of Colorado Boulder

/**
 * Model for a momentary button: on when pressed, off when released.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ButtonModel = require( 'SUN/buttons/ButtonModel' );
  var Emitter = require( 'AXON/Emitter' );
  var sun = require( 'SUN/sun' );

  /**
   * @param {Object} valueOff - value when the button is in the off state
   * @param {Object} valueOn - value when the button is in the on state
   * @param {Property} valueProperty
   * @constructor
   */
  function MomentaryButtonModel( valueOff, valueOn, valueProperty ) {

    var self = this;
    ButtonModel.call( self );

    // phet-io support
    this.startedCallbacksForPressedEmitter = new Emitter( { indicateCallbacks: false } );
    this.endedCallbacksForPressedEmitter = new Emitter( { indicateCallbacks: false } );
    this.startedCallbacksForReleasedEmitter = new Emitter( { indicateCallbacks: false } );
    this.endedCallbacksForReleasedEmitter = new Emitter( { indicateCallbacks: false } );
    this.startedCallbacksForReleasedByDisableEmitter = new Emitter( { indicateCallbacks: false } );
    this.endedCallbacksForReleasedByDisableEmitter = new Emitter( { indicateCallbacks: false } );

    // sync with the property, do this before wiring up to supertype properties
    var onObserver = function( value ) {
      self.downProperty.set( value === valueOn );
    };
    valueProperty.link( onObserver );

    var downListener = function( down ) {

      // turn on when pressed (if enabled)
      if ( down ) {
        if ( self.enabledProperty.get() ) {
          self.startedCallbacksForPressedEmitter.emit();
          valueProperty.set( valueOn );
          self.endedCallbacksForPressedEmitter.emit();
        }
      }
      else {
        // turn off when released
        self.startedCallbacksForReleasedEmitter.emit();
        valueProperty.set( valueOff );
        self.endedCallbacksForReleasedEmitter.emit();
      }
    };
    this.downProperty.lazyLink( downListener );

    // turn off when disabled
    var enabledListener = function( enabled ) {
      if ( !enabled ){
        self.startedCallbacksForReleasedByDisableEmitter.emit();
        valueProperty.set( valueOff );
        self.endedCallbacksForReleasedByDisableEmitter.emit();
      }
    };
    this.enabledProperty.link( enabledListener );

    // @private: just for dispose.  Named based on the type name so it won't have a name collision with parent/child ones
    this.disposeMomentaryButtonModel = function() {
      self.enabledProperty.unlink( enabledListener );
      self.downProperty.unlink( downListener );
      valueProperty.unlink( onObserver );
    };
  }

  sun.register( 'MomentaryButtonModel', MomentaryButtonModel );

  return inherit( ButtonModel, MomentaryButtonModel, {

    // @public - Ensures that this model is eligible for GC.
    dispose: function() {
      this.disposeMomentaryButtonModel();
      ButtonModel.prototype.dispose.call( this ); //TODO fails with assertions enabled, see sun#212
    }
  } );
} );