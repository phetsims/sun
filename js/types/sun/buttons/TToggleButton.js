// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOfTypes = require( 'PHET_IO/assertions/assertInstanceOfTypes' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var TNode = require( 'PHET_IO/types/scenery/nodes/TNode' );
  var toEventOnStatic = require( 'PHET_IO/events/toEventOnStatic' );

  var TToggleButton = function( valueType ) {
    assert && assert( !!valueType, 'valueType must be specified' );
    return phetioInherit( TNode, 'TToggleButton', function TToggleButtonImpl( toggleButton, phetioID ) {
      TNode.call( this, toggleButton, phetioID );
      assertInstanceOfTypes( toggleButton, [
        phet.sun.ToggleButton,
        phet.sceneryPhet.PlayPauseButton,
        phet.sun.RoundStickyToggleButton,
        phet.sun.RectangularToggleButton,
        phet.sun.RoundMomentaryButton
      ] );

      var emitter = toggleButton.toggleButtonModel || toggleButton.buttonModel;  // Handle BooleanRoundStickyToggleButton too

      // Both StickyToggleButtonModel and ToggleButtonModel send the args in this order: oldValue, newValue
      toEventOnStatic( emitter, 'CallbacksForToggled', 'user', phetioID, TToggleButton( valueType ), 'toggled', function( oldValue, newValue ) {
        return {
          oldValue: valueType.toStateObject( oldValue ),
          newValue: valueType.toStateObject( newValue )
        };
      } );
    }, {}, {
      documentation: 'A button that toggles state (in/out) when pressed',
      events: [ 'toggled' ]
    } );
  };

  phetioNamespace.register( 'TToggleButton', TToggleButton );

  return TToggleButton;
} );

