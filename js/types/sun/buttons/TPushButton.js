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
  var TVoid = require( 'PHET_IO/types/TVoid' );

  function TPushButton( button, phetioID ) {
    TNode.call( this, button, phetioID );

    // TODO: Separate wrappers for each implementation
    assertInstanceOfTypes( button, [
      phet.joist.PhetButton,
      phet.joist.HomeButton,
      phet.joist.NavigationBarScreenButton,
      phet.sun.RoundPushButton,
      phet.sun.RectangularPushButton,
      phet.scenery.Node // Menu item from Joist
    ] );

    if ( button.buttonModel ) {
      toEventOnStatic( button.buttonModel, 'CallbacksForFired', 'user', phetioID, TPushButton, 'fired' );
    }
    else {
      toEventOnStatic( button, 'CallbacksForFired', 'user', phetioID, TPushButton, 'fired' );
    }
  }

  phetioInherit( TNode, 'TPushButton', TPushButton, {
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

  phetioNamespace.register( 'TPushButton', TPushButton );

  return TPushButton;
} );