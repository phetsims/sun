// Copyright 2014-2022, University of Colorado Boulder

/**
 * RectangularPushButton is a rectangular push button, used to initiate some action.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import InstanceRegistry from '../../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../../phet-core/js/optionize.js';
import pushButtonSoundPlayer from '../../../tambo/js/shared-sound-players/pushButtonSoundPlayer.js';
import ISoundPlayer from '../../../tambo/js/ISoundPlayer.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import PushButtonInteractionStateProperty from './PushButtonInteractionStateProperty.js';
import PushButtonModel, { PushButtonModelOptions } from './PushButtonModel.js';
import RectangularButton, { RectangularButtonOptions } from './RectangularButton.js';

type SelfOptions = {
  soundPlayer?: ISoundPlayer;
  listener?: () => void;
};

// NOTE: Let's not create PushButtonModel with these options?
export type RectangularPushButtonOptions = SelfOptions & RectangularButtonOptions & PushButtonModelOptions;

class RectangularPushButton extends RectangularButton {

  // So we have a more accurate subtyped field
  private pushButtonModel: PushButtonModel;

  private disposeRectangularPushButton: () => void;

  constructor( providedOptions?: RectangularPushButtonOptions ) {

    const options = optionize<RectangularPushButtonOptions, SelfOptions, RectangularButtonOptions>( {
      soundPlayer: pushButtonSoundPlayer,
      listener: _.noop,
      tandem: Tandem.REQUIRED
    }, providedOptions );

    // Save the listener and add it after creating the button model.  This is done so that
    // the same code path is always used for adding listener, thus guaranteeing a consistent code path if addListener is
    // overridden, see https://github.com/phetsims/sun/issues/284.
    const listener = options.listener;
    const superOptions = _.omit( options, [ 'listener' ] );

    // Safe to pass through options to the PushButtonModel like "fireOnDown".  Other scenery options will be safely ignored.
    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    const buttonModel = new PushButtonModel( superOptions ); // @public, listen only

    super( buttonModel, new PushButtonInteractionStateProperty( buttonModel ), superOptions );

    this.pushButtonModel = buttonModel;

    // add the listener that was potentially saved above
    listener && this.addListener( listener );

    // sound generation
    const playSound = () => { options.soundPlayer.play(); };
    buttonModel.produceSoundEmitter.addListener( playSound );

    // @private
    this.disposeRectangularPushButton = function() {
      buttonModel.produceSoundEmitter.removeListener( playSound );
      buttonModel.dispose(); //TODO this fails when assertions are enabled, see sun#212
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    // @ts-ignore chipper query parameters
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'RectangularPushButton', this );
  }

  dispose() {

    // The order of operations here is important - the view needs to be disposed first so that it is unhooked from
    // the model before the model is disposed.  If the model is disposed first, the view ends up trying to change some
    // of its Property values when it is disposed.  See https://github.com/phetsims/axon/issues/242.
    super.dispose();
    this.disposeRectangularPushButton();
  }

  /**
   * Adds a listener that will be notified when the button fires.
   */
  addListener( listener: () => void ) {
    this.pushButtonModel.addListener( listener );
  }

  /**
   * Removes a listener.
   */
  removeListener( listener: () => void ) {
    this.pushButtonModel.removeListener( listener );
  }
}

sun.register( 'RectangularPushButton', RectangularPushButton );
export default RectangularPushButton;