// Copyright 2020, University of Colorado Boulder

/**
 * PhET-iO API type for AquaRadioButtonGroup
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../axon/js/Property.js';
import PropertyAPI from '../../axon/js/PropertyAPI.js';
import merge from '../../phet-core/js/merge.js';
import NodeAPI from '../../scenery/js/nodes/NodeAPI.js';
import IOType from '../../tandem/js/types/IOType.js';
import AquaRadioButtonAPI from './AquaRadioButtonAPI.js';
import sun from './sun.js';

class AquaRadioButtonGroupAPI extends NodeAPI {

  /**
   * @param {string[]} radioButtonTandemNames - the tandemNames for each child aqua radio button
   * @param {Object} [options]
   */
  constructor( radioButtonTandemNames, options ) {

    options = merge( {
      visiblePropertyOptions: { phetioFeatured: true },
      enabledPropertyPhetioInstrumented: true,
      propertyOptions: {
        phetioType: Property.PropertyIO( IOType.ObjectIO )
      }
    }, options );

    super( options );

    // @public (read-only)
    this.property = new PropertyAPI( options.propertyOptions );

    radioButtonTandemNames.forEach( tandemName => {

      // @public (read-only)
      this[ tandemName ] = new AquaRadioButtonAPI();
    } );
  }
}

sun.register( 'AquaRadioButtonGroupAPI', AquaRadioButtonGroupAPI );
export default AquaRadioButtonGroupAPI;