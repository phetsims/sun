// Copyright 2002-2013, University of Colorado Boulder

/**
 * Push button with text on a rectangle.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // imports
  var inherit = require( 'PHET_CORE/inherit' );
  var Font = require( 'SCENERY/util/Font' );
  var RectanglePushButtonDeprecated = require( 'SUN/RectanglePushButtonDeprecated' );
  var Text = require( 'SCENERY/nodes/Text' );

  function TextPushButton( text, options ) {

    options = _.extend( {
      font: new Font(),
      textFill: 'black',
      textFillDisabled: 'rgb(175,175,175)'
    }, options );

    var textNode = new Text( text, { font: options.font } );

    RectanglePushButtonDeprecated.call( this, textNode, options );

    // enable/disable the pieces that are specific to this subtype
    this._enabled.link( function( enabled ) {
      textNode.fill = enabled ? options.textFill : options.textFillDisabled;
    } );
  }

  return inherit( RectanglePushButtonDeprecated, TextPushButton );
} );
