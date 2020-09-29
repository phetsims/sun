// Copyright 2015-2020, University of Colorado Boulder

/**
 * Model for a momentary button: on when pressed, off when released.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../phet-core/js/merge.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import ButtonModel from './ButtonModel.js';

class MomentaryButtonModel extends ButtonModel {

  /**
   * @param {Object} valueOff - value when the button is in the off state
   * @param {Object} valueOn - value when the button is in the on state
   * @param {Property} valueProperty
   * @param {Object} [options]
   */
  constructor( valueOff, valueOn, valueProperty, options ) {

    // Tandem support
    options = merge( {

      // phet-io
      tandem: Tandem.REQUIRED,

      // to support properly passing this to children, see https://github.com/phetsims/tandem/issues/60
      phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly
    }, options );

    super( options );

    const downListener = down => {

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
    const valuePropertyListener = value => {
      this.downProperty.set( value === valueOn );
    };
    valueProperty.link( valuePropertyListener );

    // @private
    this.disposeMomentaryButtonModel = () => {
      this.downProperty.unlink( downListener );
      valueProperty.unlink( valuePropertyListener );
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeMomentaryButtonModel();
    super.dispose(); //TODO fails with assertions enabled, see sun#212
  }
}

sun.register( 'MomentaryButtonModel', MomentaryButtonModel );
export default MomentaryButtonModel;