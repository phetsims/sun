// Copyright 2019-2020, University of Colorado Boulder

/**
 * Data structure for an item in a ComboBox.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../phet-core/js/merge.js';
import Node from '../../scenery/js/nodes/Node.js';
import sun from './sun.js';

class ComboBoxItem {

  /**
   * @param {Node} node
   * @param {*} value
   * @param {Object} [options]
   */
  constructor( node, value, options ) {

    assert && assert( node instanceof Node, 'invalid node: ' + node );
    assert && assert( !node.accessibleContent, 'accessibleContent is set by ComboBox, use options.a11yLabel' );

    options = merge( {

      // phet-io
      tandemName: null, // {string|null} the tandem name for this item's associated Node in the combo box

      // pdom
      a11yLabel: null // {string|null} the label for this item's associated Node in the combo box

    }, options );

    // @public (read-only)
    this.node = node;
    this.value = value;
    this.tandemName = options.tandemName;
    this.a11yLabel = options.a11yLabel;
  }
}

sun.register( 'ComboBoxItem', ComboBoxItem );
export default ComboBoxItem;