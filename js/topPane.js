// Copyright 2017, University of Colorado Boulder

/**
 * A singleton type that manages a PaneLayer. As a singleton, it makes it relatively easy to add or remove nodes
 * from the layer. The LayerPane of this topPane is responsible for adding/removing nodes and listeners that
 * manage the layer.
 *
 * topPane.addToFront( node );
 * @author Jesse Greenberg
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var sun = require( 'SUN/sun' );
  var PaneLayer = require( 'SUN/PaneLayer' );

  // flag that makes sure only one instance of this exists
  var initialized = false;

  /**
   * @return {}
   * @constructor
   */
  function topPane() {
    this.initialize();
  }

  inherit( Object, topPane, {

    /**
     * Construct the singleton instance.
     */
    initialize: function() {
      assert && assert( initialized === false, 'topPane is a singleton, there should only be one instance' );
      initialized = true;

      // @public - the PaneLayer that will manage all nodes in this top layer
      this.frontLayer = new PaneLayer();
    },

    /**
     * Add a node to the back of this pane.
     *
     * @param {node} node
     */
    addToBack: function( node ) {
      this.frontLayer.addToBack( node );
    },

    /**
     * Add a node to the front of this pane.
     *
     * @param {Node} node
     */
    addToFront: function( node ) {
      this.frontLayer.addToFront( node );
    },

    /**
     * Probably required to manage layout when application is resized
     *
     * @return {}
     */
    updateLayouts: function() {
      this.frontLayer.updateLayouts();
    }
  } );

  var instance = new topPane();
  sun.register( 'topPane', instance );
  return instance;
} );
