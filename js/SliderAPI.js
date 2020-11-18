// Copyright 2020, University of Colorado Boulder

/**
 * PhET-iO API type for Slider
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../axon/js/Property.js';
import PropertyAPI from '../../axon/js/PropertyAPI.js';
import Range from '../../dot/js/Range.js';
import merge from '../../phet-core/js/merge.js';
import DragListenerAPI from '../../scenery/js/listeners/DragListenerAPI.js';
import NodeAPI from '../../scenery/js/nodes/NodeAPI.js';
import NumberIO from '../../tandem/js/types/NumberIO.js';
import Slider from './Slider.js';
import sun from './sun.js';

// private API class just used for Slider
class TrackAPI extends NodeAPI {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {
      dragListenerOptions: {}
    }, options );

    super( options );


    this.dragListener = new DragListenerAPI( options.dragListenerOptions );
  }
}

// private API class just used for Slider
class ThumbAPI extends NodeAPI {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {
      dragListenerOptions: {}
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
      phetioType: Slider.SliderIO,
      visiblePropertyOptions: {
        phetioFeatured: true
      },
      enabledPropertyPhetioInstrumented: true
    }, options );

    super( options );

    this.track = new TrackAPI();
    this.thumb = new ThumbAPI();
    this.enabledRangeProperty = new PropertyAPI( { phetioType: Property.PropertyIO( Range.RangeIO ) } );
    this.valueProperty = new PropertyAPI( { phetioType: Property.PropertyIO( NumberIO ) } );
  }
}

sun.register( 'SliderAPI', SliderAPI );
export default SliderAPI;