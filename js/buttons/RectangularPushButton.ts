// Copyright 2014-2022, University of Colorado Boulder

/**
 * RectangularPushButton is a rectangular push button, used to initiate some action.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import InstanceRegistry from '../../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../../phet-core/js/optionize.js';
import pushButtonSoundPlayer from '../../../tambo/js/shared-sound-players/pushButtonSoundPlayer.js';
import TSoundPlayer from '../../../tambo/js/TSoundPlayer.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import PushButtonInteractionStateProperty from './PushButtonInteractionStateProperty.js';
import PushButtonModel, { PushButtonListener, PushButtonModelOptions } from './PushButtonModel.js';
import RectangularButton, { RectangularButtonOptions } from './RectangularButton.js';

type SelfOptions = {
  soundPlayer?: TSoundPlayer;
};

//TODO https://github.com/phetsims/sun/issues/749 Let's not create PushButtonModel with these options?
type SuperOptions = RectangularButtonOptions & PushButtonModelOptions;

export type RectangularPushButtonOptions = SelfOptions & SuperOptions;

export default class RectangularPushButton extends RectangularButton {

  // RectangularButton has this.buttonModel, but we also need this.pushButtonModel, because it has additional methods
  protected readonly pushButtonModel: PushButtonModel;

  private readonly disposeRectangularPushButton: () => void;

  public constructor( providedOptions?: RectangularPushButtonOptions ) {

    const options = optionize<RectangularPushButtonOptions, SelfOptions, SuperOptions>()( {
      soundPlayer: pushButtonSoundPlayer,
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'Button'
    }, providedOptions );

    // Save the listener and add it after creating the button model.  This is done so that
    // the same code path is always used for adding listener, thus guaranteeing a consistent code path if addListener is
    // overridden, see https://github.com/phetsims/sun/issues/284.
    const listener = options.listener;
    const superOptions = _.omit( options, [ 'listener' ] );

    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    //TODO https://github.com/phetsims/sun/issues/749 its surprising that we can pass superOptions with irrelevant fields to PushButtonModel without TS errors
    const pushButtonModel = new PushButtonModel( superOptions );

    super( pushButtonModel, new PushButtonInteractionStateProperty( pushButtonModel ), superOptions );

    this.pushButtonModel = pushButtonModel;

    // add the listener that was potentially saved above
    listener && this.addListener( listener );

    // sound generation
    const playSound = () => { options.soundPlayer.play(); };
    pushButtonModel.produceSoundEmitter.addListener( playSound );

    this.disposeRectangularPushButton = function() {
      pushButtonModel.produceSoundEmitter.removeListener( playSound );
      pushButtonModel.dispose(); //TODO this fails when assertions are enabled, see sun#212
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'RectangularPushButton', this );
  }

  public override dispose(): void {

    // The order of operations here is important - the view needs to be disposed first so that it is unhooked from
    // the model before the model is disposed.  If the model is disposed first, the view ends up trying to change some
    // of its Property values when it is disposed.  See https://github.com/phetsims/axon/issues/242.
    super.dispose();
    this.disposeRectangularPushButton();
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

sun.register( 'RectangularPushButton', RectangularPushButton );
