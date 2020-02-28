// Copyright 2013-2020, University of Colorado Boulder

/**
 * This toggle button uses a boolean property and a trueNode and falseNode to display its content.
 */

import inherit from '../../../phet-core/js/inherit.js';
import merge from '../../../phet-core/js/merge.js';
import Tandem from '../../../tandem/js/Tandem.js';
import BooleanToggleNode from '../BooleanToggleNode.js';
import sun from '../sun.js';
import RoundToggleButton from './RoundToggleButton.js';

/**
 * @param {Node} trueNode
 * @param {Node} falseNode
 * @param {Property.<boolean>} booleanProperty
 * @param {Object} [options]
 * @constructor
 */
function BooleanRoundToggleButton( trueNode, falseNode, booleanProperty, options ) {

  options = merge( {
    tandem: Tandem.REQUIRED
  }, options );

  assert && assert( !options.content, 'BooleanRoundToggleButton sets content' );
  options.content = new BooleanToggleNode( trueNode, falseNode, booleanProperty, {
    tandem: options.tandem.createTandem( 'toggleNode' )
  } );

  RoundToggleButton.call( this, false, true, booleanProperty, options );

  // @private
  this.disposeBooleanRoundToggleButton = function() {
    options.content.dispose();
  };
}

sun.register( 'BooleanRoundToggleButton', BooleanRoundToggleButton );

export default inherit( RoundToggleButton, BooleanRoundToggleButton, {

  /**
   * @public
   * @override
   */
  dispose: function() {
    this.disposeBooleanRoundToggleButton();
    RoundToggleButton.prototype.dispose.call( this );
  }
} );