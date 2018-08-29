// Copyright 2015-2017, University of Colorado Boulder

/**
 * Model for a momentary button: on when pressed, off when released.
 *
 * @author Chris Malley (PixelZoom, Inc.)
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
   * @param {Property} valueProperty
   * @param {Object} [options]
   * @constructor
   */
  function MomentaryButtonModel( valueOff, valueOn, valueProperty, options ) {
    var self = this;

    // Tandem support
    options = _.extend( {
      tandem: Tandem.required,
      phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly // to support properly passing this to children, see https://github.com/phetsims/tandem/issues/60
    }, options );

    ButtonModel.call( self, options );

    // @private
    this.pressedEmitter = new Emitter( {
      tandem: options.tandem.createTandem( 'momentaryPressedEmitter' ),
        phetioInstanceDocumentation: 'Emits when the button is pressed',
        phetioReadOnly: options.phetioReadOnly
      }
    );

    // @private
    this.releasedEmitter = new Emitter( {
      tandem: options.tandem.createTandem( 'momentaryReleasedEmitter' ),
        phetioInstanceDocumentation: 'Emits when the button is released',
        phetioReadOnly: options.phetioReadOnly
      }
    );

    // add listeners
    var setValueOn = function() {
      valueProperty.set( valueOn );
    };
    this.pressedEmitter.addListener( setValueOn );

    var setValueOff = function() {
      valueProperty.set( valueOff );
    };
    this.releasedEmitter.addListener( setValueOff );

    var downListener = function( down ) {

      // turn on when pressed (if enabled)
      if ( down ) {
        if ( self.enabledProperty.get() ) {
          self.pressedEmitter.emit();
        }
      }
      else {
        self.releasedEmitter.emit();
      }
    };
    this.downProperty.lazyLink( downListener );

    // @private: just for dispose.  Named based on the type name so it won't have a name collision with parent/child ones
    this.disposeMomentaryButtonModel = function() {
      self.downProperty.unlink( downListener );
      this.pressedEmitter.removeListener( setValueOn );
      this.releasedEmitter.removeListener( setValueOff );
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