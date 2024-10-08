// Copyright 2022-2024, University of Colorado Boulder

/**
 * Ticks for a slider.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 *
 */

import DerivedProperty from '../../axon/js/DerivedProperty.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import Vector2 from '../../dot/js/Vector2.js';
import { Shape } from '../../kite/js/imports.js';
import Orientation from '../../phet-core/js/Orientation.js';
import { Layoutable, ManualConstraint, Node, Path, TPaint } from '../../scenery/js/imports.js';
import SliderTrack from './SliderTrack.js';
import sun from './sun.js';
import SunConstants from './SunConstants.js';

export type SliderTickOptions = {
  tickLabelSpacing?: number;
  majorTickLength?: number;
  majorTickStroke?: TPaint;
  majorTickLineWidth?: number;
  minorTickLength?: number;
  minorTickStroke?: TPaint;
  minorTickLineWidth?: number;
  setTickInitialPoint?: ( trackBounds: Bounds2, tickLength: number ) => Vector2;
  positionLabel?: ( label: Layoutable, tickBounds: Bounds2 ) => void;
};

export default class SliderTick {

  private readonly labelXProperty: TReadOnlyProperty<number>;

  public readonly tickNode: Node;

  private readonly labelManualConstraint?: ManualConstraint<Node[]>;
  private readonly labelContainer?: Node;

  // NOTE: This could be cleaned up, so we could remove ticks or do other nice things
  public constructor(
    private readonly parent: Node,
    public readonly value: number,
    private readonly label: Node | undefined,
    length: number,
    stroke: TPaint,
    lineWidth: number,
    tickOptions: Required<SliderTickOptions>,
    orientation: Orientation,
    track: SliderTrack
  ) {

    this.labelXProperty = new DerivedProperty( [ track.valueToPositionProperty ], valueToPosition => valueToPosition.evaluate( value ) );

    // ticks
    this.tickNode = new Node();
    parent.addChild( this.tickNode );

    const tickInitialPoint = tickOptions.setTickInitialPoint( track.bounds, length );
    const tickPath = new Path( new Shape()
        .moveTo( tickInitialPoint.x, tickInitialPoint.y )
        .lineTo( 0, tickInitialPoint.y - length ),
      { stroke: stroke, lineWidth: lineWidth } );

    this.labelXProperty.link( x => {
      tickPath.x = x;
    } );

    this.tickNode.addChild( tickPath );

    // label
    if ( label ) {

      this.labelContainer = new Node( {
        pickable: false
      } );
      this.tickNode.addChild( this.labelContainer );
      this.labelContainer.addChild( label );

      // For a vertical slider, rotate labels opposite the rotation of the slider, so that they appear as expected.
      if ( orientation === Orientation.VERTICAL ) {
        this.labelContainer.rotation = -SunConstants.SLIDER_VERTICAL_ROTATION;
      }

      this.labelManualConstraint = ManualConstraint.create( this.tickNode, [ tickPath, this.labelContainer ], ( tickProxy, labelProxy ) => {
        tickOptions.positionLabel( labelProxy, tickProxy.bounds );
      } );
    }
  }

  public dispose(): void {
    this.parent.removeChild( this.tickNode );
    this.labelContainer && this.labelContainer.dispose();

    this.labelXProperty.dispose();
    this.labelManualConstraint && this.labelManualConstraint.dispose();
  }
}

sun.register( 'SliderTick', SliderTick );