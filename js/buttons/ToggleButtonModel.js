// Copyright 2014-2017, University of Colorado Boulder

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
  var inherit = require( 'PHET_CORE/inherit' );
  var phetioEvents = require( 'ifphetio!PHET_IO/phetioEvents' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );
  var ToggleButtonIO = require( 'SUN/buttons/ToggleButtonIO' );

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
    this.toggleButtonModelTandem = options.tandem;

    // @private
    this.valueOff = valueOff;
    this.valueOn = valueOn;
    this.valueProperty = property;

    ButtonModel.call( this );

    // Behaves like a push button (with fireOnDown:false), but toggles its state when the button is released.
    var downListener = function( down ) {
      if ( self.enabledProperty.get() && self.overProperty.get() ) {
        if ( !down ) {
          self.toggle();
        }
      }
    };
    this.downProperty.link( downListener ); // @private

    // @private - dispose items specific to this instance
    this.disposeToggleButtonModel = function() {
      self.downProperty.unlink( downListener );
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
      assert && assert( this.valueProperty.value === this.valueOff || this.valueProperty.value === this.valueOn );
      var oldValue = this.valueProperty.value;
      var newValue = this.valueProperty.value === this.valueOff ? this.valueOn : this.valueOff;
      var hasToStateObject = this.valueProperty.phetioType && this.valueProperty.phetioType.elementType && this.valueProperty.phetioType.elementType.toStateObject;
      var id = phetioEvents.start( 'user', this.toggleButtonModelTandem.id, ToggleButtonIO, 'toggled', {
        oldValue: hasToStateObject && this.valueProperty.phetioType.elementType.toStateObject( oldValue ),
        newValue: hasToStateObject && this.valueProperty.phetioType.elementType.toStateObject( newValue )
      } );
      this.valueProperty.value = newValue;
      phetioEvents.end( id );
    }
  } );
} );