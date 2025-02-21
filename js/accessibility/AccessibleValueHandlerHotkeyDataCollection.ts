// Copyright 2024-2025, University of Colorado Boulder

/**
 * The HotkeyData used for AccessibleValueHandler and its subclasses. This would ideally be inside of
 * AccessibleValueHandler but I couldn't figure out how to add public static properties to the trait pattern.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import HotkeyData from '../../../scenery/js/input/HotkeyData.js';
import { type OneKeyStrokeEntry } from '../../../scenery/js/input/KeyDescriptor.js';
import sun from '../sun.js';

const AccessibleValueHandlerHotkeyDataCollection = {

  HOME_HOTKEY_DATA: new HotkeyData( {
    keyStringProperties: [ new Property( 'home' ) ],
    binderName: 'Set value to minimum',
    repoName: sun.name
  } ),

  END_HOTKEY_DATA: new HotkeyData( {
    keyStringProperties: [ new Property( 'end' ) ],
    binderName: 'Set value to maximum',
    repoName: sun.name
  } ),

  PAGE_UP_HOTKEY_DATA: new HotkeyData( {
    keyStringProperties: [ new Property( 'pageUp' ) ],
    binderName: 'Increment value by page',
    repoName: sun.name
  } ),

  PAGE_DOWN_HOTKEY_DATA: new HotkeyData( {
    keyStringProperties: [ new Property( 'pageDown' ) ],
    binderName: 'Decrement value by page',
    repoName: sun.name
  } ),

  UP_ARROW_HOTKEY_DATA: new HotkeyData( {
    keyStringProperties: [ new Property( 'arrowUp' ) ],
    binderName: 'Increment value by up arrow',
    repoName: sun.name
  } ),

  DOWN_ARROW_HOTKEY_DATA: new HotkeyData( {
    keyStringProperties: [ new Property( 'arrowDown' ) ],
    binderName: 'Decrement value by down arrow',
    repoName: sun.name
  } ),

  RIGHT_ARROW_HOTKEY_DATA: new HotkeyData( {
    keyStringProperties: [ new Property( 'arrowRight' ) ],
    binderName: 'Increment value by right arrow',
    repoName: sun.name
  } ),

  LEFT_ARROW_HOTKEY_DATA: new HotkeyData( {
    keyStringProperties: [ new Property( 'arrowLeft' ) ],
    binderName: 'Decrement value by left arrow',
    repoName: sun.name
  } ),

  // The shift key is tracked through event metadata so be very careful if you need to change this key.
  SHIFT_HOTKEY_DATA: new HotkeyData( {
    keyStringProperties: [ new Property( 'shift' ) ],
    binderName: 'Increment/decrement in smaller steps',
    repoName: sun.name
  } ),

  /**
   * Returns true if the key string provided is a range key and should interact with the accessible value handler.
   */
  isRangeKey( englishKeyString: OneKeyStrokeEntry ): boolean {
    return HotkeyData.anyHaveKeyStroke( [
      AccessibleValueHandlerHotkeyDataCollection.HOME_HOTKEY_DATA,
      AccessibleValueHandlerHotkeyDataCollection.END_HOTKEY_DATA,
      AccessibleValueHandlerHotkeyDataCollection.PAGE_UP_HOTKEY_DATA,
      AccessibleValueHandlerHotkeyDataCollection.PAGE_DOWN_HOTKEY_DATA,
      AccessibleValueHandlerHotkeyDataCollection.UP_ARROW_HOTKEY_DATA,
      AccessibleValueHandlerHotkeyDataCollection.DOWN_ARROW_HOTKEY_DATA,
      AccessibleValueHandlerHotkeyDataCollection.RIGHT_ARROW_HOTKEY_DATA,
      AccessibleValueHandlerHotkeyDataCollection.LEFT_ARROW_HOTKEY_DATA
    ], englishKeyString );
  }
};

export default AccessibleValueHandlerHotkeyDataCollection;