// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'PHET_IO/assertions/assertInstanceOf' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var TNode = require( 'PHET_IO/types/scenery/nodes/TNode' );
  var toEventOnEmit = require( 'PHET_IO/events/toEventOnEmit' );

  /**
   * Wrapper type for phet/sun's RadioButton class.
   * @param {function} phetioValueType - phet-io type wrapper like TString, TNumber, etc.
   * @returns {*}
   * @constructor
   */
  function TRadioButton( phetioValueType ) {
    assert && assert( !!phetioValueType, 'phetioValueType must be defined' );
    var TRadioButtonImpl = function TRadioButtonImpl( radioButton, phetioID ) {
      assertInstanceOf( radioButton, phet.sun.RadioButton );
      TNode.call( this, radioButton, phetioID );

      var emitter = radioButton.radioButtonGroupMemberModel || radioButton; //Handle RadioButtonGroupMemberModel or AquaRadioButton
      toEventOnEmit(
        emitter.startedCallbacksForFiredEmitter,
        emitter.startedCallbacksForFiredEmitter,
        'user',
        phetioID,
        TRadioButton( phetioValueType ),
        'fired',
        function( value ) {
          return { value: phetioValueType.toStateObject( value ) };
        } );
    };
    return phetioInherit( TNode, 'TRadioButton', TRadioButtonImpl, {}, {
      documentation: 'A traditional radio button',
      events: [ 'fired' ]
    } );
  }


  phetioNamespace.register( 'TRadioButton', TRadioButton );

  return TRadioButton;
} );

