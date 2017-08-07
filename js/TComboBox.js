// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var TNode = require( 'SCENERY/nodes/TNode' );
  var sun = require( 'SUN/sun' );

  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertions/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var toEventOnEmit = require( 'ifphetio!PHET_IO/toEventOnEmit' );

  /**
   * Wrapper type for phet/sun's ComboBox class.
   * @param comboBox
   * @param phetioID
   * @constructor
   */
  function TComboBox( comboBox, phetioID ) {

    // assert && assert( !!phetioValueType, 'phetioValueType should be defined' );
    assertInstanceOf( comboBox, phet.sun.ComboBox );
    TNode.call( this, comboBox, phetioID );

    toEventOnEmit(
      comboBox.startedCallbacksForComboBoxDismissedEmitter,
      comboBox.endedCallbacksForComboBoxDismissedEmitter,
      'user',
      phetioID,
      this.constructor,
      'popupHidden' );

    toEventOnEmit(
      comboBox.startedCallbacksForComboBoxPopupShownEmitter,
      comboBox.endedCallbacksForComboBoxPopupShownEmitter,
      'user',
      phetioID,
      this.constructor,
      'popupShown' );
  }

  phetioInherit( TNode, 'TComboBox', TComboBox, {}, {
    documentation: 'A traditional combo box',
    events: [ 'fired', 'popupShown', 'popupHidden' ]
  } );

  sun.register( 'TComboBox', TComboBox );

  return TComboBox;


} );

