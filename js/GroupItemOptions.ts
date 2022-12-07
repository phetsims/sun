// Copyright 2022, University of Colorado Boulder

/**
 * For groups like radio button groups or checkbox groups, where we need to flow the tandem through to the items.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
import Tandem from '../../tandem/js/Tandem.js';
import { Node } from '../../scenery/js/imports.js';

type GroupItemOptions = {
  createNode: ( tandem: Tandem ) => Node;

  // If PhET-iO information is provided here, it should be tandemName that will be used to create the tandem for
  // createNode. Optional to support uninstrumented sims and demos
  tandemName?: string;
};

export default GroupItemOptions;

/**
 * Get the nodes for the GroupItemOptions
 */
export function getGroupItemNodes( array: GroupItemOptions[], tandem: Tandem ): Node[] {
  return array.map( item => {

    // @ts-expect-error - runtime check to prevent prior pattern, see https://github.com/phetsims/sun/issues/794
    assert && assert( !item.node, 'Use createNode instead of node' );

    return item.createNode( item.tandemName ? tandem.createTandem( item.tandemName ) : Tandem.OPTIONAL );
  } );
}
