// Copyright 2002-2013, University of Colorado Boulder

/**
 * Push button with HTML text on a rectangular push button.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var HTMLText = require( 'SCENERY/nodes/HTMLText' );

  function HTMLPushButton( html, options ) {
    options = _.extend( {
      textFill: 'black'
    }, options );

    var htmlTextNode = new HTMLText( html, options );
    RectangularPushButton.call( this, _.extend( { content: htmlTextNode }, options ) );
  }

  return inherit( RectangularPushButton, HTMLPushButton );
} );
