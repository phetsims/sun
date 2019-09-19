// Copyright 2018, University of Colorado Boulder

/**
 * Shows one node if the property is true or another node if the property is false. Used to indicate boolean state.
 * This is a convenience API for true/false nodes, see SelectedNode for the general case.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const sun = require( 'SUN/sun' );
  const ToggleNode = require( 'SUN/ToggleNode' );

  /**
   * @param {Node} trueNode
   * @param {Node} falseNode
   * @param {Property.<boolean>} booleanProperty
   * @param {Object} [options]
   * @constructor
   */
  function BooleanToggleNode( trueNode, falseNode, booleanProperty, options ) {
    ToggleNode.call( this, booleanProperty, [
      { value: true, node: trueNode },
      { value: false, node: falseNode }
    ], options );
  }

  sun.register( 'BooleanToggleNode', BooleanToggleNode );

  return inherit( ToggleNode, BooleanToggleNode );
} );
