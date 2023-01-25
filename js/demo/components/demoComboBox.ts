// Copyright 2022-2023, University of Colorado Boulder

/**
 * Demo for ComboBox
 */

import ComboBox, { ComboBoxItem } from '../../ComboBox.js';
import Checkbox from '../../Checkbox.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import { Font, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import Property from '../../../../axon/js/Property.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';

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