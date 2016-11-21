// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOfTypes = require( 'PHET_IO/assertions/assertInstanceOfTypes' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var TNode = require( 'PHET_IO/types/scenery/nodes/TNode' );
  var toEventOnStatic = require( 'PHET_IO/events/toEventOnStatic' );

  /**
   * Wrapper type for phet/sun's RadioButton class.
   * @param valueType
   * @returns {TRadioButtonGroupMemberImpl}
   * @constructor
   */
  function TRadioButtonGroupMember( valueType ) {
    assert && assert( !!valueType, 'valueType must be defined' );
    var TRadioButtonGroupMemberImpl = function TRadioButtonGroupMemberImpl( radioButton, phetioID ) {
      assertInstanceOfTypes( radioButton, [
        phet.sun.RadioButtonGroupMember
      ] );
      TNode.call( this, radioButton, phetioID );

      var emitter = radioButton.radioButtonGroupMemberModel;
      toEventOnStatic( emitter, 'CallbacksForFired', 'user', phetioID, TRadioButtonGroupMember( valueType ), 'fired', function( value ) {
        return { value: valueType.toStateObject( value ) };
      } );
    };
    return phetioInherit( TNode, 'TRadioButtonGroupMember', TRadioButtonGroupMemberImpl, {}, {
      documentation: 'A traditional radio button',
      events: [ 'fired' ]
    } );
  }


  phetioNamespace.register( 'TRadioButtonGroupMember', TRadioButtonGroupMember );

  return TRadioButtonGroupMember;
} );

