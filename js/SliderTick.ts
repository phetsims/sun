// Copyright 2022, University of Colorado Boulder

/**
 * Ticks for a slider.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 *
 */

import DerivedProperty from '../../axon/js/DerivedProperty.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import { Shape } from '../../kite/js/imports.js';
import Orientation from '../../phet-core/js/Orientation.js';
import { ManualConstraint, Node, Path, TPaint } from '../../scenery/js/imports.js';
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
};

export default class SliderTick {

  private readonly labelXProperty: TReadOnlyProperty<number>;

  public readonly tickNode: Node;

  private readonly manualConstraint?: ManualConstraint<Node[]>;

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

    const tickPath = new Path( new Shape()
        .moveTo( 0, track.top )
        .lineTo( 0, track.top - length ),
      { stroke: stroke, lineWidth: lineWidth } );

    this.labelXProperty.link( x => {
      tickPath.x = x;
    } );

    this.tickNode.addChild( tickPath );

    // label
    if ( label ) {

      // For a vertical slider, rotate labels opposite the rotation of the slider, so that they appear as expected.
      if ( orientation === Orientation.VERTICAL ) {
        label.rotation = -SunConstants.SLIDER_VERTICAL_ROTATION;
      }
      this.tickNode.addChild( label );

      this.manualConstraint = ManualConstraint.create( this.tickNode, [ tickPath, label ], ( tickProxy, labelProxy ) => {
        labelProxy.centerX = tickProxy.centerX;
        labelProxy.bottom = tickProxy.top - tickOptions.tickLabelSpacing;
      } );

      label.pickable = false;
    }
  }

  public dispose(): void {
    this.parent.removeChild( this.tickNode );

    this.labelXProperty.dispose();
    this.manualConstraint && this.manualConstraint.dispose();
  }
}

sun.register( 'SliderTick', SliderTick );