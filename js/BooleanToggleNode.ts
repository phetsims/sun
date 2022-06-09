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
import IProperty from '../../axon/js/IProperty.js';

type SelfOptions = {};

export type BooleanToggleNodeOptions = SelfOptions & ToggleNodeOptions;

export default class BooleanToggleNode extends ToggleNode<boolean> {

  /**
   * @param trueNode - shown when booleanProperty is true
   * @param falseNode - shown when booleanProperty is false
   * @param booleanProperty
   * @param providedOptions
   */
  public constructor( trueNode: Node, falseNode: Node, booleanProperty: IProperty<boolean>, providedOptions?: BooleanToggleNodeOptions ) {
    super( booleanProperty, [
      { value: true, node: trueNode },
      { value: false, node: falseNode }
    ], providedOptions );
  }
}

sun.register( 'BooleanToggleNode', BooleanToggleNode );
