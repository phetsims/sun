// Copyright 2017-2018, University of Colorado Boulder

/**
 * IO type for ComboBox
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );
  var phetioInherit = require( 'TANDEM/phetioInherit' );
  var sun = require( 'SUN/sun' );

  // ifphetio
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );

  /**
   * IO type for phet/sun's ComboBox class.
   * @param {ComboBox} comboBox
   * @param {string} phetioID
   * @constructor
   */
  function ComboBoxIO( comboBox, phetioID ) {
    assert && assertInstanceOf( comboBox, phet.sun.ComboBox );
    NodeIO.call( this, comboBox, phetioID );
  }

  phetioInherit( NodeIO, 'ComboBoxIO', ComboBoxIO, {}, {
    documentation: 'A combo box is composed of a push button and a listbox. The listbox contains items that represent ' +
                   'choices. Pressing the button pops up the listbox. Selecting from an item in the listbox sets the ' +
                   'value of an associated Property. The button shows the item that is currently selected.',
    events: [ 'listBoxShown', 'listBoxHidden' ]
  } );

  sun.register( 'ComboBoxIO', ComboBoxIO );

  return ComboBoxIO;
} );