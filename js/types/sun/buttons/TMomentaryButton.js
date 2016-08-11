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

  var TMomentaryButton = function( momentaryButton, phetioID ) {
    assertInstanceOfTypes( momentaryButton, [
      phet.sun.RectangularMomentaryButton,
      phet.sun.RoundMomentaryButton
    ] );
    TNode.call( this, momentaryButton, phetioID );
    toEventOnStatic( momentaryButton.buttonModel, 'CallbacksForPressed', 'user', phetioID, TMomentaryButton, 'pressed' );
    toEventOnStatic( momentaryButton.buttonModel, 'CallbacksForReleased', 'user', phetioID, TMomentaryButton, 'released' );
    toEventOnStatic( momentaryButton.buttonModel, 'CallbacksForReleasedByDisable', 'user', phetioID, TMomentaryButton, 'releasedDisabled' );
  };

  phetioInherit( TNode, 'TMomentaryButton', TMomentaryButton, {}, {
    documentation: 'Button that performs an action while it is being pressed, and stops the action when released',
    events: [ 'pressed', 'released', 'releasedDisabled' ]
  } );


  phetioNamespace.register( 'TMomentaryButton', TMomentaryButton );

  return TMomentaryButton;
} );

