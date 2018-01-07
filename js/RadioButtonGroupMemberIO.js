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
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var sun = require( 'SUN/sun' );

  /**
   * @param {RadioButtonGroupMember} radioButton
   * @param {String} phetioID
   * @constructor
   */
  function RadioButtonGroupMemberIO( radioButton, phetioID ) {
    assert && assertInstanceOf( radioButton, phet.sun.RadioButtonGroupMember );
    NodeIO.call( this, radioButton, phetioID );
  }

  phetioInherit( NodeIO, 'RadioButtonGroupMemberIO', RadioButtonGroupMemberIO, {}, {
    documentation: 'A traditional radio button',
    events: [ 'fired' ],
    toStateObject: function( radioButton ) {
      assert && assertInstanceOf( radioButton, phet.sun.RadioButtonGroupMember );
      return NodeIO.toStateObject( radioButton );
    },
    fromStateObject: function( stateObject ) { return NodeIO.fromStateObject( stateObject ); },
    setValue: function( radioButton, stateObject ) {
      assert && assertInstanceOf( radioButton, phet.sun.RadioButtonGroupMember );
      NodeIO.setValue( radioButton, stateObject );
    }
  } );

  sun.register( 'RadioButtonGroupMemberIO', RadioButtonGroupMemberIO );

  return RadioButtonGroupMemberIO;
} );

