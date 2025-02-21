// Copyright 2018-2025, University of Colorado Boulder

/**
 * Shows one node if the property is true or another node if the property is false. Used to indicate boolean state.
 * This is a convenience API for true/false nodes, see SelectedNode for the general case.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import type TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import { type EmptySelfOptions } from '../../phet-core/js/optionize.js';
import type Node from '../../scenery/js/nodes/Node.js';
import sun from './sun.js';
import ToggleNode, { type ToggleNodeOptions } from './ToggleNode.js';

type SelfOptions = EmptySelfOptions;

export type BooleanToggleNodeOptions = SelfOptions & ToggleNodeOptions;

export default class BooleanToggleNode extends ToggleNode<boolean> {

  public constructor( booleanProperty: TReadOnlyProperty<boolean>,
                      trueNode: Node,
                      falseNode: Node,
                      providedOptions?: BooleanToggleNodeOptions ) {
    super( booleanProperty, [
      { value: true, createNode: () => trueNode },
      { value: false, createNode: () => falseNode }
    ], providedOptions );
  }
}

sun.register( 'BooleanToggleNode', BooleanToggleNode );