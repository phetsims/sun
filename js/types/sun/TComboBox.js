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
  var toEventOnStatic = require( 'PHET_IO/events/toEventOnStatic' );

  /**
   * Wrapper type for phet/sun's ComboBox class.
   * @param {function} phetioValueType - phet-io type wrapper like TString, TNumber, etc.
   * @returns {*}
   * @constructor
   */
  function TComboBox( phetioValueType ) {
    assert && assert( !!phetioValueType, 'phetioValueType should be defined' );
    var TComboBoxImpl = function TComboBoxImpl( comboBox, phetioID ) {
      assertInstanceOf( comboBox, phet.sun.ComboBox );
      TNode.call( this, comboBox, phetioID );

      toEventOnStatic( comboBox, 'CallbacksForItemFired', 'user', phetioID, TComboBox( phetioValueType ), 'fired', function( selection ) {
        return { value: phetioValueType.toStateObject( selection ) };
      } );
      toEventOnStatic( comboBox, 'CallbacksForComboBoxDismissed', 'user', phetioID, TComboBox( phetioValueType ), 'popupHidden' );
      toEventOnStatic( comboBox, 'CallbacksForComboBoxPopupShown', 'user', phetioID, TComboBox( phetioValueType ), 'popupShown' );
    };
    return phetioInherit( TNode, 'TComboBox', TComboBoxImpl, {}, {
      documentation: 'A traditional combo box',
      events: [ 'fired', 'popupShown', 'popupHidden' ]
    } );
  }

  phetioNamespace.register( 'TComboBox', TComboBox );

  return TComboBox;




} );

