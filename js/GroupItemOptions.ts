// Copyright 2022-2023, University of Colorado Boulder

/**
 * For groups like radio button groups or checkbox groups, where we need to flow the tandem through to the items.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
import Tandem from '../../tandem/js/Tandem.js';
import { Node } from '../../scenery/js/imports.js';

type GroupItemOptions = {
  createNode: ( contentTandem: Tandem ) => Node;

  // If PhET-iO instrumented, tandemName must be supplied to supply the instrumentation. Optional to support
  // uninstrumented sims and demos.
  //
  // NOTE!!!: This is not necessarily the contentTandem passed to createNode. It depends on the implementation.
  // There is sometimes a swap, where this tandemName will go to an AlignBox/Checkbox parent, etc. instead of the content.
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
