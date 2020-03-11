// Copyright 2014-2020, University of Colorado Boulder

/**
 * An interactive round push button.  This is the file in which the appearance and behavior are brought together.
 *
 * This class inherits from RoundButtonView, which contains all of the
 * code that defines the button's appearance, and adds the button's behavior
 * by hooking up a button model.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import InstanceRegistry from '../../../phet-core/js/documentation/InstanceRegistry.js';
import inherit from '../../../phet-core/js/inherit.js';
import merge from '../../../phet-core/js/merge.js';
import pushButtonSoundPlayer from '../../../tambo/js/shared-sound-players/pushButtonSoundPlayer.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import PushButtonInteractionStateProperty from './PushButtonInteractionStateProperty.js';
import PushButtonModel from './PushButtonModel.js';
import RoundButtonView from './RoundButtonView.js';

/**
 * @param {Object} [options]
 * @constructor
 */
function RoundPushButton( options ) {

  options = merge( {

    // {Playable|null} - sound generator, if set to null defaults will be used, set to Playable.NO_SOUND to disable
    soundPlayer: null,

    // {function} listener called when button is pushed.
    listener: _.noop,

    // tandem support
    tandem: Tandem.REQUIRED
  }, options );

  const self = this;

  // Save the listener and add it after creating the button model. This is done so that
  // the same code path is always used for adding listener, thus guaranteeing a consistent code path if addListener is
  // overridden, see https://github.com/phetsims/sun/issues/284.
  const listener = options.listener;
  options = _.omit( options, [ 'listener' ] );

  // @public - listening only
  // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
  this.buttonModel = new PushButtonModel( options );
  RoundButtonView.call( this, this.buttonModel, new PushButtonInteractionStateProperty( this.buttonModel ), options );

  // add the listener that was potentially saved above
  this.addListener( listener );

  // sound generation
  const soundPlayer = options.soundPlayer || pushButtonSoundPlayer;
  const playSound = () => { soundPlayer.play(); };
  this.buttonModel.produceSoundEmitter.addListener( playSound );

  // dispose function
  this.disposeRoundPushButton = function() {
    this.buttonModel.produceSoundEmitter.removeListener( playSound );
    self.buttonModel.dispose();
  };

  // support for binder documentation, stripped out in builds and only runs when ?binder is specified
  assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'RoundPushButton', this );
}

sun.register( 'RoundPushButton', RoundPushButton );

inherit( RoundButtonView, RoundPushButton, {

  // @public
  dispose: function() {

    // The order of operations here is important - the view needs to be disposed first so that it is unhooked from
    // the model before the model is disposed.  If the model is disposed first, the view ends up trying to change some
    // of its property values when it is disposed.  See https://github.com/phetsims/axon/issues/242.
    RoundButtonView.prototype.dispose.call( this );
    this.disposeRoundPushButton();
  },

  // @public
  addListener: function( listener ) {
    this.buttonModel.addListener( listener );
  },

  // @public
  removeListener: function( listener ) {
    this.buttonModel.removeListener( listener );
  }
} );

export default RoundPushButton;