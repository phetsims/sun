// Copyright 2014-2020, University of Colorado Boulder

/**
 * Push button with text on a rectangle.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import inherit from '../../../phet-core/js/inherit.js';
import merge from '../../../phet-core/js/merge.js';
import Text from '../../../scenery/js/nodes/Text.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import RectangularPushButton from './RectangularPushButton.js';

/**
 * @param {string} text
 * @param {Object} [options]
 * @constructor
 */
function TextPushButton( text, options ) {

  options = merge( {
    textFill: 'black',
    maxTextWidth: null,
    tandem: Tandem.REQUIRED,

    // pdom
    innerContent: text
  }, options );

  const textNode = new Text( text, {
    font: options.font,
    fill: options.textFill,
    maxWidth: options.maxTextWidth,
    tandem: options.tandem.createTandem( 'textNode' )
  } );

  RectangularPushButton.call( this, merge( { content: textNode }, options ) );

  // @private
  this.disposeTextPushButton = function() {
    textNode.dispose();
  };
}

sun.register( 'TextPushButton', TextPushButton );

inherit( RectangularPushButton, TextPushButton, {

  /**
   * @public
   */
  dispose: function() {
    this.disposeTextPushButton();
    RectangularPushButton.prototype.dispose.call( this );
  }
} );

export default TextPushButton;