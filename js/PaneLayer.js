// Copyright 2017, University of Colorado Boulder

/**
 * A layer for managing pop ups and dialogs. Responsible for adding/removing/sorting nodes.
 * 
 * @author Jesse Greenberg
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var sun = require( 'SUN/sun' );
  var Node = require( 'SCENERY/nodes/Node' );

  // constants
  function PaneLayer() {
    Node.call( this, {} );
  }

  sun.register( 'PaneLayer', PaneLayer );

  return inherit( Node, PaneLayer, {

    // add a node to the front of this layer
    addToFront: function( node ) {
      this.addChild( node );
      this.addPaneListeners( node );
    },

    //  add a node to the back of this layer
    addToBack: function( node ) {
      this.insertChild( 0, node );
      this.addPaneListeners( node );
    },

    // probably required when the sim size changes, re-position each node in the layer
    updateLayouts: function() {
      // ...
    },

    // add listeners to the node that manage layering, removal, and so on.
    // TODO: make it possible to remove listeners
    addPaneListeners: function( node ) {
      node.addInputListener( {
        down: function() {
          node.moveToFront();
        }
      } );
    }
  } );
} );
