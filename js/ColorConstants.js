// Copyright 2014-2015, University of Colorado Boulder

/**
 * Colors that are reused in many places throughout sun.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var sun = require( 'SUN/sun' );

  /**
   *
   * @constructor
   */
  function ColorConstants() {
  }

  sun.register( 'ColorConstants', ColorConstants );

  return inherit( Object, ColorConstants, {}, {

    //The default blue color used in many places, for buttons
    LIGHT_BLUE: new Color( 153, 206, 255 ),

    //Light gray, used as the 'disabled' color in many places.
    LIGHT_GRAY: new Color( 220, 220, 220 )
  } );
} );