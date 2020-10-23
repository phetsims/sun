// Copyright 2013-2020, University of Colorado Boulder

/**
 * This toggle button uses a boolean Property and a trueNode and falseNode to display its content.
 */

import merge from '../../../phet-core/js/merge.js';
import Tandem from '../../../tandem/js/Tandem.js';
import BooleanToggleNode from '../BooleanToggleNode.js';
import sun from '../sun.js';
import RectangularToggleButton from './RectangularToggleButton.js';

class BooleanRectangularToggleButton extends RectangularToggleButton {

  /**
   * @param {Node} trueNode
   * @param {Node} falseNode
   * @param {Property.<boolean>} booleanProperty
   * @param {Object} [options]
   */
  constructor( trueNode, falseNode, booleanProperty, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED
    }, options );

    assert && assert( !options.content, 'options.content cannot be set' );
    options.content = new BooleanToggleNode( trueNode, falseNode, booleanProperty );

    super( false, true, booleanProperty, options );

    // @private
    this.disposeBooleanRectangularToggleButton = () => {
      options.content && options.content.dispose();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeBooleanRectangularToggleButton();
    super.dispose();
  }
}

sun.register( 'BooleanRectangularToggleButton', BooleanRectangularToggleButton );
export default BooleanRectangularToggleButton;