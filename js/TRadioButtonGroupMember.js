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
   * @param {function} phetioValueType - If loaded by phet (not phet-io) it will be the function returned by the
   *                                    'ifphetio!' plugin.
   * @returns {TRadioButtonGroupMemberImpl}
   * @constructor
   */
  function TRadioButtonGroupMember( phetioValueType ) {

    var TRadioButtonGroupMemberImpl = function TRadioButtonGroupMemberImpl( radioButton, phetioID ) {
      if ( window.phet && phet.chipper && phet.chipper.brand === 'phet-io' &&
           phet.phetio && phet.phetio.queryParameters && phet.phetio.queryParameters.phetioValidateTandems ) {
        assert && assert( !!phetioValueType, 'phetioValueType must be defined' );
      }
      assertInstanceOf( radioButton, phet.sun.RadioButtonGroupMember );
      TNode.call( this, radioButton, phetioID );

      toEventOnEmit(
        radioButton.radioButtonGroupMemberModel.startedCallbacksForFiredEmitter,
        radioButton.radioButtonGroupMemberModel.endedCallbacksForFiredEmitter,
        'user',
        phetioID,
        this.constructor,
        'fired',
        function( value ) {
          return { value: phetioValueType.toStateObject( value ) };
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

