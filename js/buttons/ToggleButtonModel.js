// Copyright 2014-2019, University of Colorado Boulder

/**
 * Model for a toggle button that changes value on each "up" event when the button is released.
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
  var PhetioObject = require( 'TANDEM/PhetioObject' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );

  /**
   * @param {Object} valueOff - value when the button is in the off state
   * @param {Object} valueOn - value when the button is in the on state
   * @param {Property} property - axon Property that can be either valueOff or valueOn.
   * @param {Object} [options]
   * @constructor
   */
  function ToggleButtonModel( valueOff, valueOn, property, options ) {
    var self = this;

    options = _.extend( {
      tandem: Tandem.required
    }, options );

    // @private
    this.valueOff = valueOff;
    this.valueOn = valueOn;
    this.valueProperty = property;

    ButtonModel.call( this, options );

    // Behaves like a push button (with fireOnDown:false), but toggles its state when the button is released.
    var downListener = function( down ) {
      if ( self.enabledProperty.get() && self.overProperty.get() ) {
        if ( !down ) {
          self.toggle();
        }
      }
    };
    this.downProperty.link( downListener ); // @private

    // @private
    this.toggledEmitter = new Emitter( {
      tandem: options.tandem.createTandem( 'toggledEmitter' ),
      phetioDocumentation: 'Emits when the button is toggled',
      phetioEventType: PhetioObject.EventType.USER
    } );

    var toggleListener = function() {
      assert && assert( self.valueProperty.value === self.valueOff || self.valueProperty.value === self.valueOn,
        'unrecognized value: ' + self.valueProperty.value );

      self.valueProperty.value = self.valueProperty.value === self.valueOff ? self.valueOn : self.valueOff;
    };
    this.toggledEmitter.addListener( toggleListener );

    // @private - dispose items specific to this instance
    this.disposeToggleButtonModel = function() {
      self.downProperty.unlink( downListener );
      self.toggledEmitter.removeListener( toggleListener );
    };
  }

  sun.register( 'ToggleButtonModel', ToggleButtonModel );

  return inherit( ButtonModel, ToggleButtonModel, {

    // @public
    dispose: function() {
      this.disposeToggleButtonModel();
      ButtonModel.prototype.dispose.call( this );
    },

    // @public
    toggle: function() {
      this.toggledEmitter.emit();
    }
  } );
} );