// Copyright 2013-2017, University of Colorado Boulder

/**
 * Shows one node if the property is true or another node if the property is false.
 * Used to indicate boolean state.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );

  /**
   * @param {Node} trueNode
   * @param {Node} falseNode
   * @param {Property.<boolean>} booleanProperty
   * @param {Object} [options]
   * @constructor
   */
  function ToggleNode( trueNode, falseNode, booleanProperty, options ) {

    options = _.extend( {

      // align centers of the nodes, see https://github.com/phetsims/sun/issues/2
      alignIcons: function( trueNode, falseNode ) {
        falseNode.center = trueNode.center;
      },

      tandem: Tandem.tandemRequired()
    }, options );

    options.alignIcons( trueNode, falseNode );

    Node.call( this );

    this.addChild( falseNode );
    this.addChild( trueNode );

    // initial visibility of nodes
    trueNode.setVisible( booleanProperty.get() );
    falseNode.setVisible( !booleanProperty.get() );

    booleanProperty.lazyLink( function( value ) {
      trueNode.swapVisibility( falseNode );
    } );

    this.mutate( options );
  }

  sun.register( 'ToggleNode', ToggleNode );

  return inherit( Node, ToggleNode );
} );
