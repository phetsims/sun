// Copyright 2017-2020, University of Colorado Boulder

/**
 * IO type for ComboBox
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import NodeIO from '../../scenery/js/nodes/NodeIO.js';
import ObjectIO from '../../tandem/js/types/ObjectIO.js';
import sun from './sun.js';

class ComboBoxIO extends NodeIO {}

ComboBoxIO.documentation = 'A combo box is composed of a push button and a listbox. The listbox contains items that represent ' +
                           'choices. Pressing the button pops up the listbox. Selecting from an item in the listbox sets the ' +
                           'value of an associated Property. The button shows the item that is currently selected.';
ComboBoxIO.events = [ 'listBoxShown', 'listBoxHidden' ];
ComboBoxIO.validator = { isValidValue: v => v instanceof phet.sun.ComboBox };
ComboBoxIO.typeName = 'ComboBoxIO';
ObjectIO.validateSubtype( ComboBoxIO );

sun.register( 'ComboBoxIO', ComboBoxIO );
export default ComboBoxIO;