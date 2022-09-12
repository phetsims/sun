// Copyright 2013-2022, University of Colorado Boulder

/**
 * This toggle button uses a boolean Property and a trueNode and falseNode to display its content.
 */

import Tandem from '../../../tandem/js/Tandem.js';
import BooleanToggleNode from '../BooleanToggleNode.js';
import sun from '../sun.js';
import RectangularToggleButton, { RectangularToggleButtonOptions } from './RectangularToggleButton.js';
import { Node } from '../../../scenery/js/imports.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import Property from '../../../axon/js/Property.js';

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
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'Button'
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
