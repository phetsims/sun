// Copyright 2020-2022, University of Colorado Boulder

/**
 * Unit tests for sun. Please run once in ?brand=phet and once in ?brand=phet-io to cover all functionality.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import qunitStart from '../../chipper/js/sim-tests/qunitStart.js';
import merge from '../../phet-core/js/merge.js';
import { Node, SceneryConstants } from '../../scenery/js/imports.js';
import './SliderTests.js';


QUnit.module( 'sun' );

QUnit.test( 'enabled/disabled appearance', assert => {

  class SunComponentNode extends Node {
    constructor( options ) {
      options = merge( {
        disabledOpacity: SceneryConstants.DISABLED_OPACITY
      }, options );
      super( options );
    }
  }

  let node = new SunComponentNode();

  const disabledOpacity = 0.2;
  node = new SunComponentNode( {
    disabledOpacity: disabledOpacity
  } );

  assert.ok( node.effectiveOpacity === new SunComponentNode().opacity, 'opacity should default to Node default' );
  node.enabled = false;
  assert.ok( node.effectiveOpacity === disabledOpacity, 'test disabled opacity' );

  node.dispose();

  // TinyProperty.isDisposed is only defined when assertions are enabled, for performance
  window.assert && assert.ok( node.enabledProperty.isDisposed, 'should be disposed' );

  const myEnabledProperty = new BooleanProperty( true );
  const defaultListenerCount = myEnabledProperty.getListenerCount();
  const node2 = new SunComponentNode( {
    enabledProperty: myEnabledProperty
  } );
  assert.ok( myEnabledProperty.getListenerCount() > defaultListenerCount, 'listener count should be more since passing in enabledProperty' );

  node2.dispose();
  assert.ok( myEnabledProperty.getListenerCount() === defaultListenerCount, 'listener count should match original' );
} );

qunitStart();