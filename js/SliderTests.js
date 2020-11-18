// Copyright 2020, University of Colorado Boulder

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
import phetioAPITest from '../../tandem/js/phetioAPITest.js';
import Tandem from '../../tandem/js/Tandem.js';
import NumberIO from '../../tandem/js/types/NumberIO.js';
import HSlider from './HSlider.js';
import SliderAPI from './SliderAPI.js';

QUnit.module( 'Slider' );

QUnit.test( 'Node.enabledProperty in Slider', assert => {
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
  assert.ok( enabledNode.enabledProperty instanceof Property || enabledNode.enabledProperty instanceof TinyProperty, `${message}: enabledProperty should exist` );

  assert.ok( enabledNode.enabledProperty.value === enabledNode.enabled, `${message}: test getter` );

  enabledNode.enabled = false;
  assert.ok( enabledNode.enabled === false, `${message}: test setter` );
  assert.ok( enabledNode.enabledProperty.value === enabledNode.enabled, `${message}: test getter after setting` );
  assert.ok( enabledNode.enabledProperty.value === false, `${message}: test getter after setting` );
}

QUnit.test( 'Slider PhET-iO API validation', assert => {
  phetioAPITest( assert, new SliderAPI(), 'slider',
    ( tandem, disposeEmitter ) => {
      const valueProperty = new Property( 0, {
        phetioType: Property.PropertyIO( NumberIO ),
        tandem: tandem.createTandem( 'myValueProperty' )
      } );
      disposeEmitter.addListener( () => valueProperty.dispose() );
      return new HSlider( valueProperty, new Range( 0, 10 ), { tandem: tandem } );
    } );
} );

QUnit.test( 'Slider PhET-iO API validation, provided enabledProperty', assert => {
  phetioAPITest( assert, new SliderAPI(), 'slider',

    ( tandem, disposeEmitter ) => {
      const valueProperty = new Property( 0, {
        phetioType: Property.PropertyIO( NumberIO ),
        tandem: tandem.createTandem( 'myValueProperty' )
      } );
      disposeEmitter.addListener( () => valueProperty.dispose() );

      const enabledProperty = new BooleanProperty( false, {
        tandem: tandem.createTandem( 'otherEnabled2Property' ),
        phetioFeatured: true
      } );
      disposeEmitter.addListener( () => enabledProperty.dispose() );

      return new HSlider( valueProperty, new Range( 0, 10 ), {
        tandem: tandem,
        enabledProperty: enabledProperty
      } );
    } );
} );