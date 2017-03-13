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
   * @param {function} phetioValueType - phet-io type wrapper like TString, TNumber, etc.
   * @returns {*}
   * @constructor
   */
  function TRadioButton( phetioValueType ) {

    // Only active for PhET-iO, prevent false positive errors when running in other brands
    if ( phet.chipper.brand !== 'phet-io' ) {
      return;
    }
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


  sun.register( 'TRadioButton', TRadioButton );

  return TRadioButton;
} );

