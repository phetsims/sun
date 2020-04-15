// Copyright 2020, University of Colorado Boulder

/**
 * QUnit tests for EnabledNode
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import Node from '../../scenery/js/nodes/Node.js';
import Property from '../../axon/js/Property.js';
import EnabledNode from './EnabledNode.js';

QUnit.module( 'EnabledNode' );

QUnit.test( 'EnabledNode', assert => {

  class EnabledNodeClass extends Node {
    constructor( options ) {
      super( options );
      this.initializeEnabledNode( options );
    }
  }

  // mix in enabled component into a Node
  EnabledNode.mixInto( EnabledNodeClass );

  let node = new EnabledNodeClass();

  testEnabledNode( assert, node, 'For Node' );

  const disabledOpacity = .2;
  const customCursor = 'hi';
  node = new EnabledNodeClass( {
    disabledOpacity: disabledOpacity,
    cursor: customCursor
  } );

  assert.ok( node.cursor === customCursor, 'cursor should be set' );
  assert.ok( node.opacity === new Node().opacity, 'opacity should default to Node default' );
  node.enabled = false;
  assert.ok( node.cursor !== customCursor, 'enabled listener should have changed cursor' );
  assert.ok( node.opacity === disabledOpacity, 'test disabled opacity' );

  node.disposeEnabledNode();
  assert.ok( node.enabledProperty.isDisposed, 'should be disposed' );

  const myEnabledProperty = new BooleanProperty( true );
  const defaultListenerCount = myEnabledProperty.changedEmitter.getListenerCount();
  const node2 = new EnabledNodeClass( {
    enabledProperty: myEnabledProperty
  } );
  assert.ok( myEnabledProperty.changedEmitter.getListenerCount() > defaultListenerCount, 'listener count should be more since passing in enabledProperty' );

  node2.disposeEnabledNode();
  assert.ok( myEnabledProperty.changedEmitter.getListenerCount() === defaultListenerCount, 'listener count should match original' );
} );

/**
 * Test basic functionality for an object that mixes in EnabledComponent
 * @param {Object} assert - from QUnit
 * @param {Object} enabledNode - mixed in with EnabledComponent
 * @param {string} message - to tack onto assert messages
 */
function testEnabledNode( assert, enabledNode, message ) {
  assert.ok( enabledNode.enabledProperty instanceof Property, `${message}: enabledProperty should exist` );

  assert.ok( enabledNode.enabledProperty.value === enabledNode.enabled, `${message}: test getter` );

  enabledNode.enabled = false;
  assert.ok( enabledNode.enabled === false, `${message}: test setter` );
  assert.ok( enabledNode.enabledProperty.value === enabledNode.enabled, `${message}: test getter after setting` );
  assert.ok( enabledNode.enabledProperty.value === false, `${message}: test getter after setting` );
}