// Copyright 2002-2014, University of Colorado Boulder

/**
 * Button for returning to the level selection screen.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // Includes
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var RectangularPushButton2 = require( 'SUN/experimental/buttons/RectangularPushButton2' );
  var Star = require( 'VEGAS/Star' );

  /**
   * @param {function} callback
   * @param {Object} options
   * @constructor
   */
  function ReturnToLevelSelectButton( options ) {

    options = _.extend( {
      xPadding: 7,
      baseColor: new Color( 255, 242, 2 )
    }, options );

    RectangularPushButton2.call( this, new Star( 30, { fill: 'rgb( 88, 88, 90 )' } ), options );
  }

  return inherit( RectangularPushButton2, ReturnToLevelSelectButton );
} );