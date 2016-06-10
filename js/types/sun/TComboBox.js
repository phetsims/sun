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
  var TNode = require( 'PHET_IO/api/scenery/nodes/TNode' );
  var toEventOnStatic = require( 'PHET_IO/events/toEventOnStatic' );

  var TComboBox = function TComboBox( valueType ) {
    return phetioInherit( TNode, 'TComboBox', function( comboBox, phetioID ) {
      assertInstanceOf( comboBox, phet.sun.ComboBox );
      TNode.call( this, comboBox, phetioID );

      toEventOnStatic( comboBox, 'CallbacksForItemFired', 'user', phetioID, 'fired', function( selection ) {
        return { value: valueType.toStateObject( selection ) };
      } );
      toEventOnStatic( comboBox, 'CallbacksForComboBoxDismissed', 'user', phetioID, 'popupHidden' );
      toEventOnStatic( comboBox, 'CallbacksForComboBoxPopupShown', 'user', phetioID, 'popupShown' );
    }, {}, {
      documentation: 'A traditional combo box',
      events: [ 'fired', 'popupShown', 'popupHidden' ]
    } );
  };

  phetioNamespace.register( 'TComboBox', TComboBox );

  return TComboBox;
} );

