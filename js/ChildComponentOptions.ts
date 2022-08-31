// Copyright 2013-2022, University of Colorado Boulder

/**
 * Defines the type for when you can pass in a Node or a function that creates a Node from a Tandem.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
import Tandem from '../../tandem/js/Tandem.js';
import { Node } from '../../scenery/js/imports.js';

// Provide either a Node or a function that creates a Node from a Tandem (but not both)
type ChildComponentOptions = {
  node: Node;

  // If PhET-iO information is provided here, it should be a fully complete Tandem. Optional to support
  // uninstrumented sims and demos
  tandem?: Tandem;
  createNode?: never;
  tandemName?: never;
} | {
  node?: never;
  tandem?: never;
  createNode: ( tandem: Tandem ) => Node;

  // If PhET-iO information is provided here, it should be tandemName that will be used to create the tandem for createNode. Optional to support
  // uninstrumented sims and demos
  tandemName?: string;
};

export default ChildComponentOptions;

/**
 * Get the nodes for the ChildComponentOptions
 * TODO: https://github.com/phetsims/sun/issues/746 should this be renamed? Should it just be a top level `export function`,
 *       or does it belong elsewhere?
 */
export function getNodes( array: ChildComponentOptions[], tandem: Tandem ): Node[] {
  return array.map( item => {
    if ( item.node ) {
      return item.node;
    }
    else {
      return item.createNode( item.tandemName ? tandem.createTandem( item.tandemName ) : Tandem.OPTIONAL );
    }
  } );
}
