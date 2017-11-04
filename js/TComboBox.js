// Copyright 2017, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var sun = require( 'SUN/sun' );
  var TNode = require( 'SCENERY/nodes/TNode' );

  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );

  /**
   * Wrapper type for phet/sun's ComboBox class.
   * @param comboBox
   * @param phetioID
   * @constructor
   */
  function TComboBox( comboBox, phetioID ) {
    assert && assertInstanceOf( comboBox, phet.sun.ComboBox );
    TNode.call( this, comboBox, phetioID );
  }

  phetioInherit( TNode, 'TComboBox', TComboBox, {}, {
    documentation: 'A traditional combo box',
    events: [ 'popupShown', 'popupHidden' ]
  } );

  sun.register( 'TComboBox', TComboBox );

  return TComboBox;
} );