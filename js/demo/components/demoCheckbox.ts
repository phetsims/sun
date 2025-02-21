// Copyright 2022-2025, University of Colorado Boulder

/**
 * Demo for Checkbox
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import type Bounds2 from '../../../../dot/js/Bounds2.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import type Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Font from '../../../../scenery/js/util/Font.js';
import Checkbox from '../../Checkbox.js';

export default function demoCheckbox( layoutBounds: Bounds2 ): Node {

  const property = new BooleanProperty( true );
  const enabledProperty = new BooleanProperty( true, { phetioFeatured: true } );

  const checkbox = new Checkbox( property, new Text( 'My Awesome Checkbox', {
    font: new Font( { size: 30 } )
  } ), {
    enabledProperty: enabledProperty
  } );

  const enabledCheckbox = new Checkbox( enabledProperty, new Text( 'enabled', {
    font: new Font( { size: 20 } )
  } ) );

  return new VBox( {
    children: [ checkbox, enabledCheckbox ],
    spacing: 30,
    center: layoutBounds.center
  } );
}