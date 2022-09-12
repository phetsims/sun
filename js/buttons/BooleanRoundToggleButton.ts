// Copyright 2013-2022, University of Colorado Boulder

/**
 * This toggle button uses a boolean Property and a trueNode and falseNode to display its content.
 */

import Tandem from '../../../tandem/js/Tandem.js';
import BooleanToggleNode from '../BooleanToggleNode.js';
import sun from '../sun.js';
import RoundToggleButton, { RoundToggleButtonOptions } from './RoundToggleButton.js';
import { Node } from '../../../scenery/js/imports.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import Property from '../../../axon/js/Property.js';

type SelfOptions = EmptySelfOptions;

export type BooleanRoundToggleButtonOptions = SelfOptions & StrictOmit<RoundToggleButtonOptions, 'content'>;

class BooleanRoundToggleButton extends RoundToggleButton<boolean> {

  private readonly disposeBooleanRoundToggleButton: () => void;

  /**
   * @param booleanProperty
   * @param trueNode - shown when booleanProperty is true
   * @param falseNode - shown when booleanProperty is false
   * @param providedOptions?
   */
  public constructor( booleanProperty: Property<boolean>, trueNode: Node, falseNode: Node,
                      providedOptions?: BooleanRoundToggleButtonOptions ) {

    const options = optionize<BooleanRoundToggleButtonOptions, SelfOptions, RoundToggleButtonOptions>()( {
      content: null,
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'Button'
    }, providedOptions );

    const content = new BooleanToggleNode( booleanProperty, trueNode, falseNode, {
      tandem: options.tandem.createTandem( 'toggleNode' )
    } );
    options.content = content;

    super( booleanProperty, false, true, options );

    this.disposeBooleanRoundToggleButton = function() {
      content.dispose();
    };
  }

  public override dispose(): void {
    this.disposeBooleanRoundToggleButton();
    super.dispose();
  }
}

sun.register( 'BooleanRoundToggleButton', BooleanRoundToggleButton );
export default BooleanRoundToggleButton;