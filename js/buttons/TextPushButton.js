// Copyright 2014-2018, University of Colorado Boulder

/**
 * Push button with text on a rectangle.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  const sun = require( 'SUN/sun' );
  const Tandem = require( 'TANDEM/Tandem' );
  const Text = require( 'SCENERY/nodes/Text' );

  /**
   * @param {string} text
   * @param {Object} [options]
   * @constructor
   */
  function TextPushButton( text, options ) {

    options = _.extend( {
      textFill: 'black',
      maxTextWidth: null,
      tandem: Tandem.required,

      // a11y
      innerContent: text
    }, options );

    var textNode = new Text( text, {
      font: options.font,
      fill: options.textFill,
      maxWidth: options.maxTextWidth,
      tandem: options.tandem.createTandem( 'textNode' )
    } );

    RectangularPushButton.call( this, _.extend( { content: textNode }, options ) );

    // @private
    this.disposeTextPushButton = function() {
      textNode.dispose();
    };
  }

  sun.register( 'TextPushButton', TextPushButton );

  return inherit( RectangularPushButton, TextPushButton, {

    /**
     * @public
     */
    dispose: function() {
      this.disposeTextPushButton();
      RectangularPushButton.prototype.dispose.call( this );
    }
  } );
} );
