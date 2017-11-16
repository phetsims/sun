// Copyright 2017, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );
  var sun = require( 'SUN/sun' );

  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );

  /**
   * Wrapper type for phet/sun's ComboBox class.
   * @param comboBoxItemNode
   * @param phetioID
   * @constructor
   */
  function ComboBoxItemNodeIO( comboBoxItemNode, phetioID ) {
    assert && assertInstanceOf( comboBoxItemNode, phet.sun.ComboBox.ItemNode );
    NodeIO.call( this, comboBoxItemNode, phetioID );
  }

  phetioInherit( NodeIO, 'ComboBoxItemNodeIO', ComboBoxItemNodeIO, {}, {
    documentation: 'A traditional item node for a combo box',
    events: [ 'fired' ]
  } );

  sun.register( 'ComboBoxItemNodeIO', ComboBoxItemNodeIO );

  return ComboBoxItemNodeIO;
} );