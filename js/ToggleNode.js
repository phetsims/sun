// Copyright 2013-2015, University of Colorado Boulder

/**
 * Shows one node if the property is true or another node if the property is false.
 * Used to indicate boolean state.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var sun = require( 'SUN/sun' );

  /**
   * @param {Node} trueNode
   * @param {Node} falseNode
   * @param {Property.<boolean>} booleanProperty
   * @param {Object} [options]
   * @constructor
   */
  function ToggleNode( trueNode, falseNode, booleanProperty, options ) {

    Node.call( this );

    var background = Rectangle.bounds( trueNode.bounds.union( falseNode.bounds ), { visible: false } );
    this.addChild( background );

    this.addChild( falseNode );
    this.addChild( trueNode );

    booleanProperty.link( function( value ) {
      trueNode.setVisible( value );
      falseNode.setVisible( !value );
    } );

    this.mutate( options );
  }

  sun.register( 'ToggleNode', ToggleNode );

  return inherit( Node, ToggleNode );
} );
