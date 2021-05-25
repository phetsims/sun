// Copyright 2014-2021, University of Colorado Boulder

/**
 * Model for a toggle button that changes value on each "up" event when the button is released.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 */

import Emitter from '../../../axon/js/Emitter.js';
import merge from '../../../phet-core/js/merge.js';
import EventType from '../../../tandem/js/EventType.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import ButtonModel from './ButtonModel.js';

class ToggleButtonModel extends ButtonModel {

  /**
   * @param {Object} valueOff - value when the button is in the off state
   * @param {Object} valueOn - value when the button is in the on state
   * @param {Property} property - axon Property that can be either valueOff or valueOn.
   * @param {Object} [options]
   */
  constructor( valueOff, valueOn, property, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED
    }, options );

    super( options );

    // @private
    this.valueOff = valueOff;
    this.valueOn = valueOn;
    this.valueProperty = property;

    // Behaves like a push button (with fireOnDown:false), but toggles its state when the button is released.
    const downListener = down => {
      if ( ( this.overProperty.get() || this.focusedProperty.get() ) && this.enabledProperty.get() && !this.interrupted ) {
        if ( !down ) {
          this.toggle();
        }
      }
    };
    this.downProperty.link( downListener ); // @private

    // @private
    this.toggledEmitter = new Emitter( {
      tandem: options.tandem.createTandem( 'toggledEmitter' ),
      phetioDocumentation: 'Emits when the button is toggled',
      phetioEventType: EventType.USER
    } );

    const toggleListener = () => {
      assert && assert( this.valueProperty.value === this.valueOff || this.valueProperty.value === this.valueOn,
        `unrecognized value: ${this.valueProperty.value}` );

      this.valueProperty.value = this.valueProperty.value === this.valueOff ? this.valueOn : this.valueOff;
    };
    this.toggledEmitter.addListener( toggleListener );

    // @private - dispose items specific to this instance
    this.disposeToggleButtonModel = () => {
      this.downProperty.unlink( downListener );
      this.toggledEmitter.removeListener( toggleListener );
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeToggleButtonModel();
    super.dispose();
  }

  // @public
  toggle() {
    this.toggledEmitter.emit();
    this.produceSoundEmitter.emit();
  }
}

sun.register( 'ToggleButtonModel', ToggleButtonModel );
export default ToggleButtonModel;