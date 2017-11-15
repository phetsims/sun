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
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var sun = require( 'SUN/sun' );
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );

  /**
   * Wrapper type for phet/sun's RadioButton class.
   * @param {RadioButtonGroupMember} radioButton
   * @param {String} phetioID
   * @constructor
   */
  function TRadioButtonGroupMember( radioButton, phetioID ) {
    assert && assertInstanceOf( radioButton, phet.sun.RadioButtonGroupMember );
    NodeIO.call( this, radioButton, phetioID );
  }

  phetioInherit( NodeIO, 'TRadioButtonGroupMember', TRadioButtonGroupMember, {}, {
    documentation: 'A traditional radio button',
    events: [ 'fired' ],
    toStateObject: function( node ) { return NodeIO.toStateObject( node ); },
    fromStateObject: function( stateObject ) { return NodeIO.fromStateObject( stateObject ); },
    setValue: function( instance, stateObject ) {NodeIO.setValue( instance, stateObject );}
  } );

  sun.register( 'TRadioButtonGroupMember', TRadioButtonGroupMember );

  return TRadioButtonGroupMember;
} );

