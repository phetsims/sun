// Copyright 2017-2018, University of Colorado Boulder

/**
 * IO type for RadioButton
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
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
   * @param {RadioButton} radioButton
   * @param {String} phetioID
   * @constructor
   */
  function RadioButtonIO( radioButton, phetioID ) {
    assert && assertInstanceOf( radioButton, phet.sun.RadioButton );
    NodeIO.call( this, radioButton, phetioID );
  }

  phetioInherit( NodeIO, 'RadioButtonIO', RadioButtonIO, {}, {
    documentation: 'A traditional radio button',
    events: [ 'fired' ],
    toStateObject: function( radioButton ) {
      assert && assertInstanceOf( radioButton, phet.sun.RadioButton );
      return NodeIO.toStateObject( radioButton );
    },
    fromStateObject: function( stateObject ) { return NodeIO.fromStateObject( stateObject ); },
    setValue: function( radioButton, fromStateObject ) {
      assert && assertInstanceOf( radioButton, phet.sun.RadioButton );
      NodeIO.setValue( radioButton, fromStateObject );
    }
  } );

  sun.register( 'RadioButtonIO', RadioButtonIO );

  return RadioButtonIO;
} );

