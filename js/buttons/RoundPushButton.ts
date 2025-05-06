// Copyright 2014-2025, University of Colorado Boulder

/**
 * RoundPushButton is a round push button, used to initiate some action.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import InstanceRegistry from '../../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../../phet-core/js/optionize.js';
import sharedSoundPlayers from '../../../tambo/js/sharedSoundPlayers.js';
import type TSoundPlayer from '../../../tambo/js/TSoundPlayer.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import PushButtonInteractionStateProperty from './PushButtonInteractionStateProperty.js';
import PushButtonModel, { type PushButtonListener, type PushButtonModelOptions } from './PushButtonModel.js';
import RoundButton, { type RoundButtonOptions } from './RoundButton.js';

type SelfOptions = {
  soundPlayer?: TSoundPlayer;
};

//TODO https://github.com/phetsims/sun/issues/749 Do not propagate providedOptions to both super() and PushButtonModel
type SuperOptions = RoundButtonOptions & PushButtonModelOptions;

export type RoundPushButtonOptions = SelfOptions & SuperOptions;

export default class RoundPushButton extends RoundButton {

  // RoundButton has this.buttonModel, but we also need this.pushButtonModel, because it has additional methods
  protected readonly pushButtonModel: PushButtonModel;

  private readonly disposeRoundPushButton: () => void;

  public constructor( providedOptions?: RoundPushButtonOptions ) {

    const options = optionize<RoundPushButtonOptions, SelfOptions, SuperOptions>()( {
      soundPlayer: sharedSoundPlayers.get( 'pushButton' ),
      tandem: Tandem.REQUIRED,
      listenerOptions: {
        tandem: Tandem.OPT_OUT // PushButtonModel provides a firedEmitter which is sufficient
      }
    }, providedOptions );

    // Save the listener and add it after creating the button model. This is done so that
    // the same code path is always used for adding listener, thus guaranteeing a consistent code path if addListener is
    // overridden, see https://github.com/phetsims/sun/issues/284.
    const listener = options.listener;
    const superOptions = _.omit( options, [ 'listener' ] );

    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    //TODO https://github.com/phetsims/sun/issues/749 Do not propagate providedOptions to both super() and PushButtonModel
    const pushButtonModel = new PushButtonModel( superOptions );

    super( pushButtonModel, new PushButtonInteractionStateProperty( pushButtonModel ), superOptions );

    this.pushButtonModel = pushButtonModel;

    // add the listener that was potentially saved above
    listener && this.addListener( listener );

    // sound generation
    const playSound = () => { options.soundPlayer.play(); };
    pushButtonModel.fireCompleteEmitter.addListener( playSound );

    this.disposeRoundPushButton = () => {
      pushButtonModel.fireCompleteEmitter.removeListener( playSound );
      pushButtonModel.dispose();
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && window.phet?.chipper?.queryParameters?.binder && InstanceRegistry.registerDataURL( 'sun', 'RoundPushButton', this );
  }

  public override dispose(): void {

    // The order of operations here is important - the view needs to be disposed first so that it is unhooked from
    // the model before the model is disposed.  If the model is disposed first, the view ends up trying to change some
    // of its Property values when it is disposed.  See https://github.com/phetsims/axon/issues/242.
    super.dispose();
    this.disposeRoundPushButton();
  }

  /**
   * Adds a listener that will be notified when the button fires.
   */
  public addListener( listener: PushButtonListener ): void {
    this.pushButtonModel.addListener( listener );
  }

  /**
   * Removes a listener.
   */
  public removeListener( listener: PushButtonListener ): void {
    this.pushButtonModel.removeListener( listener );
  }
}

sun.register( 'RoundPushButton', RoundPushButton );