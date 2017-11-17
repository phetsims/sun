// Copyright 2017, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var sun = require( 'SUN/sun' );

  /**
   * Wrapper type for phet/sun's RadioButton class.
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
    toStateObject: function( node ) {
      assert && assertInstanceOf( radioButton, phet.sun.RadioButton );
      return NodeIO.toStateObject( node );
    },
    fromStateObject: function( stateObject ) { return NodeIO.fromStateObject( stateObject ); },
    setValue: function( instance, stateObject ) {
      assert && assertInstanceOf( radioButton, phet.sun.RadioButton );
      NodeIO.setValue( instance, stateObject );
    }
  } );

  sun.register( 'RadioButtonIO', RadioButtonIO );

  return RadioButtonIO;
} );

