// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOfTypes = require( 'ifphetio!PHET_IO/assertions/assertInstanceOfTypes' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var sun = require( 'SUN/sun' );
  var TNode = require( 'SCENERY/nodes/TNode' );
  var toEventOnEmit = require( 'ifphetio!PHET_IO/toEventOnEmit' );

  /**
   * Wrapper type for phet/sun's ToggleButton class.
   * @param {ToggleButton} toggleButton
   * @param {string} phetioID
   * @constructor
   */
  function TToggleButton( toggleButton, phetioID ) {
    var validateTandems = phet.phetio && phet.phetio.queryParameters.phetioValidateTandems;
    assert && assert( !!toggleButton.phetioValueType || !validateTandems, 'toggleButton.phetioValueType must be specified' );
    TNode.call( this, toggleButton, phetioID );
    assertInstanceOfTypes( toggleButton, [
      phet.sun.RectangularToggleButton,
      phet.sun.RoundStickyToggleButton,
      phet.sun.RoundToggleButton
    ] );

    // Both StickyToggleButtonModel and ToggleButtonModel send the args in this order: oldValue, newValue
    toEventOnEmit(
      toggleButton.toggleButtonModel.startedCallbacksForToggledEmitter,
      toggleButton.toggleButtonModel.endedCallbacksForToggledEmitter,
      'user', phetioID, this.constructor, 'toggled',
      function( oldValue, newValue ) {
        return {
          oldValue: toggleButton.phetioValueType.toStateObject( oldValue ),
          newValue: toggleButton.phetioValueType.toStateObject( newValue )
        };
      }
    );
  }

  phetioInherit( TNode, 'TToggleButton', TToggleButton, {}, {
    documentation: 'A button that toggles state (in/out) when pressed',
    events: [ 'toggled' ]
  } );


  sun.register( 'TToggleButton', TToggleButton );

  return TToggleButton;
} );