// Copyright 2022-2025, University of Colorado Boulder

/**
 * Demo for various momentary buttons.
 *
 * @author various contributors
 */

import Property from '../../../../axon/js/Property.js';
import type Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import type Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Font from '../../../../scenery/js/util/Font.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import RectangularMomentaryButton from '../../buttons/RectangularMomentaryButton.js';
import RoundMomentaryButton from '../../buttons/RoundMomentaryButton.js';
import Checkbox from '../../Checkbox.js';

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