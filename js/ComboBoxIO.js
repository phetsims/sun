// Copyright 2017-2020, University of Colorado Boulder

/**
 * IO Type for ComboBox
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import NodeIO from '../../scenery/js/nodes/NodeIO.js';
import IOType from '../../tandem/js/types/IOType.js';
import sun from './sun.js';

const ComboBoxIO = new IOType( 'ComboBoxIO', {
  isValidValue: v => v instanceof phet.sun.ComboBox,
  documentation: 'A combo box is composed of a push button and a listbox. The listbox contains items that represent ' +
                 'choices. Pressing the button pops up the listbox. Selecting from an item in the listbox sets the ' +
                 'value of an associated Property. The button shows the item that is currently selected.',
  supertype: NodeIO,
  events: [ 'listBoxShown', 'listBoxHidden' ]
} );

sun.register( 'ComboBoxIO', ComboBoxIO );
export default ComboBoxIO;