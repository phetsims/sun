// Copyright 2014-2020, University of Colorado Boulder

/**
 * VSeparator is a vertical separator, typically used to separate a panel into logical sections.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../phet-core/js/merge.js';
import Line from '../../scenery/js/nodes/Line.js';
import sun from './sun.js';

class VSeparator extends Line {

  /**
   * @param {number} height
   * @param {Object} [options]
   */
  constructor( height, options ) {

    options = merge( {
      stroke: 'rgb( 100, 100, 100 )'
    }, options );

    super( 0, 0, 0, height, options );
  }
}

sun.register( 'VSeparator', VSeparator );
export default VSeparator;