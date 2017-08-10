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
  var toEventOnEmit = require( 'ifphetio!PHET_IO/toEventOnEmit' );
  var Tandem = require( 'TANDEM/Tandem' );

  /**
   * Wrapper type for phet/sun's RadioButton class.
   * @param {RadioButton} radioButton
   * @param {String} phetioID
   * @constructor
   */
  function TRadioButton( radioButton, phetioID ) {

    if ( Tandem.validationEnabled() ) {
      assert && assert( !!radioButton.phetioValueType, 'phetioValueType must be defined' );
    }
    assertInstanceOf( radioButton, phet.sun.RadioButton );
    TNode.call( this, radioButton, phetioID );

    toEventOnEmit(
      radioButton.startedCallbacksForFiredEmitter,
      radioButton.endedCallbacksForFiredEmitter,
      'user',
      phetioID,
      this.constructor,
      'fired',
      function( value ) {
        return { value: radioButton.phetioValueType.toStateObject( value ) };
      } );
  }

  phetioInherit( TNode, 'TRadioButton', TRadioButton, {}, {
    documentation: 'A traditional radio button',
    events: [ 'fired' ]
  } );

  sun.register( 'TRadioButton', TRadioButton );

  return TRadioButton;
} );

