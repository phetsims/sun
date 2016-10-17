// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'PHET_IO/assertions/assertInstanceOf' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var TNode = require( 'PHET_IO/types/scenery/nodes/TNode' );
  var toEventOnStatic = require( 'PHET_IO/events/toEventOnStatic' );

  function TComboBox( valueType ) {
    assert && assert( !!valueType, 'valueType should be defined' );
    var TComboBoxImpl = function TComboBoxImpl( comboBox, phetioID ) {
      assertInstanceOf( comboBox, phet.sun.ComboBox );
      TNode.call( this, comboBox, phetioID );

      toEventOnStatic( comboBox, 'CallbacksForItemFired', 'user', phetioID, TComboBox( valueType ), 'fired', function( selection ) {
        return { value: valueType.toStateObject( selection ) };
      } );
      toEventOnStatic( comboBox, 'CallbacksForComboBoxDismissed', 'user', phetioID, TComboBox( valueType ), 'popupHidden' );
      toEventOnStatic( comboBox, 'CallbacksForComboBoxPopupShown', 'user', phetioID, TComboBox( valueType ), 'popupShown' );
    };
    return phetioInherit( TNode, 'TComboBox', TComboBoxImpl, {}, {
      documentation: 'A traditional combo box',
      events: [ 'fired', 'popupShown', 'popupHidden' ]
    } );
  }

  phetioNamespace.register( 'TComboBox', TComboBox );

  return TComboBox;
} );

