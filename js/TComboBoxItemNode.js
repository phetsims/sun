// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var TNode = require( 'SCENERY/nodes/TNode' );
  var sun = require( 'SUN/sun' );

  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertions/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var toEventOnEmit = require( 'ifphetio!PHET_IO/toEventOnEmit' );

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

    toEventOnEmit( comboBoxItemNode.startedCallbacksForItemFiredEmitter, comboBoxItemNode.endedCallbacksForItemFiredEmitter, 'user', phetioID, this.constructor, 'fired', function( selection ) {
      return { value: comboBoxItemNode.phetioValueType.toStateObject( selection ) };
    } );
  }

  phetioInherit( TNode, 'TComboBoxItemNode', TComboBoxItemNode, {}, {
    documentation: 'A traditional item node for a combo box',
    events: [ 'fired' ]
  } );

  sun.register( 'TComboBoxItemNode', TComboBoxItemNode );

  return TComboBoxItemNode;

} );