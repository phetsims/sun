// Copyright 2022-2025, University of Colorado Boulder

/**
 * Demo for AlignGroup
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import stepTimer from '../../../../axon/js/stepTimer.js';
import type Bounds2 from '../../../../dot/js/Bounds2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import AlignGroup from '../../../../scenery/js/layout/constraints/AlignGroup.js';
import AlignBox from '../../../../scenery/js/layout/nodes/AlignBox.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Panel from '../../Panel.js';

export default function demoAlignGroup( layoutBounds: Bounds2 ): Node {

  function highlightWrap( node: Node ): Node {
    const rect = Rectangle.bounds( node.bounds, { fill: 'rgba(0,0,0,0.25)' } );
    node.boundsProperty.lazyLink( () => {
      rect.setRectBounds( node.bounds );
    } );
    return new Node( {
      children: [
        rect,
        node
      ]
    } );
  }

  // Scheduling randomness in stepTimer on startup leads to a different number of calls in the upstream and downstream
  // sim in the playback wrapper.  This workaround uses Math.random() to avoid a mismatch in the number of dotRandom calls.
  const stepRand = () => {
    return Math.random(); // eslint-disable-line phet/bad-sim-text
  };
  const iconGroup = new AlignGroup();
  const iconRow = new HBox( {
    spacing: 10,
    children: _.range( 1, 10 ).map( () => {
      const randomRect = new Rectangle( 0, 0, dotRandom.nextDouble() * 60 + 10, dotRandom.nextDouble() * 60 + 10, {
        fill: 'black'
      } );
      stepTimer.addListener( () => {
        if ( stepRand() < 0.02 ) {
          randomRect.rectWidth = stepRand() * 60 + 10;
          randomRect.rectHeight = stepRand() * 60 + 10;
        }
      } );
      return new AlignBox( randomRect, {
        group: iconGroup,
        margin: 5
      } );
    } ).map( highlightWrap )
  } );

  const panelGroup = new AlignGroup( { matchVertical: false } );

  function randomText(): Text {
    const text = new Text( 'Test', { fontSize: 20 } );
    stepTimer.addListener( () => {
      if ( stepRand() < 0.03 ) {
        let string = '';
        while ( stepRand() < 0.94 && string.length < 20 ) {
          string += ( `${stepRand()}` ).slice( -1 );
        }
        text.string = string;
      }
    } );
    return text;
  }

  const panelRow = new VBox( {
    spacing: 10,
    children: [
      new Panel( new AlignBox( randomText(), { group: panelGroup } ) ),
      new Panel( new AlignBox( new VBox( {
        spacing: 3,
        children: [
          randomText(),
          randomText()
        ]
      } ), { group: panelGroup } ) )
    ]
  } );

  return new VBox( {
    spacing: 20,
    children: [ iconRow, panelRow ],
    center: layoutBounds.center
  } );
}