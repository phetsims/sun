// Copyright 2013-2025, University of Colorado Boulder

/**
 * This toggle button uses a boolean Property and a trueNode and falseNode to display its content.
 *
 * @author Sam Reid
 */

import type Property from '../../../axon/js/Property.js';
import optionize, { type EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import type StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import type Node from '../../../scenery/js/nodes/Node.js';
import Tandem from '../../../tandem/js/Tandem.js';
import BooleanToggleNode from '../BooleanToggleNode.js';
import sun from '../sun.js';
import RoundToggleButton, { type RoundToggleButtonOptions } from './RoundToggleButton.js';

type SelfOptions = EmptySelfOptions;

export type BooleanRoundToggleButtonOptions = SelfOptions & StrictOmit<RoundToggleButtonOptions, 'content'>;

class BooleanRoundToggleButton extends RoundToggleButton<boolean> {

  private readonly disposeBooleanRoundToggleButton: () => void;

  /**
   * @param booleanProperty
   * @param trueNode - shown when booleanProperty is true
   * @param falseNode - shown when booleanProperty is false
   * @param [providedOptions]
   */
  public constructor( booleanProperty: Property<boolean>, trueNode: Node, falseNode: Node,
                      providedOptions?: BooleanRoundToggleButtonOptions ) {

    const options = optionize<BooleanRoundToggleButtonOptions, SelfOptions, RoundToggleButtonOptions>()( {
      content: null,
      tandem: Tandem.REQUIRED
    }, providedOptions );

    const toggleNode = new BooleanToggleNode( booleanProperty, trueNode, falseNode );
    options.content = toggleNode;

    super( booleanProperty, false, true, options );

    this.disposeBooleanRoundToggleButton = function() {
      toggleNode.dispose();
    };
  }

  public override dispose(): void {
    this.disposeBooleanRoundToggleButton();
    super.dispose();
  }
}

sun.register( 'BooleanRoundToggleButton', BooleanRoundToggleButton );
export default BooleanRoundToggleButton;