// Copyright 2013-2021, University of Colorado Boulder

/**
 * This toggle button uses a boolean Property and a trueNode and falseNode to display its content.
 */

import Tandem from '../../../tandem/js/Tandem.js';
import BooleanToggleNode from '../BooleanToggleNode.js';
import sun from '../sun.js';
import RoundToggleButton, { RoundToggleButtonOptions } from './RoundToggleButton.js';
import { Node } from '../../../scenery/js/imports.js'; // eslint-disable-line no-unused-vars
import Property from '../../../axon/js/Property.js';
import optionize from '../../../phet-core/js/optionize.js';

export type BooleanRoundToggleButtonOptions = Omit<RoundToggleButtonOptions, 'content'>;

class BooleanRoundToggleButton extends RoundToggleButton<boolean> {

  private readonly disposeBooleanRoundToggleButton: () => void;

  /**
   * @param trueNode
   * @param falseNode
   * @param booleanProperty
   * @param providedOptions
   */
  constructor( trueNode: Node, falseNode: Node, booleanProperty: Property<boolean>, providedOptions?: BooleanRoundToggleButtonOptions ) {

    const options = optionize<BooleanRoundToggleButtonOptions, {}, RoundToggleButtonOptions, 'tandem' | 'content'>( {
      content: null,
      tandem: Tandem.REQUIRED
    }, providedOptions );

    const content = new BooleanToggleNode( trueNode, falseNode, booleanProperty, {
      tandem: options.tandem.createTandem( 'toggleNode' )
    } );
    options.content = content;

    super( false, true, booleanProperty, options );

    this.disposeBooleanRoundToggleButton = function() {
      content.dispose();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeBooleanRoundToggleButton();
    super.dispose();
  }
}

sun.register( 'BooleanRoundToggleButton', BooleanRoundToggleButton );
export default BooleanRoundToggleButton;