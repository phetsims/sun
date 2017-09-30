// Copyright 2017, University of Colorado Boulder

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
  var Tandem = require( 'TANDEM/Tandem' );
  var TNode = require( 'SCENERY/nodes/TNode' );
  var toEventOnEmit = require( 'ifphetio!PHET_IO/toEventOnEmit' );

  /**
   * Wrapper type for phet/sun's RadioButton class.
   * @param {RadioButtonGroupMember} radioButton
   * @param {String} phetioID
   * @constructor
   */
  function TRadioButtonGroupMember( radioButton, phetioID ) {
    if ( Tandem.validationEnabled() ) {
      assert && assert( !!radioButton.phetioValueType, 'phetioValueType must be defined' );
    }
    assertInstanceOf( radioButton, phet.sun.RadioButtonGroupMember );
    TNode.call( this, radioButton, phetioID );
  }

  phetioInherit( TNode, 'TRadioButtonGroupMember', TRadioButtonGroupMember, {}, {
    documentation: 'A traditional radio button',
    events: [ 'fired' ],
    toStateObject: function( node ) { return TNode.toStateObject( node ); },
    fromStateObject: function( stateObject ) { return TNode.fromStateObject( stateObject ); },
    setValue: function( instance, stateObject ) {TNode.setValue( instance, stateObject );}
  } );

  sun.register( 'TRadioButtonGroupMember', TRadioButtonGroupMember );

  return TRadioButtonGroupMember;
} );

