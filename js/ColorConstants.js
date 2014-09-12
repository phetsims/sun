//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Colors that are reused in many places throughout sun.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Color = require( 'SCENERY/util/Color' );

  /**
   *
   * @constructor
   */
  function ColorConstants() {
  }

  return inherit( Object, ColorConstants, {}, {

    //The default blue color used in many places.
    LIGHT_BLUE: new Color( 153, 206, 255 )
  } );
} );