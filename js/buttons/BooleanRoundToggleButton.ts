// Copyright 2013-2025, University of Colorado Boulder

/**
 * This toggle button uses a boolean Property and a trueNode and falseNode to display its content.
 *
 * @author Sam Reid
 */

import type Property from '../../../axon/js/Property.js';
import optionize, { type EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import type StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import { findStringProperty } from '../../../scenery/js/accessibility/pdom/findStringProperty.js';
import type Node from '../../../scenery/js/nodes/Node.js';
import Tandem from '../../../tandem/js/Tandem.js';
import ResponsePatternCollection from '../../../utterance-queue/js/ResponsePatternCollection.js';
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

      // For voicing, it sounds more intuitive for the context response to be spoken first. The context response
      // describes how the simulation changes, and then we speak the new name of the button.
      voicingResponsePatternCollection: ResponsePatternCollection.CONTEXT_RESPONSE_FIRST_PATTERNS,
      tandem: Tandem.REQUIRED
    }, providedOptions );

    const toggleNode = new BooleanToggleNode( booleanProperty, trueNode, falseNode );
    options.content = toggleNode;

    super( booleanProperty, false, true, options );

    // If no accessibleName is provided, the default behavior finds the accessibleName from the content Nodes.
    // If a content Node does not have text content or if you need to customize the accessibleName,
    // you can provide the accessibleNameOn and/or accessibleNameOff options.
    if ( !options.accessibleNameOn ) {
      options.accessibleNameOn = findStringProperty( trueNode );
    }
    if ( !options.accessibleNameOff ) {
      options.accessibleNameOff = findStringProperty( falseNode );
    }

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