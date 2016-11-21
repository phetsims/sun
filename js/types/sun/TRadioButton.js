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
   * @param {function} phetioValueType - phet-io type wrapper like TString, TNumber, etc.
   * @returns {*}
   * @constructor
   */
  function TRadioButton( phetioValueType ) {
    assert && assert( !!phetioValueType, 'phetioValueType must be defined' );
    var TRadioButtonImpl = function TRadioButtonImpl( radioButton, phetioID ) {
      assertInstanceOfTypes( radioButton, [ phet.sun.RadioButton ] );
      TNode.call( this, radioButton, phetioID );

      var emitter = radioButton.radioButtonGroupMemberModel || radioButton; //Handle RadioButtonGroupMemberModel or AquaRadioButton
      toEventOnStatic( emitter, 'CallbacksForFired', 'user', phetioID, TRadioButton( phetioValueType ), 'fired', function( value ) {
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

