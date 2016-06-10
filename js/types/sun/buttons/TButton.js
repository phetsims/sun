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
  var TNode = require( 'PHET_IO/api/scenery/nodes/TNode' );
  var toEventOnStatic = require( 'PHET_IO/events/toEventOnStatic' );
  var TVoid = require( 'PHET_IO/api/TVoid' );

  var TButton = phetioInherit( TNode, 'TButton', function( button, phetioID ) {
    TNode.call( this, button, phetioID );
    assertInstanceOfTypes( button, [
      phet.joist.PhetButton,
      phet.joist.HomeButton,
      phet.joist.NavigationBarScreenButton,
      phet.sun.RoundPushButton,
      phet.sun.RectangularPushButton,
      phet.scenery.Node // Menu item from Joist // TODO: specify this type more specifically
    ] );

    // TODO: This logic belongs elsewhere
    if ( button.buttonModel ) {
      toEventOnStatic( button.buttonModel, 'CallbacksForFired', 'user', phetioID, 'fired' );
    } else {
      toEventOnStatic( button, 'CallbacksForFired', 'user', phetioID, 'fired' );
    }
  }, {
    fire: {
      returnType: TVoid,
      parameterTypes: [],
      implementation: function() {

        // TODO: There are other button types there that this will fail, this works for TextButton/PushButtonModel
        this.instance.buttonModel.fire();
      },
      documentation: 'Fire the button\'s action, as if the button has been pressed and released'
    }
  }, {
    documentation: 'A pressable button in the simulation',
    events: [ 'fired' ]
  } );

  phetioNamespace.register( 'TButton', TButton );

  return TButton;
} );

