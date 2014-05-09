// Copyright 2002-2014, University of Colorado Boulder

/**
 * Push button with text on a rectangle.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );

  // constants
  var DEFAULT_FONT = new PhetFont( 20 );

  function TextPushButton( text, options ) {

    options = _.extend( {
      font: DEFAULT_FONT,
      textFill: 'black'
    }, options );

    var textNode = new Text( text, { font: options.font, fill: options.textFill } );
    RectangularPushButton.call( this, _.extend( { content: textNode }, options ) );
  }

  return inherit( RectangularPushButton, TextPushButton );
} );
