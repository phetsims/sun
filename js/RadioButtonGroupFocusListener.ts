// Copyright 2025, University of Colorado Boulder

/**
 * Voicing - When focus enters the group for the first time, speak the full response for the focused button.
 * When focus moves within the group, just speak the name response.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import GroupFocusListener from '../../scenery/js/accessibility/GroupFocusListener.js';
import { VoicingNode } from '../../scenery/js/accessibility/voicing/Voicing.js';
import { SpeakableResolvedResponse } from '../../utterance-queue/js/ResponsePacket.js';
import type AquaRadioButtonGroup from './AquaRadioButtonGroup.js';
import type RectangularRadioButtonGroup from './buttons/RectangularRadioButtonGroup.js';
import sun from './sun.js';

export default class RadioButtonGroupFocusListener<T> extends GroupFocusListener {
  public constructor( radioButtonGroup: AquaRadioButtonGroup<T> | RectangularRadioButtonGroup<T>, voicingHintResponse: SpeakableResolvedResponse ) {

    super( radioButtonGroup );
    this.focusTargetProperty.link( focusTarget => {
      if ( focusTarget ) {
        const targetButton = focusTarget as VoicingNode;

        // If focus lands on the group from outside the group, speak the name and hint response.
        // Otherwise, the radio buttons fire when focus moves within the group and the
        // ButtonNode will handle Voicing.
        if ( !this.focusWasInGroup ) {
          targetButton.voicingSpeakFullResponse( {
            contextResponse: null,
            hintResponse: voicingHintResponse
          } );
        }
      }
    } );
  }
}

sun.register( 'RadioButtonGroupFocusListener', RadioButtonGroupFocusListener );