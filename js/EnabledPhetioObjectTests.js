// Copyright 2020, University of Colorado Boulder

/**
 * QUnit tests for EnabledPhetioObject
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../axon/js/Property.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import EnabledPhetioObject from './EnabledPhetioObject.js';

QUnit.module( 'EnabledPhetioObject' );

QUnit.test( 'EnabledPhetioObject', assert => {

  class EnabledPhetioObjectClass extends PhetioObject {
    constructor( options ) {
      super( options );
      this.initializeEnabledPhetioObject( options );
    }
  }

  // mix in enabled component into a PhetioObject
  EnabledPhetioObject.mixInto( EnabledPhetioObjectClass );

  const phetioObject = new EnabledPhetioObjectClass( {
    enabledPropertyOptions: {
      phetioFeatured: true
    }
  } );
  testEnabledPhetioObject( assert, phetioObject, 'For PhetioObject' );
  assert.ok( phetioObject instanceof PhetioObject );
  assert.ok( phetioObject.enabledProperty.phetioFeatured, 'should have passed phet-io metadata through to enabledProperty' );
} );

/**
 * Test basic functionality for an object that mixes in EnabledComponent
 * @param {Object} assert - from QUnit
 * @param {Object} enabledObject - mixed in with EnabledComponent
 * @param {string} message - to tack onto assert messages
 */
function testEnabledPhetioObject( assert, enabledObject, message ) {
  assert.ok( enabledObject.enabledProperty instanceof Property, `${message}: enabledProperty should exist` );

  assert.ok( enabledObject.enabledProperty.value === enabledObject.enabled, `${message}: test getter` );

  enabledObject.enabled = false;
  assert.ok( enabledObject.enabled === false, `${message}: test setter` );
  assert.ok( enabledObject.enabledProperty.value === enabledObject.enabled, `${message}: test getter after setting` );
  assert.ok( enabledObject.enabledProperty.value === false, `${message}: test getter after setting` );
}