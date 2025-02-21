// Copyright 2022-2025, University of Colorado Boulder

/**
 * Demo for ComboBox
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import type Bounds2 from '../../../../dot/js/Bounds2.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Font from '../../../../scenery/js/util/Font.js';
import Checkbox from '../../Checkbox.js';
import ComboBox, { type ComboBoxItem } from '../../ComboBox.js';

const FONT = new Font( { size: 20 } );

export default function demoComboBox( layoutBounds: Bounds2 ): Node {

  const values = [ 'one', 'two', 'three', 'four', 'five', 'six' ];
  const items: ComboBoxItem<string>[] = [];
  values.forEach( value => {
    items.push( {
      value: value,
      createNode: () => new Text( value, { font: FONT } )
    } );
  } );

  const selectedItemProperty = new Property( values[ 0 ] );

  const listParent = new Node();

  const enabledProperty = new BooleanProperty( true );

  const comboBox = new ComboBox( selectedItemProperty, items, listParent, {
    highlightFill: 'yellow',
    listPosition: 'above',
    enabledProperty: enabledProperty
  } );

  const enabledCheckbox = new Checkbox( enabledProperty, new Text( 'enabled', { font: FONT } ) );

  const uiComponents = new VBox( {
    children: [ comboBox, enabledCheckbox ],
    spacing: 40,
    center: layoutBounds.center
  } );

  return new Node( { children: [ uiComponents, listParent ] } );
}