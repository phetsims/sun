// Copyright 2022, University of Colorado Boulder

/**
 * Defines the type for when you can pass in a Node or a function that creates a Node from a Tandem.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
import Tandem from '../../tandem/js/Tandem.js';
import { Node } from '../../scenery/js/imports.js';

// Provide either a Node or a function that creates a Node from a Tandem (but not both).
// If you pass in a Node, you can also pass in a Tandem.  Or if you use `createNode` then you can specify `tandemName`
type GroupItemOptions = {
  createNode: ( tandem: Tandem ) => Node;

  // If PhET-iO information is provided here, it should be tandemName that will be used to create the tandem for
  // createNode. Optional to support uninstrumented sims and demos
  tandemName?: string;
};

export default GroupItemOptions;

/**
 * Get the nodes for the GroupItemOptions
 * TODO: https://github.com/phetsims/sun/issues/746 should this be renamed? Should it just be a top level `export function`,
 *       or does it belong elsewhere?
 */
export function getNodes( array: GroupItemOptions[], tandem: Tandem ): Node[] {
  return array.map( item => {

    // @ts-ignore - runtime check to prevent prior pattern, see https://github.com/phetsims/sun/issues/794
    assert && assert( !item.node, 'Use createNode instead of node' );

    return item.createNode( item.tandemName ? tandem.createTandem( item.tandemName ) : Tandem.OPTIONAL );
  } );
}
