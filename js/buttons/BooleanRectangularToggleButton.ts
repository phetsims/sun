// Copyright 2013-2025, University of Colorado Boulder

/**
 * This toggle button uses a boolean Property and a trueNode and falseNode to display its content.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import type Property from '../../../axon/js/Property.js';
import optionize, { type EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import type StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import type Node from '../../../scenery/js/nodes/Node.js';
import Tandem from '../../../tandem/js/Tandem.js';
import BooleanToggleNode from '../BooleanToggleNode.js';
import sun from '../sun.js';
import RectangularToggleButton, { type RectangularToggleButtonOptions } from './RectangularToggleButton.js';

type SelfOptions = EmptySelfOptions;

export type BooleanRectangularToggleButtonOptions = SelfOptions & StrictOmit<RectangularToggleButtonOptions, 'content'>;

export default class BooleanRectangularToggleButton extends RectangularToggleButton<boolean> {

  private readonly disposeBooleanRectangularToggleButton: () => void;

  /**
   * @param booleanProperty
   * @param trueNode - shown when booleanProperty is true
   * @param falseNode - shown when booleanProperty is false
   * @param providedOptions?
   */
  public constructor( booleanProperty: Property<boolean>, trueNode: Node, falseNode: Node,
                      providedOptions?: BooleanRectangularToggleButtonOptions ) {

    const content = new BooleanToggleNode( booleanProperty, trueNode, falseNode );

    const options = optionize<BooleanRectangularToggleButtonOptions, SelfOptions, RectangularToggleButtonOptions>()( {
      content: content,
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( booleanProperty, false, true, options );

    this.disposeBooleanRectangularToggleButton = () => {
      content.dispose();
    };
  }

  public override dispose(): void {
    this.disposeBooleanRectangularToggleButton();
    super.dispose();
  }
}

sun.register( 'BooleanRectangularToggleButton', BooleanRectangularToggleButton );