// Copyright 2014-2021, University of Colorado Boulder

/**
 * Push button with text on a rectangle.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import Text from '../../../scenery/js/nodes/Text.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import RectangularPushButton from './RectangularPushButton.js';

class TextPushButton extends RectangularPushButton {

  /**
   * @param {string} text
   * @param {Object} [options]
   */
  constructor( text, options ) {

    options = merge( {
      textFill: 'black',
      maxTextWidth: null,

      textNodeOptions: {},

      // phet-io
      tandem: Tandem.REQUIRED,

      // pdom
      innerContent: text
    }, options );

    const textNode = new Text( text, merge( {
      font: options.font,
      fill: options.textFill,
      maxWidth: options.maxTextWidth,
      tandem: options.tandem.createTandem( 'textNode' )
    }, options.textNodeOptions ) );

    assert && assert( !options.content, 'TextPushButton sets content' );
    options.content = textNode;

    super( options );

    // @private
    this.disposeTextPushButton = () => {
      textNode.dispose();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeTextPushButton();
    super.dispose();
  }
}

sun.register( 'TextPushButton', TextPushButton );
export default TextPushButton;