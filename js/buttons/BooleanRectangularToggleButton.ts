// Copyright 2013-2022, University of Colorado Boulder

/**
 * This toggle button uses a boolean Property and a trueNode and falseNode to display its content.
 */

import merge from '../../../phet-core/js/merge.js';
import Tandem from '../../../tandem/js/Tandem.js';
import BooleanToggleNode from '../BooleanToggleNode.js';
import sun from '../sun.js';
import RectangularToggleButton, { RectangularToggleButtonOptions } from './RectangularToggleButton.js';
import Property from '../../../axon/js/Property.js';
import { Node } from '../../../scenery/js/imports.js';

export type BooleanRectangularToggleButtonOptions = Omit<RectangularToggleButtonOptions, 'content'>;

export default class BooleanRectangularToggleButton extends RectangularToggleButton<boolean> {

  private readonly disposeBooleanRectangularToggleButton: () => void;

  /**
   * @param trueNode
   * @param falseNode
   * @param booleanProperty
   * @param providedOptions
   */
  constructor( trueNode: Node, falseNode: Node, booleanProperty: Property<boolean>, providedOptions?: BooleanRectangularToggleButtonOptions ) {

    const options = merge( {
      content: new BooleanToggleNode( trueNode, falseNode, booleanProperty ),
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( false, true, booleanProperty, options );

    this.disposeBooleanRectangularToggleButton = () => {
      options.content && options.content.dispose();
    };
  }

  dispose() {
    this.disposeBooleanRectangularToggleButton();
    super.dispose();
  }
}

sun.register( 'BooleanRectangularToggleButton', BooleanRectangularToggleButton );
