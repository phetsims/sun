// Copyright 2022, University of Colorado Boulder

/**
 * Demo for various toggle buttons.
 *
 * @author various contributors
 */

import Checkbox from '../../Checkbox.js';
import RoundStickyToggleButton from '../../buttons/RoundStickyToggleButton.js';
import BooleanRectangularStickyToggleButton from '../../buttons/BooleanRectangularStickyToggleButton.js';
import { Color, Font, HBox, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';

export default function demoToggleButtons( layoutBounds: Bounds2 ): Node {

  // For enabling/disabling all buttons
  const buttonsEnabledProperty = new BooleanProperty( true );
  const buttonsEnabledCheckbox = new Checkbox( buttonsEnabledProperty, new Text( 'buttons enabled', {
    font: new Font( { size: 20 } )
  } ) );

  // Demonstrate using arbitrary values for toggle button.  Wrap in extra
  // quotes so it is clear that it is a string in the debugging UI.
  const roundToggleButtonProperty = new Property( 'off' );
  roundToggleButtonProperty.lazyLink( value => console.log( `roundToggleButtonProperty.value = ${value}` ) );
  const roundStickyToggleButton = new RoundStickyToggleButton( roundToggleButtonProperty, 'off', 'on', {
    baseColor: new Color( 255, 0, 0 ),
    enabledProperty: buttonsEnabledProperty
  } );

  const booleanRectangularToggleButtonProperty = new BooleanProperty( false );
  booleanRectangularToggleButtonProperty.lazyLink( value => console.log( `booleanRectangularToggleButtonProperty.value = ${value}` ) );
  const booleanRectangularStickyToggleButton = new BooleanRectangularStickyToggleButton( booleanRectangularToggleButtonProperty, {
    baseColor: new Color( 0, 200, 200 ),
    enabledProperty: buttonsEnabledProperty,
    size: new Dimension2( 50, 35 )
  } );

  return new VBox( {
    spacing: 35,
    children: [
      new HBox( {
        children: [ roundStickyToggleButton, booleanRectangularStickyToggleButton ],
        spacing: 15
      } ),
      buttonsEnabledCheckbox
    ],
    center: layoutBounds.center
  } );
}