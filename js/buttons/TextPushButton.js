// Copyright 2014-2015, University of Colorado Boulder

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
  var sun = require( 'SUN/sun' );
  var Text = require( 'SCENERY/nodes/Text' );

  /**
   * @param {string} text
   * @param {Object} [options]
   * @constructor
   */
  function TextPushButton( text, options ) {

    options = _.extend( {
      textFill: 'black',
      maxTextWidth: null
    }, options );

    // Tandem.indicateUninstrumentedCode();  // see https://github.com/phetsims/phet-io/issues/986
    // Tandem should be required and passed to the Text instance

    var textNode = new Text( text, { font: options.font, fill: options.textFill, maxWidth: options.maxTextWidth } );
    RectangularPushButton.call( this, _.extend( { content: textNode }, options ) );
  }

  sun.register( 'TextPushButton', TextPushButton );

  return inherit( RectangularPushButton, TextPushButton );
} );
