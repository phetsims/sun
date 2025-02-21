// Copyright 2022-2025, University of Colorado Boulder

/**
 * Demo for AquaRadioButtonGroup
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import StringProperty from '../../../../axon/js/StringProperty.js';
import type Bounds2 from '../../../../dot/js/Bounds2.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import type Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Font from '../../../../scenery/js/util/Font.js';
import RectangularRadioButtonGroup from '../../buttons/RectangularRadioButtonGroup.js';

export default function demoRectangularRadioButtonGroup( layoutBounds: Bounds2 ): Node {

  const font = new Font( { size: 20 } );

  const horizontalChoices = [ 'left', 'center', 'right' ];
  const horizontalProperty = new StringProperty( horizontalChoices[ 0 ] );
  const horizontalItems = _.map( horizontalChoices,
    choice => {
      return {
        createNode: () => new Text( choice, { font: font } ),
        value: choice
      };
    } );
  const horizontalGroup = new RectangularRadioButtonGroup( horizontalProperty, horizontalItems, {
    orientation: 'horizontal'
  } );

  const verticalChoices = [ 'top', 'center', 'bottom' ];
  const verticalProperty = new StringProperty( verticalChoices[ 0 ] );
  const verticalItems = _.map( verticalChoices,
    choice => {
      return {
        createNode: () => new Text( choice, { font: font } ),
        value: choice
      };
    } );
  const verticalGroup = new RectangularRadioButtonGroup( verticalProperty, verticalItems, {
    orientation: 'vertical'
  } );

  return new VBox( {
    children: [ horizontalGroup, verticalGroup ],
    spacing: 80,
    center: layoutBounds.center
  } );
}