// Copyright 2015-2020, University of Colorado Boulder

/**
 * Model for a momentary button: on when pressed, off when released.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import inherit from '../../../phet-core/js/inherit.js';
import merge from '../../../phet-core/js/merge.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import ButtonModel from './ButtonModel.js';

/**
 * @param {Object} valueOff - value when the button is in the off state
 * @param {Object} valueOn - value when the button is in the on state
 * @param {Property} valueProperty
 * @param {Object} [options]
 * @constructor
 */
function MomentaryButtonModel( valueOff, valueOn, valueProperty, options ) {
  const self = this;

  // Tandem support
  options = merge( {
    tandem: Tandem.REQUIRED,
    phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly // to support properly passing this to children, see https://github.com/phetsims/tandem/issues/60
  }, options );

  ButtonModel.call( self, options );

  const downListener = function( down ) {

    // turn on when pressed (if enabled)
    if ( down ) {
      if ( self.enabledProperty.get() ) {
        valueProperty.set( valueOn );
      }
    }
    else {
      valueProperty.set( valueOff );
    }
  };
  this.downProperty.lazyLink( downListener );

  // if valueProperty set externally, signify to ButtonModel
  const valuePropertyListener = function( value ) {
    self.downProperty.set( value === valueOn );
  };
  valueProperty.link( valuePropertyListener );

  // @private: just for dispose.  Named based on the type name so it won't have a name collision with parent/child ones
  this.disposeMomentaryButtonModel = function() {
    self.downProperty.unlink( downListener );
    valueProperty.unlink( valuePropertyListener );
  };
}

sun.register( 'MomentaryButtonModel', MomentaryButtonModel );

export default inherit( ButtonModel, MomentaryButtonModel, {

  // @public - Ensures that this model is eligible for GC.
  dispose: function() {
    this.disposeMomentaryButtonModel();
    ButtonModel.prototype.dispose.call( this ); //TODO fails with assertions enabled, see sun#212
  }
} );