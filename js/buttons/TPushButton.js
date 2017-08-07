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
  var TVoid = require( 'ifphetio!PHET_IO/types/TVoid' );
  var TFunctionWrapper = require( 'ifphetio!PHET_IO/types/TFunctionWrapper' );

  /**
   * Wrapper type for phet/sun's PushButton class.
   * @param button
   * @param phetioID
   * @constructor
   */
  function TPushButton( button, phetioID ) {
    TNode.call( this, button, phetioID );

    assertInstanceOfTypes( button, [
      phet.sun.RoundPushButton,
      phet.sun.RectangularPushButton
    ] );

    assert && assert( button.buttonModel.startedCallbacksForFiredEmitter, 'button models should use emitters' );
    toEventOnEmit(
      button.buttonModel.startedCallbacksForFiredEmitter,
      button.buttonModel.endedCallbacksForFiredEmitter,
      'user',
      phetioID,
      this.constructor,
      'fired'
    );
  }

  phetioInherit( TNode, 'TPushButton', TPushButton, {
    addListener: {
      returnType: TVoid,
      parameterTypes: [ TFunctionWrapper( TVoid, [] ) ],
      implementation: function( listener ) {
        this.instance.addListener( listener );
      },
      documentation: 'Adds a listener that is called back when the button is pressed.'
    },
    fire: {
      returnType: TVoid,
      parameterTypes: [],
      implementation: function() {
        this.instance.buttonModel.fire();
      },
      documentation: 'Performs the action associated with the button'
    }
  }, {
    documentation: 'A pressable button in the simulation',
    events: [ 'fired' ]
  } );

  sun.register( 'TPushButton', TPushButton );

  return TPushButton;
} );