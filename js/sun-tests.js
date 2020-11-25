// Copyright 2020, University of Colorado Boulder

/**
 * Unit tests for sun. Please run once in phet brand and once in brand=phet-io to cover all functionality.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import qunitStart from '../../chipper/js/sim-tests/qunitStart.js';
import merge from '../../phet-core/js/merge.js';
import Node from '../../scenery/js/nodes/Node.js';
import './AquaRadioButtonGroupTests.js';
import './AquaRadioButtonTests.js';
import './CheckboxTests.js';
import './EnabledComponentTests.js';
import './SliderTests.js';
import SunConstants from './SunConstants.js';

QUnit.test( 'Node.enabledProperty', assert => {

  class SunComponentNode extends Node {
    constructor( options ) {
      options = merge( {
        disabledOpacity: SunConstants.DISABLED_OPACITY
      }, options );
      super( options );

      this.enabledProperty.link( enabled => SunConstants.componentEnabledListener( enabled, this, { disabledOpacity: options.disabledOpacity } ) );
    }
  }

  let node = new SunComponentNode();

  const disabledOpacity = .2;
  node = new SunComponentNode( {
    disabledOpacity: disabledOpacity
  } );

  assert.ok( node.opacity === new SunComponentNode().opacity, 'opacity should default to Node default' );
  node.enabled = false;
  assert.ok( node.opacity === disabledOpacity, 'test disabled opacity' );

  node.dispose();

  // TinyProperty.isDisposed is only defined when assertions are enabled, for performance
  window.assert && assert.ok( node.enabledProperty.isDisposed, 'should be disposed' );

  const myEnabledProperty = new BooleanProperty( true );
  const defaultListenerCount = myEnabledProperty.changedEmitter.getListenerCount();
  const node2 = new SunComponentNode( {
    enabledProperty: myEnabledProperty
  } );
  assert.ok( myEnabledProperty.changedEmitter.getListenerCount() > defaultListenerCount, 'listener count should be more since passing in enabledProperty' );

  node2.dispose();
  assert.ok( myEnabledProperty.changedEmitter.getListenerCount() === defaultListenerCount, 'listener count should match original' );
} );

qunitStart();