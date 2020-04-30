// Copyright 2013-2020, University of Colorado Boulder

/**
 * This toggle button uses a boolean property and a trueNode and falseNode to display its content.
 */

import inherit from '../../../phet-core/js/inherit.js';
import merge from '../../../phet-core/js/merge.js';
import Tandem from '../../../tandem/js/Tandem.js';
import BooleanToggleNode from '../BooleanToggleNode.js';
import sun from '../sun.js';
import RectangularToggleButton from './RectangularToggleButton.js';

/**
 * @param {Node} trueNode
 * @param {Node} falseNode
 * @param {Property.<boolean>} booleanProperty
 * @param {Object} [options]
 * @constructor
 */
function BooleanRectangularToggleButton( trueNode, falseNode, booleanProperty, options ) {

  options = merge( { tandem: Tandem.REQUIRED }, options );

  assert && assert( !options.content, 'options.content cannot be set' );
  options.content = new BooleanToggleNode( trueNode, falseNode, booleanProperty );

  RectangularToggleButton.call( this, false, true, booleanProperty, options );

  // @private {function} - internally used disposal function
  this.disposeBooleanRectangularToggleButton = function() {
    options.content.dispose();
  };
}

sun.register( 'BooleanRectangularToggleButton', BooleanRectangularToggleButton );

inherit( RectangularToggleButton, BooleanRectangularToggleButton, {
  /**
   * @public
   */
  dispose: function() {
    this.disposeBooleanRectangularToggleButton();
    RectangularToggleButton.prototype.dispose.call( this );
  }
} );

export default BooleanRectangularToggleButton;