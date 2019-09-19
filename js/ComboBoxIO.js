// Copyright 2017-2019, University of Colorado Boulder

/**
 * IO type for ComboBox
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const ObjectIO = require( 'TANDEM/types/ObjectIO' );
  const NodeIO = require( 'SCENERY/nodes/NodeIO' );
  const sun = require( 'SUN/sun' );

  class ComboBoxIO extends NodeIO {}

  ComboBoxIO.documentation = 'A combo box is composed of a push button and a listbox. The listbox contains items that represent ' +
                             'choices. Pressing the button pops up the listbox. Selecting from an item in the listbox sets the ' +
                             'value of an associated Property. The button shows the item that is currently selected.';
  ComboBoxIO.events = [ 'listBoxShown', 'listBoxHidden' ];
  ComboBoxIO.validator = { isValidValue: v => v instanceof phet.sun.ComboBox };
  ComboBoxIO.typeName = 'ComboBoxIO';
  ObjectIO.validateSubtype( ComboBoxIO );

  return sun.register( 'ComboBoxIO', ComboBoxIO );
} );