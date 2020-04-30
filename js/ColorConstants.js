// Copyright 2014-2020, University of Colorado Boulder

/**
 * Colors that are reused in many places throughout sun.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import inherit from '../../phet-core/js/inherit.js';
import Color from '../../scenery/js/util/Color.js';
import sun from './sun.js';

/**
 *
 * @constructor
 */
function ColorConstants() {
}

sun.register( 'ColorConstants', ColorConstants );

inherit( Object, ColorConstants, {}, {

  //The default blue color used in many places, for buttons
  LIGHT_BLUE: new Color( 153, 206, 255 ),

  //Light gray, used as the 'disabled' color in many places.
  LIGHT_GRAY: new Color( 220, 220, 220 )
} );

export default ColorConstants;