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
  var sun = require( 'SUN/sun' );

  // ifphetio
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );

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
    documentation: 'A traditional combo box',
    events: [ 'popupShown', 'popupHidden' ]
  } );

  sun.register( 'ComboBoxIO', ComboBoxIO );

  return ComboBoxIO;
} );