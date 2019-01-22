// Copyright 2019, University of Colorado Boulder

/**
 * Data structure for an item in a ComboBox.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const Node = require( 'SCENERY/nodes/Node' );
  const sun = require( 'SUN/sun' );

  class ComboBoxItem {

    /**
     * @param {Node} node
     * @param {*} value
     * @param {Object} [options]
     */
    constructor( node, value, options ) {

      assert && assert( node instanceof Node, 'invalid node: ' + node );
      assert && assert( !node.accessibleContent, 'accessibleContent is set by ComboBox, use options.a11yLabel' );

      options = _.extend( {

        // phet-io
        tandemName: null, // {string|null} the tandem name for this item's associated Node in the combo box

        // a11y
        a11yLabel: null // {string|null} the label for this item's associated Node in the combo box

      }, options );

      // @public (read-only)
      this.node = node;
      this.value = value;
      this.tandemName = options.tandemName;
      this.a11yLabel = options.a11yLabel;
    }
  }

  return sun.register( 'ComboBoxItem', ComboBoxItem );
} );