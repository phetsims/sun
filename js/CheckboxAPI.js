// Copyright 2020, University of Colorado Boulder

/**
 * PhET-iO API type for Checkbox
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import ActionAPI from '../../axon/js/ActionAPI.js';
import Property from '../../axon/js/Property.js';
import PropertyAPI from '../../axon/js/PropertyAPI.js';
import merge from '../../phet-core/js/merge.js';
import FireListenerAPI from '../../scenery/js/listeners/FireListenerAPI.js';
import NodeAPI from '../../scenery/js/nodes/NodeAPI.js';
import EventType from '../../tandem/js/EventType.js';
import BooleanIO from '../../tandem/js/types/BooleanIO.js';
import sun from './sun.js';

class CheckboxAPI extends NodeAPI {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {
      phetioEventType: EventType.USER,
      visiblePropertyOptions: { phetioFeatured: true },
      enabledPropertyPhetioInstrumented: true
    }, options );

    super( options );

    // @public (read-only)
    this.toggleAction = new ActionAPI( {
      phetioReadOnly: true,
      phetioEventType: EventType.USER
    } );

    // @public (read-only)
    this.fireListener = new FireListenerAPI();
    this.property = new PropertyAPI( { phetioType: Property.PropertyIO( BooleanIO ) } );
  }
}

sun.register( 'CheckboxAPI', CheckboxAPI );
export default CheckboxAPI;