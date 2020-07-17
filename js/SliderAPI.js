// Copyright 2020, University of Colorado Boulder

/**
 * PhET-iO API type for Slider
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import merge from '../../phet-core/js/merge.js';
import DragListenerAPI from '../../scenery/js/listeners/DragListenerAPI.js';
import NodeAPI from '../../scenery/js/nodes/NodeAPI.js';
import SliderIO from './SliderIO.js';
import sun from './sun.js';

// private API class just used for Slider
class TrackAPI extends NodeAPI {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {

      // All TrackAPIs have an unfeatured drag press action
      dragListenerOptions: {
        pressActionOptions: {
          phetioFeature: false
        }
      }
    }, options );

    super( options );

    this.dragListener = new DragListenerAPI( options.dragListenerOptions );
  }
}

class SliderAPI extends NodeAPI {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {
      phetioType: SliderIO,
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    }, options );

    super( options );

    this.track = new TrackAPI( {

      // TODO: this is now part of the API, but how to we tell phetioAPITest to test this arbitrarily deep tandem override for Slider, https://github.com/phetsims/phet-io/issues/1657
      dragListenerOptions: {
        pressActionOptions: {
          phetioFeature: true
        }
      }
    } );
  }
}

sun.register( 'SliderAPI', SliderAPI );
export default SliderAPI;