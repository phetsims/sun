// Copyright 2020, University of Colorado Boulder

/**
 * QUnit tests for AquaRadioButtonGroup
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import StringProperty from '../../axon/js/StringProperty.js';
import Node from '../../scenery/js/nodes/Node.js';
import phetioAPITest from '../../tandem/js/phetioAPITest.js';
import AquaRadioButton from './AquaRadioButton.js';
import AquaRadioButtonAPI from './AquaRadioButtonAPI.js';

QUnit.module( 'AquaRadioButton' );

QUnit.test( 'AquaRadioButton PhET-iO API validation', assert => {
  phetioAPITest( assert, new AquaRadioButtonAPI(), 'aquaRadioButton',
    ( tandem, disposeEmitter ) => {
      const stringProperty = new StringProperty( 'hiRadioButton', { tandem: tandem.createTandem( 'specialStringProperty' ) } );
      disposeEmitter.addListener( () => stringProperty.dispose() );
      return new AquaRadioButton( stringProperty, 'hiRadioButton', new Node(), { tandem: tandem } );
    } );
} );