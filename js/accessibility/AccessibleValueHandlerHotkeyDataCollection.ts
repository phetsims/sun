// Copyright 2024-2026, University of Colorado Boulder

/**
 * The HotkeyData used for AccessibleValueHandler and its subclasses. This would ideally be inside of
 * AccessibleValueHandler but I couldn't figure out how to add public static properties to the trait pattern.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import HotkeyData from '../../../scenery/js/input/HotkeyData.js';
import { type OneKeyStrokeEntry } from '../../../scenery/js/input/KeyDescriptor.js';
import sun from '../sun.js';

const AccessibleValueHandlerHotkeyDataCollection = {

  HOME_HOTKEY_DATA: new HotkeyData( {
    keys: [ 'home' ],
    binderName: 'Set value to minimum',
    repoName: sun.name
  } ),

  END_HOTKEY_DATA: new HotkeyData( {
    keys: [ 'end' ],
    binderName: 'Set value to maximum',
    repoName: sun.name
  } ),

  PAGE_UP_HOTKEY_DATA: new HotkeyData( {
    keys: [ 'pageUp' ],
    binderName: 'Increment value by page',
    repoName: sun.name
  } ),

  PAGE_DOWN_HOTKEY_DATA: new HotkeyData( {
    keys: [ 'pageDown' ],
    binderName: 'Decrement value by page',
    repoName: sun.name
  } ),

  UP_ARROW_HOTKEY_DATA: new HotkeyData( {
    keys: [ 'arrowUp' ],
    binderName: 'Increment value by up arrow',
    repoName: sun.name
  } ),

  DOWN_ARROW_HOTKEY_DATA: new HotkeyData( {
    keys: [ 'arrowDown' ],
    binderName: 'Decrement value by down arrow',
    repoName: sun.name
  } ),

  RIGHT_ARROW_HOTKEY_DATA: new HotkeyData( {
    keys: [ 'arrowRight' ],
    binderName: 'Increment value by right arrow',
    repoName: sun.name
  } ),

  LEFT_ARROW_HOTKEY_DATA: new HotkeyData( {
    keys: [ 'arrowLeft' ],
    binderName: 'Decrement value by left arrow',
    repoName: sun.name
  } ),

  // The shift key is tracked through event metadata so be very careful if you need to change this key.
  SHIFT_HOTKEY_DATA: new HotkeyData( {
    keys: [ 'shift' ],
    binderName: 'Increment/decrement in smaller steps',
    repoName: sun.name
  } ),

  // A HotkeyData for the arrow keys, for convenient usage in keyboard help
  // dialogs.
  ARROW_KEYS_HOTKEY_DATA: new HotkeyData( {
    keys: [ 'arrowUp', 'arrowDown', 'arrowRight', 'arrowLeft' ],
    binderName: 'Increment/decrement value by arrow keys',
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