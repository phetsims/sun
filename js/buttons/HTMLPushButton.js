// Copyright 2014-2020, University of Colorado Boulder

/**
 * Push button with HTML text on a rectangular push button.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author John Blanco (PhET Interactive Simulations)
 */

import inherit from '../../../phet-core/js/inherit.js';
import merge from '../../../phet-core/js/merge.js';
import RichText from '../../../scenery/js/nodes/RichText.js';
import sun from '../sun.js';
import RectangularPushButton from './RectangularPushButton.js';

/**
 * @param {string} html
 * @param {Object} [options]
 * @constructor
 */
function HTMLPushButton( html, options ) {
  options = merge( {
    textFill: 'black'
  }, options );

  const htmlTextNode = new RichText( html, options );
  RectangularPushButton.call( this, merge( { content: htmlTextNode }, options ) );
}

sun.register( 'HTMLPushButton', HTMLPushButton );

inherit( RectangularPushButton, HTMLPushButton );
export default HTMLPushButton;