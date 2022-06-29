// Copyright 2022, University of Colorado Boulder

/**
 * Demo for various momentary buttons.
 *
 * @author various contributors
 */

import Checkbox from '../../Checkbox.js';
import RoundMomentaryButton from '../../buttons/RoundMomentaryButton.js';
import RectangularMomentaryButton from '../../buttons/RectangularMomentaryButton.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Property from '../../../../axon/js/Property.js';
import { Font, HBox, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';

export default function demoMomentaryButtons( layoutBounds: Bounds2 ): Node {

  // For enabling/disabling all buttons
  const buttonsEnabledProperty = new Property( true );
  const buttonsEnabledCheckbox = new Checkbox( buttonsEnabledProperty, new Text( 'buttons enabled', {
    font: new Font( { size: 20 } )
  } ), {
    tandem: Tandem.OPT_OUT
  } );

  // round
  const roundMomentaryProperty = new Property( false );
  roundMomentaryProperty.lazyLink( value => console.log( `roundMomentaryProperty.value = ${value}` ) );
  const roundMomentaryButton = new RoundMomentaryButton( roundMomentaryProperty, false, true, {
    baseColor: '#D76958',
    enabledProperty: buttonsEnabledProperty,
    tandem: Tandem.OPT_OUT
  } );

  // rectangular
  const rectangularMomentaryProperty = new Property( false );
  rectangularMomentaryProperty.lazyLink( value => console.log( `rectangularMomentaryProperty.value = ${value}` ) );
  const rectangularMomentaryButton = new RectangularMomentaryButton( rectangularMomentaryProperty, false, true, {
    baseColor: '#724C35',
    enabledProperty: buttonsEnabledProperty,
    size: new Dimension2( 50, 40 ),
    tandem: Tandem.OPT_OUT
  } );

  return new VBox( {
    spacing: 35,
    children: [
      new HBox( {
        children: [ roundMomentaryButton, rectangularMomentaryButton ],
        spacing: 15
      } ),
      buttonsEnabledCheckbox
    ],
    center: layoutBounds.center
  } );
}