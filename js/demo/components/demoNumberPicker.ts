// Copyright 2022, University of Colorado Boulder

/**
 * Demo for NumberPicker
 */

import NumberPicker from '../../NumberPicker.js';
import Checkbox from '../../Checkbox.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import { Font, Node, Text, VBox } from '../../../../scenery/js/imports.js';

export default function demoNumberPicker( layoutBounds: Bounds2 ): Node {

  const enabledProperty = new BooleanProperty( true );

  const numberPicker = new NumberPicker( new Property( 0 ), new Property( new Range( -10, 10 ) ), {
    font: new Font( { size: 40 } ),
    enabledProperty: enabledProperty
  } );

  const enabledCheckbox = new Checkbox( enabledProperty, new Text( 'enabled', { font: new Font( { size: 20 } ) } ) );

  return new VBox( {
    spacing: 40,
    children: [ numberPicker, enabledCheckbox ],
    center: layoutBounds.center
  } );
}