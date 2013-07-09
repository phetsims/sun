// Copyright 2002-2013, University of Colorado Boulder

/**
 * Button with HTML text on a rectangle.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // imports
  var inherit = require( 'PHET_CORE/inherit' );
  var RectangleButton = require( 'SUN/RectangleButton' );
  var HTMLText = require( 'SCENERY/nodes/HTMLText' );

  function HTMLTextButton( text, callback, options ) {

    var htmlTextNode = new HTMLText( text, options );

    RectangleButton.call( this, htmlTextNode, callback, options );

    // enable/disable the pieces that are specific to this subtype
    this._enabled.link( function( enabled ) {
      htmlTextNode.fill = enabled ? options.textFill : options.textFillDisabled;
    } );
  }

  inherit( RectangleButton, HTMLTextButton );

  return HTMLTextButton;
} );
