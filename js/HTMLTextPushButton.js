// Copyright 2002-2013, University of Colorado Boulder

/**
 * Push button with HTML text on a rectangle.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // imports
  var inherit = require( 'PHET_CORE/inherit' );
  var RectanglePushButton = require( 'SUN/RectanglePushButton' );
  var HTMLText = require( 'SCENERY/nodes/HTMLText' );

  function HTMLTextPushButton( text, options ) {

    options = _.extend( {
      textFill: 'black',
      textFillDisabled: 'rgb(175,175,175)'
    }, options );

    var htmlTextNode = new HTMLText( text, options );

    RectanglePushButton.call( this, htmlTextNode, options );

    // enable/disable the pieces that are specific to this subtype
    this._enabled.link( function( enabled ) {
      htmlTextNode.fill = enabled ? options.textFill : options.textFillDisabled;
    } );
  }

  return inherit( RectanglePushButton, HTMLTextPushButton );
} );
