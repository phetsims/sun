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
  var sun = require( 'SUN/sun' );
  var TNode = require( 'SCENERY/nodes/TNode' );
  var toEventOnEmit = require( 'ifphetio!PHET_IO/events/toEventOnEmit' );

  /**
   * Wrapper type for phet/sun's RadioButton class.
   * @param valueType
   * @returns {TRadioButtonGroupMemberImpl}
   * @constructor
   */
  function TRadioButtonGroupMember( valueType ) {

    // Only active for PhET-iO, prevent false positive errors when running in other brands
    if ( phet.chipper.brand !== 'phet-io' ) {
      return;
    }
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


  sun.register( 'TRadioButtonGroupMember', TRadioButtonGroupMember );

  return TRadioButtonGroupMember;
} );

