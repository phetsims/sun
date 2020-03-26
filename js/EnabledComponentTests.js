// Copyright 2020, University of Colorado Boulder

/**
 * QUnit tests for EnabledComponent
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import Node from '../../scenery/js/nodes/Node.js';
import Property from '../../axon/js/Property.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import EnabledComponent from './EnabledComponent.js';

QUnit.module( 'EnabledComponent' );

QUnit.test( 'EnabledComponent into Object', assert => {

  class EnabledObject {
    constructor( options ) {
      this.initializeEnabledComponent( options );
    }
  }

  // mix in enabled component into a Node
  EnabledComponent.mixInto( EnabledObject );

  const object = new EnabledObject();
  testEnabledComponent( assert, object, 'For Object' );

  window.assert && assert.throws( () => {
    new EnabledObject( {
      enabledProperty: new BooleanProperty(),
      enabledPropertyOptions: {}
    } );
  }, 'should fail mutually exclusive options' )
} );

QUnit.test( 'EnabledComponent into PhetioObject', assert => {

  class EnabledPhetioObject extends PhetioObject {
    constructor( options ) {
      super( options );
      this.initializeEnabledComponent( options );
    }
  }

  // mix in enabled component into a Node
  EnabledComponent.mixInto( EnabledPhetioObject );

  const phetioObject = new EnabledPhetioObject( {
    enabledPropertyOptions: {
      phetioFeatured: true
    }
  } );
  testEnabledComponent( assert, phetioObject, 'For PhetioObject' );
  assert.ok( phetioObject instanceof PhetioObject );
  assert.ok( phetioObject.enabledProperty.phetioFeatured, 'should have passed phet-io metadata through to enabledProperty' );
} );

QUnit.test( 'EnabledComponent into Node', assert => {

  class EnabledNode extends Node {
    constructor( options ) {
      super( options );
      this.initializeEnabledComponent( options );
    }
  }

  // mix in enabled component into a Node
  EnabledComponent.mixInto( EnabledNode );

  let node = new EnabledNode();

  testEnabledComponent( assert, node, 'For Node' );

  const disabledOpacity = .2;
  const customCursor = 'hi';
  node = new EnabledNode( {
    disabledOpacity: disabledOpacity,
    cursor: customCursor
  } );

  assert.ok( node.cursor === customCursor, 'cursor should be set' );
  assert.ok( node.opacity === new Node().opacity, 'opacity should default to Node default' );
  node.enabled = false;
  assert.ok( node.cursor !== customCursor, 'enabled listener should have changed cursor' );
  assert.ok( node.opacity === disabledOpacity, 'test disabled opacity' );
} );

/**
 * Test basic functionality for an object that mixes in EnabledComponent
 * @param {Object} assert - from QUnit
 * @param {Object} enabledObject - mixed in with EnabledComponent
 * @param {string} message - to tack onto assert messages
 */
function testEnabledComponent( assert, enabledObject, message ) {
  assert.ok( enabledObject.enabledProperty instanceof Property, `${message}: enabledProperty should exist` );

  assert.ok( enabledObject.enabledProperty.value === enabledObject.enabled, `${message}: test getter` );

  enabledObject.enabled = false;
  assert.ok( enabledObject.enabled === false, `${message}: test setter` );
  assert.ok( enabledObject.enabledProperty.value === enabledObject.enabled, `${message}: test getter after setting` );
  assert.ok( enabledObject.enabledProperty.value === false, `${message}: test getter after setting` );
}
