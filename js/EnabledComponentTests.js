// Copyright 2020, University of Colorado Boulder

/**
 * QUnit tests for EnabledComponent
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import Property from '../../axon/js/Property.js';
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
  testEnabledComponent( assert, object, 'default enabledProperty created' );

  object.disposeEnabledComponent();
  assert.ok( object.enabledProperty.isDisposed, 'enabledProperty should be disposed because it was not passed in' );

  // to get around the "no `new` for side effects" lint rule
  const create = () => new EnabledObject( {
    enabledProperty: new BooleanProperty( false ),
    enabledPropertyOptions: {}
  } );
  window.assert && assert.throws( () => {
    create();
  }, 'should fail mutually exclusive options' );

  const myEnabledProperty = new BooleanProperty( false );
  const passedInEnabledPropertyObject = new EnabledObject( {
    enabledProperty: myEnabledProperty
  } );
  testEnabledComponent( assert, object, 'passed in enabledProperty' );
  assert.ok( myEnabledProperty === passedInEnabledPropertyObject.enabledProperty, 'passed in should be the same' );
  passedInEnabledPropertyObject.disposeEnabledComponent();
  assert.ok( !myEnabledProperty.isDisposed, 'do not dispose my enabledProperty!' );
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
