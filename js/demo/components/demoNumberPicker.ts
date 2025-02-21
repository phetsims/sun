// Copyright 2022-2025, University of Colorado Boulder

/**
 * Demo for NumberPicker
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import type Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import type Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Font from '../../../../scenery/js/util/Font.js';
import Checkbox from '../../Checkbox.js';
import NumberPicker from '../../NumberPicker.js';

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