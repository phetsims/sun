// Copyright 2020, University of Colorado Boulder

/**
 * QUnit tests for AquaRadioButtonGroup
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../axon/js/Property.js';
import StringProperty from '../../axon/js/StringProperty.js';
import Text from '../../scenery/js/nodes/Text.js';
import phetioAPITest from '../../tandem/js/phetioAPITest.js';
import StringIO from '../../tandem/js/types/StringIO.js';
import AquaRadioButtonGroup from './AquaRadioButtonGroup.js';
import AquaRadioButtonGroupAPI from './AquaRadioButtonGroupAPI.js';

QUnit.module( 'AquaRadioButtonGroup' );

QUnit.test( 'AquaRadioButtonGroup PhET-iO API validation', assert => {
  const aquaRadioButtonGroupAPI = new AquaRadioButtonGroupAPI( [ 'oneRadioButton', 'twoRadioButton', 'threeRadioButton' ], {
    propertyOptions: {
      phetioType: Property.PropertyIO( StringIO )
    }
  } );
  phetioAPITest( assert, aquaRadioButtonGroupAPI, 'aquaRadioButtonGroup', ( tandem, disposeEmitter ) => {
    const stringProperty = new StringProperty( 'oneRadioButton', { tandem: tandem.createTandem( 'specialStringProperty' ) } );
    const items = [ {
      tandemName: 'oneRadioButton',
      node: new Text( 'oneRadioButton' ),
      value: 'oneRadioButton'
    }, {
      tandemName: 'twoRadioButton',
      node: new Text( 'twoRadioButton' ),
      value: 'twoRadioButton'
    }, {
      tandemName: 'threeRadioButton',
      node: new Text( 'threeRadioButton' ),
      value: 'threeRadioButton'
    } ];
    disposeEmitter.addListener( () => stringProperty.dispose() );
    return new AquaRadioButtonGroup( stringProperty, items, { tandem: tandem } );
  } );
} );