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
  var Tandem = require( 'TANDEM/Tandem' );

  /**
   * Wrapper type for phet/sun's RadioButton class.
   * @param {function} phetioValueType - phet-io type wrapper like TString, TNumber, etc. If loaded by phet (not phet-io)
   *                                    it will be the function returned by the 'ifphetio!' plugin.
   * @constructor
   */
  function TRadioButton( phetioValueType ) {

    var TRadioButtonImpl = function TRadioButtonImpl( radioButton, phetioID ) {

      if ( Tandem.validationEnabled() ) {
        assert && assert( !!phetioValueType, 'phetioValueType must be defined' );
      }
      assertInstanceOf( radioButton, phet.sun.RadioButton );
      TNode.call( this, radioButton, phetioID );

      var emitter = radioButton.radioButtonGroupMemberModel || radioButton; //Handle RadioButtonGroupMemberModel or AquaRadioButton
      toEventOnEmit(
        emitter.startedCallbacksForFiredEmitter,
        emitter.startedCallbacksForFiredEmitter,
        'user',
        phetioID,
        this.constructor,
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


  sun.register( 'TRadioButton', TRadioButton );

  return TRadioButton;
} );

