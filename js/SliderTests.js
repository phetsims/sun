// Copyright 2020-2021, University of Colorado Boulder

/**
 * QUnit tests for Slider
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import Property from '../../axon/js/Property.js';
import TinyProperty from '../../axon/js/TinyProperty.js';
import Range from '../../dot/js/Range.js';
import Tandem from '../../tandem/js/Tandem.js';
import HSlider from './HSlider.js';

QUnit.module( 'Slider' );

QUnit.test( 'Node.enabledProperty in Slider', assert => {
  let slider = new HSlider( new Property( 0 ), new Range( 0, 10 ), {
    tandem: Tandem.ROOT_TEST.createTandem( 'mySlider' )
  } );
  testEnabledNode( assert, slider, 'For Slider' );
  slider.dispose();

  const myEnabledProperty = new BooleanProperty( true, { tandem: Tandem.ROOT_TEST.createTandem( 'myEnabledProperty' ) } );
  slider = new HSlider( new Property( 0 ), new Range( 0, 10 ), {
    tandem: Tandem.ROOT_TEST.createTandem( 'mySlider' ),
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
  assert.ok( enabledNode.enabledProperty instanceof Property || enabledNode.enabledProperty instanceof TinyProperty, `${message}: enabledProperty should exist` );

  assert.ok( enabledNode.enabledProperty.value === enabledNode.enabled, `${message}: test getter` );

  enabledNode.enabled = false;
  assert.ok( enabledNode.enabled === false, `${message}: test setter` );
  assert.ok( enabledNode.enabledProperty.value === enabledNode.enabled, `${message}: test getter after setting` );
  assert.ok( enabledNode.enabledProperty.value === false, `${message}: test getter after setting` );
}