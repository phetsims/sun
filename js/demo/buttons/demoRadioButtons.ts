// Copyright 2022-2023, University of Colorado Boulder

/**
 * Demo for various radio buttons.
 *
 * @author various contributors
 */

import Checkbox from '../../Checkbox.js';
import RectangularRadioButtonGroup from '../../buttons/RectangularRadioButtonGroup.js';
import Panel from '../../Panel.js';
import VerticalAquaRadioButtonGroup from '../../VerticalAquaRadioButtonGroup.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Property from '../../../../axon/js/Property.js';
import { Font, HBox, Node, Text, VBox } from '../../../../scenery/js/imports.js';

const BUTTON_FONT = new Font( { size: 16 } );

export default function demoRadioButtons( layoutBounds: Bounds2 ): Node {

  // For enabling/disabling all buttons
  const buttonsEnabledProperty = new Property( true );
  const buttonsEnabledCheckbox = new Checkbox( buttonsEnabledProperty, new Text( 'buttons enabled', {
    font: new Font( { size: 20 } )
  } ) );

  const radioGroupBaseColorProperty = new Property( 'green' );

  // demonstrate RectangularRadioButtonGroup
  const rectangularRadioButtonValues = [ 'One', 'Two', 'Three', 'Four' ];
  const rectangularRadioButtonProperty = new Property( rectangularRadioButtonValues[ 0 ] );
  rectangularRadioButtonProperty.lazyLink( value => console.log( `rectangularRadioButtonProperty.value = ${value}` ) );
  const radioButtonContent = _.map( rectangularRadioButtonValues, stringValue => {
    return {
      value: stringValue,
      createNode: () => new Text( stringValue, { font: BUTTON_FONT } ),
      label: new Text( stringValue )
    };
  } );
  const rectangularRadioButtonGroup = new RectangularRadioButtonGroup( rectangularRadioButtonProperty, radioButtonContent, {
    orientation: 'vertical',
    enabledProperty: buttonsEnabledProperty,
    radioButtonOptions: {
      baseColor: radioGroupBaseColorProperty,
      xAlign: 'center',
      yAlign: 'center',
      buttonAppearanceStrategyOptions: {
        selectedLineWidth: 4
      }
    }
  } );
  const rectangularRadioButtonPanel = new Panel( rectangularRadioButtonGroup, {
    xMargin: 10,
    yMargin: 10
  } );

  // demonstrate VerticalAquaRadioButtonGroup
  const aquaRadioButtonValues = [ 'Small', 'Medium', 'Large' ];
  const aquaRadioButtonProperty = new Property( aquaRadioButtonValues[ 0 ] );
  aquaRadioButtonProperty.lazyLink( value => console.log( `aquaRadioButtonProperty.value = ${value}` ) );
  const aquaRadioButtonGroupContent = _.map( aquaRadioButtonValues, stringValue => {
    return {
      value: stringValue,
      createNode: () => new Text( stringValue, { font: BUTTON_FONT } ),
      labelContent: stringValue
    };
  } );
  const aquaRadioButtonGroup = new VerticalAquaRadioButtonGroup( aquaRadioButtonProperty, aquaRadioButtonGroupContent, {
    spacing: 8,
    enabledProperty: buttonsEnabledProperty
  } );
  const aquaRadioButtonGroupPanel = new Panel( aquaRadioButtonGroup, {
    stroke: 'black',
    xMargin: 10,
    yMargin: 10
  } );

  return new VBox( {
    spacing: 30,
    children: [
      new HBox( {
        spacing: 15,
        children: [ rectangularRadioButtonPanel, aquaRadioButtonGroupPanel ]
      } ),
      buttonsEnabledCheckbox
    ],
    center: layoutBounds.center
  } );
}