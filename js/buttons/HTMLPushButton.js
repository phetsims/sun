// Copyright 2014-2017, University of Colorado Boulder

/**
 * Push button with HTML text on a rectangular push button.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author John Blanco (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var RichText = require( 'SCENERY/nodes/RichText' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );

  /**
   * @param {string} html
   * @param {Object} [options]
   * @constructor
   */
  function HTMLPushButton( html, options ) {
    Tandem.indicateUninstrumentedCode();

    options = _.extend( {
      textFill: 'black'
    }, options );

    var htmlTextNode = new RichText( html, options );
    RectangularPushButton.call( this, _.extend( { content: htmlTextNode }, options ) );
  }

  sun.register( 'HTMLPushButton', HTMLPushButton );

  return inherit( RectangularPushButton, HTMLPushButton );
} );
