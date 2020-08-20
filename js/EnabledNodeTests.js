// Copyright 2020, University of Colorado Boulder

/**
 * QUnit tests for EnabledNode
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import Property from '../../axon/js/Property.js';
import Range from '../../dot/js/Range.js';
import Display from '../../scenery/js/display/Display.js';
import Node from '../../scenery/js/nodes/Node.js';
import Tandem from '../../tandem/js/Tandem.js';
import EnabledNode from './EnabledNode.js';
import HSlider from './HSlider.js';

QUnit.module( 'EnabledNode' );

class EnabledNodeClass extends Node {
  constructor( options ) {
    super( options );
    this.initializeEnabledNode( options );
  }
}

// mix in enabled component into a Node
EnabledNode.mixInto( EnabledNodeClass );

QUnit.test( 'EnabledNode', assert => {

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

QUnit.test( 'EnabledNode with PDOM', assert => {

  const rootNode = new Node( { tagName: 'div' } );
  var display = new Display( rootNode ); // eslint-disable-line
  document.body.appendChild( display.domElement );

  const a11yNode = new EnabledNodeClass( {
    tagName: 'p'
  } );

  rootNode.addChild( a11yNode );
  assert.ok( a11yNode.accessibleInstances.length === 1, 'should have an instance when attached to display' );
  assert.ok( !!a11yNode.accessibleInstances[ 0 ].peer, 'should have a peer' );
  assert.ok( a11yNode.accessibleInstances[ 0 ].peer.primarySibling.getAttribute( 'aria-disabled' ) === 'false', 'should be enabled' );
  a11yNode.enabled = false;
  assert.ok( a11yNode.accessibleInstances[ 0 ].peer.primarySibling.getAttribute( 'aria-disabled' ) === 'true', 'should be enabled' );
  testEnabledNode( assert, a11yNode, 'For accessible Node' );
} );

QUnit.test( 'EnabledNode in Slider', assert => {
  let slider = new HSlider( new Property( 0 ), new Range( 0, 10 ), {
    tandem: Tandem.GENERAL.createTandem( 'mySlider' )
  } );
  testEnabledNode( assert, slider, 'For Slider' );
  slider.dispose();

  const myEnabledProperty = new BooleanProperty( true, { tandem: Tandem.GENERAL.createTandem( 'myEnabledProperty' ) } );
  slider = new HSlider( new Property( 0 ), new Range( 0, 10 ), {
    tandem: Tandem.GENERAL.createTandem( 'mySlider' ),
    enabledProperty: myEnabledProperty
  } );
  testEnabledNode( assert, slider, 'For Slider' );
  slider.dispose();
  myEnabledProperty.dispose();
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