// Copyright 2015-2022, University of Colorado Boulder

/**
 * Model for a momentary button: on when pressed, off when released.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import TProperty from '../../../axon/js/TProperty.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import ButtonModel, { ButtonModelOptions } from './ButtonModel.js';

type SelfOptions = EmptySelfOptions;

export type MomentaryButtonModelOptions = SelfOptions & ButtonModelOptions;

export default class MomentaryButtonModel<T> extends ButtonModel {

  private readonly disposeMomentaryButtonModel: () => void;

  /**
   * @param valueOff - value when the button is in the off state
   * @param valueOn - value when the button is in the on state
   * @param valueProperty
   * @param [providedOptions]
   */
  public constructor( valueOff: T, valueOn: T, valueProperty: TProperty<T>, providedOptions?: MomentaryButtonModelOptions ) {

    const options = optionize<MomentaryButtonModelOptions, SelfOptions, ButtonModelOptions>()( {

      // phet-io
      tandem: Tandem.REQUIRED,

      // to support properly passing this to children, see https://github.com/phetsims/tandem/issues/60
      phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly
    }, providedOptions );

    super( options );

    const downListener = ( down: boolean ) => {

      // turn on when pressed (if enabled)
      if ( down ) {
        if ( this.enabledProperty.get() ) {
          valueProperty.set( valueOn );
        }
      }
      else {
        valueProperty.set( valueOff );
      }
    };
    this.downProperty.lazyLink( downListener );

    // if valueProperty set externally, signify to ButtonModel
    const valuePropertyListener = ( value: T ) => {
      this.downProperty.set( value === valueOn );
    };
    valueProperty.link( valuePropertyListener );

    this.disposeMomentaryButtonModel = () => {
      this.downProperty.unlink( downListener );
      valueProperty.unlink( valuePropertyListener );
    };
  }

  public override dispose(): void {
    this.disposeMomentaryButtonModel();
    super.dispose(); //TODO fails with assertions enabled, see https://github.com/phetsims/sun/issues/212
  }
}

sun.register( 'MomentaryButtonModel', MomentaryButtonModel );