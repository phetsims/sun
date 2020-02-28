// Copyright 2018-2020, University of Colorado Boulder

/**
 * Shows one node if the property is true or another node if the property is false. Used to indicate boolean state.
 * This is a convenience API for true/false nodes, see SelectedNode for the general case.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import inherit from '../../phet-core/js/inherit.js';
import sun from './sun.js';
import ToggleNode from './ToggleNode.js';

/**
 * @param {Node} trueNode
 * @param {Node} falseNode
 * @param {Property.<boolean>} booleanProperty
 * @param {Object} [options]
 * @constructor
 */
function BooleanToggleNode( trueNode, falseNode, booleanProperty, options ) {
  ToggleNode.call( this, booleanProperty, [
    { value: true, node: trueNode },
    { value: false, node: falseNode }
  ], options );
}

sun.register( 'BooleanToggleNode', BooleanToggleNode );

inherit( ToggleNode, BooleanToggleNode );
export default BooleanToggleNode;