// Copyright 2014-2020, University of Colorado Boulder

/**
 * Vertical separator, for use in control panels.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import inherit from '../../phet-core/js/inherit.js';
import merge from '../../phet-core/js/merge.js';
import Line from '../../scenery/js/nodes/Line.js';
import sun from './sun.js';

function VSeparator( height, options ) {
  options = merge( {
    stroke: 'rgb(100,100,100)'
  }, options );

  Line.call( this, 0, 0, 0, height, options );
}

sun.register( 'VSeparator', VSeparator );

inherit( Line, VSeparator );
export default VSeparator;