// Copyright 2018-2022, University of Colorado Boulder

/**
 * Shows one node if the property is true or another node if the property is false. Used to indicate boolean state.
 * This is a convenience API for true/false nodes, see SelectedNode for the general case.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import sun from './sun.js';
import ToggleNode, { ToggleNodeOptions } from './ToggleNode.js';
import { Node } from '../../scenery/js/imports.js';
import Property from '../../axon/js/Property.js';

export type BooleanToggleNodeOptions = ToggleNodeOptions;

export default class BooleanToggleNode extends ToggleNode<boolean> {

  /**
   * @param trueNode
   * @param falseNode
   * @param booleanProperty
   * @param providedOptions
   */
  constructor( trueNode: Node, falseNode: Node, booleanProperty: Property<boolean>, providedOptions?: BooleanToggleNodeOptions ) {
    super( booleanProperty, [
      { value: true, node: trueNode },
      { value: false, node: falseNode }
    ], providedOptions );
  }
}

sun.register( 'BooleanToggleNode', BooleanToggleNode );
