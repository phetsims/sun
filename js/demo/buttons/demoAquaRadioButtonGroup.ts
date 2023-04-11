// Copyright 2022-2023, University of Colorado Boulder

/**
 * Demo for AquaRadioButtonGroup
 */

import StringProperty from '../../../../axon/js/StringProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import { Font, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import AquaRadioButtonGroup from '../../AquaRadioButtonGroup.js';

export default function demoAquaRadioButtonGroup( layoutBounds: Bounds2 ): Node {

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
  const horizontalGroup = new AquaRadioButtonGroup( horizontalProperty, horizontalItems, {
    orientation: 'horizontal',
    spacing: 20
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
  const verticalGroup = new AquaRadioButtonGroup( verticalProperty, verticalItems, {
    orientation: 'vertical'
  } );

  return new VBox( {
    children: [ horizontalGroup, verticalGroup ],
    spacing: 80,
    center: layoutBounds.center
  } );
}