// Copyright 2014-2021, University of Colorado Boulder

/**
 * HSeparator is a horizontal separator, typically used to separate a panel into logical sections.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../phet-core/js/merge.js';
import { Line } from '../../scenery/js/imports.js';
import sun from './sun.js';

class HSeparator extends Line {

  /**
   * @param {number} width
   * @param {Object} [options]
   */
  constructor( width, options ) {

    options = merge( {
      stroke: 'rgb( 100, 100, 100 )',
      strokePickable: true
    }, options );

    super( 0, 0, width, 0, options );
  }
}

sun.register( 'HSeparator', HSeparator );
export default HSeparator;