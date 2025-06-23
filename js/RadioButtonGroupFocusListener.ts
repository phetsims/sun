// Copyright 2025, University of Colorado Boulder

/**
 * Voicing - When focus enters the group for the first time, speak the full response for the focused button.
 * When focus moves within the group, just speak the name response.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import GroupFocusListener from '../../scenery/js/accessibility/GroupFocusListener.js';
import { VoicingNode } from '../../scenery/js/accessibility/voicing/Voicing.js';
import { SpeakableResolvedResponse } from '../../utterance-queue/js/ResponsePacket.js';
import type AquaRadioButtonGroup from './AquaRadioButtonGroup.js';
import type RectangularRadioButtonGroup from './buttons/RectangularRadioButtonGroup.js';
import sun from './sun.js';
import SunStrings from './SunStrings.js';

export default class RadioButtonGroupFocusListener<T> extends GroupFocusListener {

  /**
   * @param radioButtonGroup
   * @param groupHintResponse
   * @param speakVoicingNameResponseOnFocus - If true, when focus enters the group from outside the group, speak the full response for the focused button.
   * @param groupNameResponse - Only used if speakVoicingNameResponseOnFocus is true
   */
  public constructor( radioButtonGroup: AquaRadioButtonGroup<T> | RectangularRadioButtonGroup<T>,
                      groupHintResponse: SpeakableResolvedResponse,
                      speakVoicingNameResponseOnFocus: boolean,
                      groupNameResponse?: SpeakableResolvedResponse ) {

    super( radioButtonGroup );
    this.focusTargetProperty.link( focusTarget => {
      if ( focusTarget ) {
        const targetButton = focusTarget as VoicingNode;

        // If focus lands on the group from outside the group, speak the name and hint response.
        // Otherwise, the radio buttons fire when focus moves within the group and the
        // ButtonNode will handle Voicing.
        if ( !this.focusWasInGroup ) {

          targetButton.voicingSpeakFullResponse( {

            // Combine the button name response and the group name response?
            nameResponse: speakVoicingNameResponseOnFocus ? StringUtils.fillIn( SunStrings.a11y.radioButtonGroup.combinedNameResponseStringProperty, {
              groupName: groupNameResponse,
              buttonName: targetButton.accessibleName
            } ) : targetButton.accessibleName,
            contextResponse: null,
            hintResponse: groupHintResponse
          } );
        }
      }
    } );
  }
}

sun.register( 'RadioButtonGroupFocusListener', RadioButtonGroupFocusListener );