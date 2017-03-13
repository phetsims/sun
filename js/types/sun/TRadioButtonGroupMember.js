// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertions/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var phetioNamespace = require( 'ifphetio!PHET_IO/phetioNamespace' );
  var TNode = require( 'SCENERY/nodes/TNode' );
  var toEventOnEmit = require( 'ifphetio!PHET_IO/events/toEventOnEmit' );

  /**
   * Wrapper type for phet/sun's RadioButton class.
   * @param valueType
   * @returns {TRadioButtonGroupMemberImpl}
   * @constructor
   */
  function TRadioButtonGroupMember( valueType ) {
    assert && assert( !!valueType, 'valueType must be defined' );
    var TRadioButtonGroupMemberImpl = function TRadioButtonGroupMemberImpl( radioButton, phetioID ) {
      assertInstanceOf( radioButton, phet.sun.RadioButtonGroupMember );
      TNode.call( this, radioButton, phetioID );

      toEventOnEmit(
        radioButton.radioButtonGroupMemberModel.startedCallbacksForFiredEmitter,
        radioButton.radioButtonGroupMemberModel.endedCallbacksForFiredEmitter,
        'user',
        phetioID,
        TRadioButtonGroupMember( valueType ),
        'fired',
        function( value ) {
          return { value: valueType.toStateObject( value ) };
        }
      );
    };
    return phetioInherit( TNode, 'TRadioButtonGroupMember', TRadioButtonGroupMemberImpl, {}, {
      documentation: 'A traditional radio button',
      events: [ 'fired' ]
    } );
  }


  phetioNamespace.register( 'TRadioButtonGroupMember', TRadioButtonGroupMember );

  return TRadioButtonGroupMember;
} );

