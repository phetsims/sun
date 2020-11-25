// Copyright 2020, University of Colorado Boulder

/**
 * PhET-iO API type for AquaRadioButton
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../axon/js/Property.js';
import merge from '../../phet-core/js/merge.js';
import FireListenerAPI from '../../scenery/js/listeners/FireListenerAPI.js';
import NodeAPI from '../../scenery/js/nodes/NodeAPI.js';
import IOType from '../../tandem/js/types/IOType.js';
import sun from './sun.js';

class AquaRadioButtonAPI extends NodeAPI {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {
    options = merge( {
      visiblePropertyOptions: { phetioFeatured: true },
      enabledPropertyPhetioInstrumented: true
    }, options );

    super( options );

    // @public (read-only)
    this.fireListener = new FireListenerAPI( { phetioType: Property.PropertyIO( IOType.ObjectIO ) } );
  }
}

sun.register( 'AquaRadioButtonAPI', AquaRadioButtonAPI );
export default AquaRadioButtonAPI;