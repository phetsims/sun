// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var TNode = require( 'SCENERY/nodes/TNode' );

  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertions/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var sun = require( 'SUN/sun' );
  var toEventOnEmit = require( 'ifphetio!PHET_IO/events/toEventOnEmit' );

  /**
   * Wrapper type for phet/sun's ComboBox class.
   * @param {function} phetioValueType - phet-io type wrapper like TString, TNumber, etc. If loaded by phet (not phet-io)
   *                                    it will be the function returned by the 'ifphetio!' plugin.
   * @returns {*}
   * @constructor
   */
  function TComboBoxItemNode( phetioValueType ) {

    /**
     *
     * @param comboBoxItemNode
     * @param phetioID
     * @constructor
     */
    var TComboBoxItemNodeImpl = function TComboBoxItemNodeImpl( comboBoxItemNode, phetioID ) {
      if ( window.phet && phet.chipper && phet.chipper.brand === 'phet-io' &&
           phet.phetio && phet.phetio.queryParameters && phet.phetio.queryParameters.phetioValidateTandems ) {
        assert && assert( !!phetioValueType, 'phetioValueType should be defined' );
      }
      assertInstanceOf( comboBoxItemNode, phet.sun.ComboBox.ItemNode );
      TNode.call( this, comboBoxItemNode, phetioID );

      toEventOnEmit( comboBoxItemNode.startedCallbacksForItemFiredEmitter, comboBoxItemNode.endedCallbacksForItemFiredEmitter, 'user', phetioID, this.constructor, 'fired', function( selection ) {
        return { value: phetioValueType.toStateObject( selection ) };
      } );
    };
    return phetioInherit( TNode, 'TComboBoxItemNode', TComboBoxItemNodeImpl, {}, {
      documentation: 'A traditional item node for a combo box',
      events: [ 'fired' ]
    } );
  }

  sun.register( 'TComboBoxItemNode', TComboBoxItemNode );

  return TComboBoxItemNode;

} );