// Copyright 2014-2020, University of Colorado Boulder

/**
 * HSeparator is a horizontal separator, typically used to separate a panel into logical sections.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../phet-core/js/merge.js';
import Line from '../../scenery/js/nodes/Line.js';
import sun from './sun.js';

class HSeparator extends Line {

  /**
   * @param {number} width
   * @param {Object} [options]
   */
  constructor( width, options ) {

    options = merge( {
      stroke: 'rgb( 100, 100, 100 )'
    }, options );

    super( 0, 0, width, 0, options );
  }
}

sun.register( 'HSeparator', HSeparator );
export default HSeparator;