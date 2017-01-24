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

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Tandem = require( 'TANDEM/Tandem' );
  var TandemNode = require( 'TANDEM/scenery/nodes/TandemNode' );
  var sun = require( 'SUN/sun' );

  // phet-io modules
  var TNode = require( 'ifphetio!PHET_IO/types/scenery/nodes/TNode' );

  /**
   * @param {Node} trueNode
   * @param {Node} falseNode
   * @param {Property.<boolean>} booleanProperty
   * @param {Object} [options]
   * @constructor
   */
  function ToggleNode( trueNode, falseNode, booleanProperty, options ) {

    options = _.extend( {
      tandem: Tandem.tandemRequired()
    }, options );
    TandemNode.call( this, { tandem: options.tandem.createSupertypeTandem() } );

    // align centers of the nodes, see https://github.com/phetsims/sun/issues/272
    falseNode.center = trueNode.center;

    this.addChild( falseNode );
    this.addChild( trueNode );

    booleanProperty.link( function( value ) {
      trueNode.setVisible( value );
      falseNode.setVisible( !value );
    } );

    this.mutate( options );

    options.tandem.addInstance( this, TNode );
  }

  sun.register( 'ToggleNode', ToggleNode );

  return inherit( TandemNode, ToggleNode );
} );
