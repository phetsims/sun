// Copyright 2013-2025, University of Colorado Boulder

/**
 * Display one of N nodes based on a given Property. See the option "unselectedChildrenSceneGraphStrategy" for different
 * child management strategies and how they impact the overall bounds and performance.
 * Supports null and undefined as possible values.  Will not work correctly if the children are changed externally
 * after instantiation (manages its own children and their visibility).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../phet-core/js/optionize.js';
import type StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import ManualConstraint from '../../scenery/js/layout/constraints/ManualConstraint.js';
import { type Layoutable } from '../../scenery/js/layout/LayoutProxy.js';
import Node, { type NodeOptions } from '../../scenery/js/nodes/Node.js';
import type GroupItemOptions from './GroupItemOptions.js';
import { getGroupItemNodes } from './GroupItemOptions.js';
import sun from './sun.js';

export type ToggleNodeElement<T, N extends Node = Node> = {
  value: T;  // a value
} & GroupItemOptions<N>;

type SelfOptions = {

  // {function} determines the relative layout of element Nodes. See below for pre-defined layout.
  alignChildren?: ( children: Layoutable[] ) => void;

  // Determine whether unselected children (the ones not displayed) are in the scene graph.
  // - If included (the default), unselected children are in the scene graph and hidden via setVisible(false). In this case
  //   the layout is the union of the bounds of all children (visible and invisible).
  // - If excluded, children are added to the scene graph when selected and removed when not selected. The ToggleNode has
  // the bounds of its selected child. This option can sometimes improve performance. Children added to the ToggleNode
  // outside the constructor will not be managed correctly.
  unselectedChildrenSceneGraphStrategy?: 'included' | 'excluded';
};

export type ToggleNodeOptions = SelfOptions & StrictOmit<NodeOptions, 'children'>;

export default class ToggleNode<T, N extends Node = Node> extends Node {

  private readonly disposeToggleNode: () => void;
  public readonly nodes: N[];

  public constructor( valueProperty: TReadOnlyProperty<T>, elements: ToggleNodeElement<T, N>[], providedOptions?: ToggleNodeOptions ) {

    const options = optionize<ToggleNodeOptions, SelfOptions, NodeOptions>()( {

      // SelfOptions
      alignChildren: ToggleNode.CENTER,

      unselectedChildrenSceneGraphStrategy: 'included'
    }, providedOptions );

    const nodes = getGroupItemNodes( elements, options.tandem );

    options.children = nodes;

    options.alignChildren( options.children );

    super( options );

    const alignmentConstraint = new ManualConstraint( this, options.children, ( ...x: Layoutable[] ) => {
      options.alignChildren( x );
    } );

    const valueListener = ( value: T ) => {
      const matches: Node[] = [];
      for ( let i = 0; i < elements.length; i++ ) {
        const element = elements[ i ];
        const visible = element.value === value;
        nodes[ i ].visible = visible;
        if ( visible ) {
          matches.push( nodes[ i ] );
        }
      }

      assert && assert( matches.length === 1, `Wrong number of matches: ${matches.length}` );
      if ( options.unselectedChildrenSceneGraphStrategy === 'excluded' ) {
        this.children = matches;
      }
    };

    // Run the link after super so we can change the children if needed. This means that when areUnselectedChildrenInSceneGraph===false,
    // all children will temporarily be visible: true until this link is called. However, since this ToggleNode is not yet
    // in the scene graph, this should not cause any visual problems or significant performance issues.
    valueProperty.link( valueListener );

    this.nodes = nodes;

    this.disposeToggleNode = function() {
      valueProperty.unlink( valueListener );
      alignmentConstraint.dispose();
      nodes.forEach( node => node.dispose() );
    };

    assert && window.phet?.chipper?.queryParameters?.binder && InstanceRegistry.registerDataURL( 'sun', 'ToggleNode', this );
  }

  public override dispose(): void {
    this.disposeToggleNode();
    super.dispose();
  }

  /**
   * A value for the alignChildren option.
   * Centers the latter nodes on the x,y center of the first node.
   */
  public static CENTER( children: Layoutable[] ): void {
    for ( let i = 1; i < children.length; i++ ) {
      children[ i ].center = children[ 0 ].center;
    }
  }

  /**
   * A value for the alignChildren option.
   * Centers the latter nodes on the x center of the first node.
   */
  public static CENTER_X( children: Layoutable[] ): void {
    for ( let i = 1; i < children.length; i++ ) {
      children[ i ].centerX = children[ 0 ].centerX;
    }
  }

  /**
   * A value for the alignChildren option.
   * Centers the latter nodes on the y center of the first node.
   */
  public static CENTER_Y( children: Layoutable[] ): void {
    for ( let i = 1; i < children.length; i++ ) {
      children[ i ].centerY = children[ 0 ].centerY;
    }
  }

  /**
   * A value for the alignChildren option.
   * Left aligns nodes on the left of the first node.
   */
  public static LEFT( children: Layoutable[] ): void {
    for ( let i = 1; i < children.length; i++ ) {
      children[ i ].left = children[ 0 ].left;
    }
  }

  /**
   * A value for the alignChildren option.
   * Aligns nodes on the bottom of the first node.
   */
  public static BOTTOM( children: Layoutable[] ): void {
    for ( let i = 1; i < children.length; i++ ) {
      children[ i ].bottom = children[ 0 ].bottom;
    }
  }

  /**
   * A value for the alignChildren option.
   * Aligns nodes on the bottom of the first node.
   */
  public static CENTER_BOTTOM( children: Layoutable[] ): void {
    for ( let i = 1; i < children.length; i++ ) {
      children[ i ].centerBottom = children[ 0 ].centerBottom;
    }
  }

  /**
   * A value for the alignChildren option.
   * Right aligns nodes on the right of the first node.
   */
  public static RIGHT( children: Layoutable[] ): void {
    for ( let i = 1; i < children.length; i++ ) {
      children[ i ].right = children[ 0 ].right;
    }
  }

  /**
   * A value for the alignChildren option.
   * No alignment is performed.
   */
  public static NONE( children: Layoutable[] ): void {
    // do nothing
  }
}

sun.register( 'ToggleNode', ToggleNode );