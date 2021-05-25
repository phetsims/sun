// Copyright 2019-2021, University of Colorado Boulder

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

    assert && assert( node instanceof Node, `invalid node: ${node}` );
    assert && assert( !node.hasPDOMContent, 'pdomContent is set by ComboBox, use options.a11yLabel' );

    options = merge( {

      // {Playable|null} - Sound that will be played when this item is selected.  If set to `null` a default sound will
      // be used that is based on this item's position in the combo box list.  Playable.NO_SOUND can be used to disable.
      soundPlayer: null,

      // phet-io
      tandemName: null, // {string|null} the tandem name for this item's associated Node in the combo box

      // pdom
      a11yLabel: null // {string|null} the label for this item's associated Node in the combo box

    }, options );

    assert && assert( options.tandemName === null || typeof options.tandemName === 'string',
      `invalid tandemName: ${options.tandemName}` );
    assert && assert( !options.tandemName || options.tandemName.endsWith( 'Item' ),
      `ComboBoxItem tandemName must end with 'Item': ${options.tandemName}` );

    // @public (read-only)
    this.node = node;
    this.value = value;
    this.soundPlayer = options.soundPlayer;
    this.tandemName = options.tandemName;
    this.a11yLabel = options.a11yLabel;
  }
}

sun.register( 'ComboBoxItem', ComboBoxItem );
export default ComboBoxItem;