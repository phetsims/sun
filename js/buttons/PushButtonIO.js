// Copyright 2017-2018, University of Colorado Boulder

/**
 * IO type for RoundPushButton|RectangularPushButton
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Emitter = require( 'AXON/Emitter' );
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );
  var sun = require( 'SUN/sun' );

  // ifphetio
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );

  /**
   * @param {RoundPushButton|RectangularPushButton} button
   * @param {string} phetioID
   * @constructor
   */
  function PushButtonIO( button, phetioID ) {
    NodeIO.call( this, button, phetioID );
    assert && assertInstanceOf( button, phet.sun.RoundPushButton, phet.sun.RectangularPushButton );

    var self = this;

    // guard against reentrant emitting, see https://github.com/phetsims/axon/issues/180
    var firing = false;

    var fireEmitter = new Emitter( {
      phetioReadOnly: button.phetioReadOnly,
      phetioState: false,

      tandem: button.tandem.createTandem( 'fireEmitter' ),
      phetioInstanceDocumentation: 'Emits when the button is fired'
    } );

    var emitListener = function() {

      if ( !firing ) {
        firing = true;
        fireEmitter.emit();
        firing = false;
      }
    };
    this.instance.addListener( emitListener );

    fireEmitter.addListener( function() {

      if ( !firing ) {
        firing = true;
        self.instance.buttonModel.fire();
        firing = false;
      }
    } );

    // @private
    this.disposePushButtonIO = function() {
      this.instance.removeListener( emitListener );
      fireEmitter.dispose();
    };
  }

  phetioInherit( NodeIO, 'PushButtonIO', PushButtonIO, {

    /**
     * @public
     */
    dispose: function() {
      this.disposePushButtonIO();
      NodeIO.prototype.dispose.call( this );
    }
  }, {
    documentation: 'A pressable button in the simulation',
    events: [ 'fired' ]
  } );

  sun.register( 'PushButtonIO', PushButtonIO );

  return PushButtonIO;
} );