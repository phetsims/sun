// Copyright 2017-2018, University of Colorado Boulder

/**
 * IO type for RadioButtonGroupMember
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
    events: [ 'fired' ]
  } );

  sun.register( 'RadioButtonGroupMemberIO', RadioButtonGroupMemberIO );

  return RadioButtonGroupMemberIO;
} );

