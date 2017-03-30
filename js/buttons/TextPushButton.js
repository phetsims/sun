// Copyright 2014-2015, University of Colorado Boulder

/**
 * Push button with text on a rectangle.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var sun = require( 'SUN/sun' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Tandem = require( 'TANDEM/Tandem' );

  /**
   * @param {string} text
   * @param {Object} [options]
   * @constructor
   */
  function TextPushButton( text, options ) {

    options = _.extend( {
      textFill: 'black',
      maxTextWidth: null,
      tandem: Tandem.tandemRequired(),

      // a11y
      accessibleLabel: text
    }, options );

    var textNode = new Text( text, {
      font: options.font,
      fill: options.textFill,
      maxWidth: options.maxTextWidth,
      tandem: options.tandem.createTandem( 'textNode' )
    } );

    RectangularPushButton.call( this, _.extend( { content: textNode }, options ) );
  }

  sun.register( 'TextPushButton', TextPushButton );

  return inherit( RectangularPushButton, TextPushButton );
} );
