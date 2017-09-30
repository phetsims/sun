// Copyright 2017, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var sun = require( 'SUN/sun' );
  var TNode = require( 'SCENERY/nodes/TNode' );

  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertions/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );

  /**
   * Wrapper type for phet/sun's ComboBox class.
   * @param comboBoxItemNode
   * @param phetioID
   * @constructor
   */
  function TComboBoxItemNode( comboBoxItemNode, phetioID ) {
    assertInstanceOf( comboBoxItemNode, phet.sun.ComboBox.ItemNode );
    TNode.call( this, comboBoxItemNode, phetioID );
    assert && assert( comboBoxItemNode.phetioValueType, 'Each item node must have a phetioValueType.' );
  }

  phetioInherit( TNode, 'TComboBoxItemNode', TComboBoxItemNode, {}, {
    documentation: 'A traditional item node for a combo box',
    events: [ 'fired' ]
  } );

  sun.register( 'TComboBoxItemNode', TComboBoxItemNode );

  return TComboBoxItemNode;
} );