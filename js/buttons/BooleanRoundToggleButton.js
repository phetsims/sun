// Copyright 2013-2020, University of Colorado Boulder

/**
 * This toggle button uses a boolean Property and a trueNode and falseNode to display its content.
 */

import merge from '../../../phet-core/js/merge.js';
import Tandem from '../../../tandem/js/Tandem.js';
import BooleanToggleNode from '../BooleanToggleNode.js';
import sun from '../sun.js';
import RoundToggleButton from './RoundToggleButton.js';

class BooleanRoundToggleButton extends RoundToggleButton {

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

    assert && assert( !options.content, 'BooleanRoundToggleButton sets content' );
    options.content = new BooleanToggleNode( trueNode, falseNode, booleanProperty, {
      tandem: options.tandem.createTandem( 'toggleNode' )
    } );

    super( false, true, booleanProperty, options );

    // @private
    this.disposeBooleanRoundToggleButton = function() {
      options.content.dispose();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeBooleanRoundToggleButton();
    super.dispose();
  }
}

sun.register( 'BooleanRoundToggleButton', BooleanRoundToggleButton );
export default BooleanRoundToggleButton;